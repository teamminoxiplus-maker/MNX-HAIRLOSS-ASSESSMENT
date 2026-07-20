import type { Metadata } from "next";
import { MinoxShell } from "@/components/assessment/minox-brand";
import { LandingClient } from "@/components/assessment/landing-client";
import { DISCLAIMER, REVIEWED_BY } from "@/lib/assessment/copy";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Free Hair Loss Assessment — MINOXIPLUS",
  description:
    "In under 2 minutes, find out your hair loss stage, what's driving it, and what to do next.",
};

// Screen 0 — Landing (spec §7). QR codes land here. Must never 404 and must
// work with no query param. Dark premium "screening" design.
export default function AssessmentLanding() {
  const features = [
    { icon: "🩺", label: "Clinically designed questions" },
    { icon: "🤖", label: "AI-powered analysis" },
    { icon: "🆓", label: "Free — no strings" },
    { icon: "🔒", label: "Your answers stay private" },
  ];

  return (
    <MinoxShell>
      <div className="pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Free Hair Loss Screening
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-[1.1] text-white">
          Do You Actually{" "}
          <span className="italic text-emerald-400">Have Hair Loss?</span>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
          Most people notice something&apos;s off but don&apos;t know how serious
          it is, what&apos;s causing it, or when to act. This quick assessment
          gives you a real answer.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
          Answer honestly. In under 2 minutes you&apos;ll know your hair loss
          stage, what&apos;s driving it, and what to do next.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {features.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="text-xl" aria-hidden>
                {f.icon}
              </div>
              <p className="mt-2 text-sm font-medium leading-snug text-slate-200">
                {f.label}
              </p>
            </div>
          ))}
        </div>

        <Suspense>
          <LandingClient />
        </Suspense>

        <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
          {REVIEWED_BY} · Not a medical diagnosis — a guide to the right routine.
        </p>

        <p className="mt-8 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-slate-600">
          {DISCLAIMER}
        </p>
      </div>
    </MinoxShell>
  );
}
