import { cookies } from "next/headers";
import { Suspense } from "react";
import type { Metadata } from "next";
import { MinoxShell } from "@/components/assessment/minox-brand";
import { LandingClient } from "@/components/assessment/landing-client";
import { PinGate } from "./pin-gate";
import { REVIEWED_BY } from "@/lib/assessment/copy";

export const metadata: Metadata = {
  title: "MINOXIPLUS Kiosk",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

// Kiosk mode (spec §13): PIN-gated, in-store tablet flow with auto-reset.
export default function KioskPage() {
  const unlocked = cookies().get("kiosk_unlocked")?.value === "1";

  if (!unlocked) {
    return (
      <MinoxShell>
        <div className="pt-6">
          <h1 className="text-xl font-extrabold text-slate-900">Kiosk Mode</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter the PIN to start the kiosk session.
          </p>
          <div className="mt-6">
            <PinGate />
          </div>
        </div>
      </MinoxShell>
    );
  }

  return (
    <MinoxShell>
      <div className="pt-8 text-center">
        <h1 className="text-2xl font-extrabold leading-tight text-slate-900">
          Free Hair Loss Assessment
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Takes 90 seconds. Tap start and answer 12 questions.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
          <span aria-hidden>✔</span> {REVIEWED_BY}
        </div>
        <Suspense>
          <LandingClient kiosk />
        </Suspense>
        <p className="mt-4 text-xs text-slate-400">
          This is not a medical diagnosis. It&apos;s a guide to the right routine.
        </p>
      </div>
    </MinoxShell>
  );
}
