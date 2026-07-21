import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { MinoxShell } from "@/components/assessment/minox-brand";
import { ResultView } from "@/components/assessment/result-view";
import { KioskReset } from "@/components/assessment/kiosk-reset";
import { assessmentDb } from "@/lib/assessment/persist";
import { recommendBundle } from "@/lib/assessment/bundles";
import type { Answers, Concern, EngineFlag, ProductId, Severity } from "@/lib/assessment/types";

export const metadata: Metadata = {
  title: "Your Result — MINOXIPLUS",
  robots: { index: false }, // unguessable token, but keep result pages out of search
};

export const dynamic = "force-dynamic";

// Result page (spec §10). Public, re-openable via unguessable token. No PII in
// the URL. Reads the stored derived fields via the service client.
export default async function ResultPage({
  params,
}: {
  params: { token: string };
}) {
  const db = assessmentDb();
  const { data } = await db
    .from("assessments")
    .select(
      "full_name, answers, concern, severity, flags, recommended_products, referral_required, ai_analysis, status",
    )
    .eq("result_token", params.token)
    .maybeSingle();

  if (!data || data.status !== "completed" || !data.concern) {
    notFound();
  }

  // Bundle tier is recomputed from the stored answers/derived fields (pure,
  // deterministic) so no extra column is needed and it always matches the email.
  const severity = data.severity as Severity;
  const products = (data.recommended_products ?? []) as ProductId[];
  const referral = !!data.referral_required;
  const recommendedBundle = recommendBundle(
    severity,
    (data.answers ?? {}) as Answers,
    products,
    referral,
  );

  return (
    <MinoxShell>
      <ResultView
        concern={data.concern as Concern}
        severity={severity}
        flags={(data.flags ?? []) as EngineFlag[]}
        products={products}
        referral={referral}
        fullName={data.full_name}
        aiAnalysis={data.ai_analysis as string | null}
        recommendedBundle={recommendedBundle}
      />
      <Suspense>
        <KioskReset />
      </Suspense>
    </MinoxShell>
  );
}
