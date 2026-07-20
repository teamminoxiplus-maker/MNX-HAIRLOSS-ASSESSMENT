import { NextResponse } from "next/server";
import { submitSchema } from "@/lib/assessment/schema";
import { assessmentDb } from "@/lib/assessment/persist";
import { runEngine } from "@/lib/assessment/engine";
import { generateAnalysis } from "@/lib/assessment/ai";
import { resultToken } from "@/lib/assessment/token";
import { normalizePhone } from "@/lib/assessment/phone";
import { sendResultEmail } from "@/lib/assessment/email";
import { rateLimit } from "@/lib/assessment/ratelimit";
import { deviceType } from "@/lib/assessment/attribution";
import { clientIp, hashIp } from "@/lib/assessment/attribution-server";

export const runtime = "nodejs";

// Final submit (spec §7 step 7). classify → persist → token → email.
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  // Spec §14: 5 submits / hour / IP.
  const rl = await rateLimit(`submit:${ip ?? "anon"}`, 5, 3600);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Some answers are missing or invalid.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Honeypot (spec §14): a filled hidden field = bot. Pretend success, drop it.
  if (d.company && d.company.length > 0) {
    return NextResponse.json({ token: resultToken() });
  }

  const phone = normalizePhone(d.contact.phone);
  if (!phone) {
    return NextResponse.json(
      { error: "Invalid PH mobile number." },
      { status: 400 },
    );
  }

  const result = runEngine(d.answers);
  const token = resultToken();

  // AI-powered interpretation — prose only, derived from the already-gated
  // engine result. Fails safe to null (static copy) and never blocks the submit.
  const aiAnalysis = await generateAnalysis(d.answers, result);

  try {
    const db = assessmentDb();
    const { error } = await db.from("assessments").upsert(
      {
        session_id: d.session_id,
        result_token: token,
        status: "completed",
        completed_at: new Date().toISOString(),
        full_name: d.contact.full_name,
        email: d.contact.email,
        phone,
        consent_privacy: d.contact.consent_privacy,
        consent_marketing: d.contact.consent_marketing ?? false,
        answers: d.answers,
        concern: result.concern,
        severity: result.severity,
        flags: result.flags,
        recommended_products: result.recommended_products,
        referral_required: result.referral_required,
        ai_analysis: aiAnalysis,
        src: d.src,
        utm_source: d.utm_source,
        utm_medium: d.utm_medium,
        utm_campaign: d.utm_campaign,
        referrer: d.referrer,
        device_type: deviceType(req.headers.get("user-agent")),
        ip_hash: hashIp(ip),
      },
      { onConflict: "session_id" },
    );

    if (error) {
      return NextResponse.json(
        { error: "Could not save the result. Please try again." },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Could not save the result. Please try again." },
      { status: 500 },
    );
  }

  // Result email — non-blocking failure (spec §9). Never fails the submit.
  await sendResultEmail({
    to: d.contact.email,
    fullName: d.contact.full_name,
    result,
    token,
    aiAnalysis,
  });

  return NextResponse.json({ token });
}
