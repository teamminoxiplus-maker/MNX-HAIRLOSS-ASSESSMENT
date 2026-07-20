"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QUESTIONS, withDefaults } from "@/lib/assessment/questions";
import { answersSchema, contactSchema } from "@/lib/assessment/schema";
import {
  clearSession,
  getAnswers,
  getAttribution,
  getKioskLoc,
  getSessionId,
  logEvent,
} from "@/lib/assessment/session";
import type { Answers } from "@/lib/assessment/types";

// Screen 13 — contact gate (spec §7). Reads the completed answer set from
// localStorage, validates the lead fields with the shared Zod schema, and posts
// to /api/assessment/submit.
export function ContactForm() {
  const router = useRouter();
  const kiosk = useSearchParams().get("kiosk") === "1";

  const [answers, setAnswersState] = useState<Answers | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    consent_privacy: false,
    consent_marketing: false,
    company: "", // honeypot
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Back-fill neutral defaults for the engine-read fields the 7-question
    // flow doesn't ask, so the completed set validates against the full schema.
    const a = withDefaults(getAnswers(kiosk));
    logEvent(getSessionId(kiosk), "contact", "view");
    // Guard: if any asked question is unanswered, send them back to fill it.
    const parsed = answersSchema.safeParse(a);
    if (!parsed.success) {
      const firstMissing = QUESTIONS.find(
        (q) => a[q.id] === undefined || (Array.isArray(a[q.id]) && (a[q.id] as unknown[]).length === 0),
      );
      const q = kiosk ? "?kiosk=1" : "";
      router.replace(`/assessment/q/${firstMissing?.step ?? 1}${q}`);
      return;
    }
    setAnswersState(parsed.data);
  }, [router, kiosk]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!answers) return;

    const parsed = contactSchema.safeParse({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      consent_privacy: form.consent_privacy,
      consent_marketing: form.consent_marketing,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the fields.");
      return;
    }

    setSubmitting(true);
    const attr = kiosk ? null : getAttribution();
    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: getSessionId(kiosk),
          answers,
          contact: {
            full_name: form.full_name,
            email: form.email,
            phone: form.phone,
            consent_privacy: form.consent_privacy,
            consent_marketing: form.consent_marketing,
          },
          company: form.company,
          src: kiosk
            ? `kiosk_${getKioskLoc() ?? "default"}`
            : attr?.src,
          utm_source: attr?.utm_source,
          utm_medium: attr?.utm_medium,
          utm_campaign: attr?.utm_campaign,
          referrer: attr?.referrer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      logEvent(getSessionId(kiosk), "result", "view");
      const q = kiosk ? "?kiosk=1" : "";
      if (!kiosk) clearSession();
      router.push(`/assessment/result/${data.token}${q}`);
    } catch {
      setError("No connection. Please try again.");
      setSubmitting(false);
    }
  };

  const inputCls =
    "mt-1 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-3 text-[15px] text-white placeholder:text-slate-500 outline-none focus:border-emerald-400";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl font-medium text-white">
          Where should we send your result?
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Just this one step. We&apos;ll send your personalized routine.
        </p>
      </div>

      {/* honeypot — hidden from users, catches bots (spec §14) */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Company
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-300">Full name</label>
        <input
          className={inputCls}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          autoComplete="name"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300">Email</label>
        <input
          type="email"
          inputMode="email"
          className={inputCls}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300">Mobile number</label>
        <input
          type="tel"
          inputMode="tel"
          placeholder="09XXXXXXXXX"
          className={inputCls}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          autoComplete="tel"
          required
        />
      </div>

      <label className="flex items-start gap-2.5 text-sm text-slate-300">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5"
          checked={form.consent_privacy}
          onChange={(e) => setForm({ ...form, consent_privacy: e.target.checked })}
        />
        <span>
          I agree to the{" "}
          <a href="/assessment/privacy" className="text-emerald-400 underline">
            Privacy Policy
          </a>{" "}
          and to the processing of my answers for my hair assessment.
        </span>
      </label>
      <label className="flex items-start gap-2.5 text-sm text-slate-300">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5"
          checked={form.consent_marketing}
          onChange={(e) => setForm({ ...form, consent_marketing: e.target.checked })}
        />
        <span>I&apos;d like to receive tips and promos from MINOXIPLUS.</span>
      </label>

      {error && <p className="text-sm font-medium text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !answers}
        className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-base font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
        style={{ minHeight: 52 }}
      >
        {submitting ? "One moment…" : "Show My Result"}
      </button>
    </form>
  );
}
