"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QUESTIONS, FINISH_FIELDS, withDefaults } from "@/lib/assessment/questions";
import { answersSchema, contactSchema } from "@/lib/assessment/schema";
import {
  clearSession,
  getAnswers,
  getAttribution,
  getKioskLoc,
  getSessionId,
  logEvent,
} from "@/lib/assessment/session";
import type { AgeBand, MedicalFlag, PartialAnswers, Sex } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

const SEX_Q = FINISH_FIELDS.find((f) => f.id === "sex")!;
const AGE_Q = FINISH_FIELDS.find((f) => f.id === "age_band")!;
const MED_Q = FINISH_FIELDS.find((f) => f.id === "medical_flags")!;

// Final step (spec §7) — result delivery + the safety/demographic details the
// engine needs (sex, age, medical flags). Kept off the 7-question flow so the
// assessment stays 7 questions while every safety gate still fires. Reads the 7
// answers from localStorage, merges the finish fields, validates the full
// answer set, and posts to /api/assessment/submit.
export function ContactForm() {
  const router = useRouter();
  const kiosk = useSearchParams().get("kiosk") === "1";

  const [answers, setAnswersState] = useState<PartialAnswers | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    consent_privacy: false,
    consent_marketing: false,
    company: "", // honeypot
  });
  const [sex, setSex] = useState<Sex | "">("");
  const [ageBand, setAgeBand] = useState<AgeBand | "">("");
  const [medical, setMedical] = useState<MedicalFlag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const a = getAnswers(kiosk);
    logEvent(getSessionId(kiosk), "contact", "view");
    // Guard: if any of the 7 questions is unanswered, send them back to fill it.
    const firstMissing = QUESTIONS.find(
      (q) =>
        a[q.id] === undefined ||
        (Array.isArray(a[q.id]) && (a[q.id] as unknown[]).length === 0),
    );
    if (firstMissing) {
      const q = kiosk ? "?kiosk=1" : "";
      router.replace(`/assessment/q/${firstMissing.step}${q}`);
      return;
    }
    setAnswersState(a);
  }, [router, kiosk]);

  // Exclusive-value multi toggle for the safety checkboxes ("None of these").
  const toggleMedical = (value: MedicalFlag) => {
    setMedical((prev) => {
      if (value === "none") return ["none"];
      const withoutNone = prev.filter((v) => v !== "none");
      return withoutNone.includes(value)
        ? withoutNone.filter((v) => v !== value)
        : [...withoutNone, value];
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!answers) return;

    if (!sex) return setError("Please select your sex.");
    if (!ageBand) return setError("Please select your age.");
    if (medical.length === 0)
      return setError("Please answer the quick safety question.");

    const contact = contactSchema.safeParse({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      consent_privacy: form.consent_privacy,
      consent_marketing: form.consent_marketing,
    });
    if (!contact.success) {
      setError(contact.error.issues[0]?.message ?? "Please check the fields.");
      return;
    }

    // Merge the finish fields + neutral defaults, then validate the full set.
    const merged = withDefaults({
      ...answers,
      sex,
      age_band: ageBand,
      medical_flags: medical,
    });
    const full = answersSchema.safeParse(merged);
    if (!full.success) {
      setError("Some details are missing. Please review and try again.");
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
          answers: full.data,
          contact: {
            full_name: form.full_name,
            email: form.email,
            phone: form.phone,
            consent_privacy: form.consent_privacy,
            consent_marketing: form.consent_marketing,
          },
          company: form.company,
          src: kiosk ? `kiosk_${getKioskLoc() ?? "default"}` : attr?.src,
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
  const chip = (active: boolean) =>
    cn(
      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "border-emerald-400 bg-emerald-500/10 text-emerald-50"
        : "border-white/12 bg-white/[0.03] text-slate-200 hover:border-white/25",
    );

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-medium text-white">
          Where should we send your result?
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Last step — plus a few quick details so we recommend safely.
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

      {/* Quick details — needed for safe recommendations */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Quick details for safe recommendations
        </p>

        <div>
          <label className="text-sm font-medium text-slate-300">Sex</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {SEX_Q.options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setSex(o.value as Sex)}
                className={chip(sex === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300">Age</label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {AGE_Q.options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setAgeBand(o.value as AgeBand)}
                className={chip(ageBand === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300">
            {MED_Q.title}
          </label>
          <p className="text-xs text-slate-500">Choose all that apply.</p>
          <div className="mt-1.5 space-y-2">
            {MED_Q.options.map((o) => {
              const active = medical.includes(o.value as MedicalFlag);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggleMedical(o.value as MedicalFlag)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-50"
                      : "border-white/12 bg-white/[0.03] text-slate-200 hover:border-white/25",
                  )}
                >
                  <span>{o.label}</span>
                  <span
                    className={cn(
                      "ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                      active
                        ? "border-emerald-400 bg-emerald-500 text-slate-950"
                        : "border-white/25",
                    )}
                    aria-hidden
                  >
                    {active ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
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
