// AI-powered interpretation of an assessment result (spec §9.5 claim rules).
//
// PROSE ONLY. The deterministic engine (engine.ts) and its safety gates stay
// the sole authority on concern, severity, recommended products, and referral.
// The model never picks a product, a dose, or a safety outcome — it only writes
// a short, empathetic explanation of the result the engine already produced.
//
// Fails safe: if the API key is unset, the call errors/times out, or the output
// trips the claim-rule filter, this returns null and the result page + email
// fall back to the static copy. The submit itself never fails on this.
import type { Answers, EngineResult } from "./types";
import { CONCERN_COPY, SEVERITY_COPY } from "./copy";

const ENDPOINT = "https://api.anthropic.com/v1/messages";

// House rules (spec §9.5) baked into the system prompt. The model is told the
// outcome is already fixed — its only job is to explain it, never to decide it.
const SYSTEM = `You write a short, warm interpretation for a MINOXIPLUS free hair-loss self-assessment. A deterministic rules engine has ALREADY decided the outcome you are given. Your only job is to explain that outcome in plain, encouraging English.

STRICT RULES:
- 2 to 3 sentences, about 60 words maximum. Write in the second person ("you", "your").
- NEVER use the words: cure, guaranteed, permanent, 100%, diagnosis, or diagnose.
- Use hedged language: "likely", "based on your answers", "may".
- Do NOT name or recommend any specific product, brand, ingredient, or dosage — the app lists the routine separately.
- Do NOT contradict, upgrade, or downgrade the given concern or severity, and never imply it is more or less serious than stated.
- If a consultation is indicated, gently encourage speaking with the team or a doctor first; do not push products.
- No emojis, no markdown, no lists, no headings. Plain sentences only. Do not address the person by name.`;

// Non-global for stateless .test(); the same source is reused for a global
// scrub only if we ever choose to redact instead of reject.
const BANNED = /\b(cured?|cures|guaranteed?|permanent(ly)?|100%|diagnos(is|e|ed))\b/i;

export async function generateAnalysis(
  a: Answers,
  result: EngineResult,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const cc = CONCERN_COPY[result.concern];
  const sev = SEVERITY_COPY[result.severity];

  const facts = [
    `Concern (fixed, do not change): ${cc.label}`,
    `Severity (fixed, do not change): ${sev.label}`,
    `Consultation-only result: ${result.referral_required ? "yes" : "no"}`,
    `Sex: ${a.sex}`,
    `Age band: ${a.age_band}`,
    `How long the hair loss has been noticed: ${a.duration}`,
    `Where the thinning shows most: ${a.pattern}`,
    `Daily shedding level: ${a.shedding}`,
    `Scalp condition: ${a.scalp.join(", ")}`,
  ].join("\n");

  const user = `Write the interpretation for this result. Weave the details into 2-3 natural sentences — do not echo these labels as a list.\n\n${facts}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
        max_tokens: 300,
        system: SYSTEM,
        messages: [{ role: "user", content: user }],
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("")
      .trim();

    // Safety net: reject anything that trips the claim rules rather than risk
    // storing/emailing a non-compliant line — the static copy takes over.
    if (text.length === 0 || BANNED.test(text)) return null;
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
