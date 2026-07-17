import type { Metadata } from "next";
import { MinoxShell } from "@/components/assessment/minox-brand";
import { CONSULT } from "@/lib/assessment/products";

export const metadata: Metadata = {
  title: "Privacy Policy — MINOXIPLUS Assessment",
};

// Phase-1 privacy notice for the assessment (spec §14, RA 10173). A working
// data-deletion path via email is acceptable for Phase 1.
export default function PrivacyPage() {
  return (
    <MinoxShell>
      <article className="space-y-4 text-sm leading-relaxed text-slate-700">
        <h1 className="text-xl font-extrabold text-slate-900">Privacy Notice</h1>
        <p>
          MINOXIPLUS (Happy Life Organics Philippines) collects your information
          through this free hair loss assessment in accordance with Republic Act
          10173 (Data Privacy Act of 2012).
        </p>

        <h2 className="pt-2 text-base font-bold text-slate-900">
          What we collect
        </h2>
        <p>
          Your name, email, mobile number, your assessment answers, and basic
          technical info (device type, scan source). We do not store your full IP
          address — it is hashed only.
        </p>

        <h2 className="pt-2 text-base font-bold text-slate-900">
          Why we use it
        </h2>
        <p>
          To provide your personalized routine, send your result, and (if you
          agree) send tips and promos. We do not sell your data to anyone.
        </p>

        <h2 className="pt-2 text-base font-bold text-slate-900">Retention</h2>
        <p>
          We keep your assessment for as long as your relationship with us is
          active. Incomplete entries with no contact info are automatically
          deleted after 90 days.
        </p>

        <h2 className="pt-2 text-base font-bold text-slate-900">
          Your rights
        </h2>
        <p>
          You have the right to access, correct, or request deletion of your
          data. To request deletion or ask a privacy question, email{" "}
          <a href={`mailto:${CONSULT.email}`} className="text-blue-700 underline">
            {CONSULT.email}
          </a>
          .
        </p>

        <p className="pt-2 text-xs text-slate-400">
          This is not a medical diagnosis. It&apos;s a guide to the right routine.
        </p>
      </article>
    </MinoxShell>
  );
}
