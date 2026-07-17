import type { Metadata } from "next";
import { MinoxShell } from "@/components/assessment/minox-brand";
import { LandingClient } from "@/components/assessment/landing-client";
import { DISCLAIMER, REVIEWED_BY } from "@/lib/assessment/copy";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Free Hair Loss Assessment — MINOXIPLUS",
  description:
    "Takes 90 seconds. Answer a few questions to find out what kind of hair concern you have — and the right routine for you.",
};

// Screen 0 — Landing (spec §7). QR codes land here. Must never 404 and must
// work with no query param.
export default function AssessmentLanding() {
  return (
    <MinoxShell>
      <div className="pt-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
          Free Hair Loss Assessment
        </p>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight text-slate-900">
          Free Hair Loss Assessment
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Takes 90 seconds. Answer a few questions and find out what kind of
          hair concern you have — and the right routine for you.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
          <span aria-hidden>✔</span> {REVIEWED_BY}
        </div>

        <Suspense>
          <LandingClient />
        </Suspense>

        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          This is not a medical diagnosis. It&apos;s a guide to the right routine.
        </p>
      </div>

      <ul className="mt-8 space-y-2 text-sm text-slate-600">
        {[
          "12 quick questions, one at a time",
          "No download, no login",
          "A personalized routine at the end",
        ].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-700" aria-hidden>
              ●
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <p className="mt-10 border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-400">
        {DISCLAIMER}
      </p>
    </MinoxShell>
  );
}
