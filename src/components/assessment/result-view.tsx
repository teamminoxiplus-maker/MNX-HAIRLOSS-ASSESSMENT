import {
  AI_ANALYSIS_LABEL,
  AI_ANALYSIS_NOTE,
  CONCERN_COPY,
  CONSULT_COPY,
  DISCLAIMER,
  FLAG_COPY,
  REVIEWED_BY,
  SEVERITY_COPY,
  TIMELINE,
} from "@/lib/assessment/copy";
import { CONSULT, PRODUCTS, STOREFRONTS } from "@/lib/assessment/products";
import { BUNDLES, recommendBundle } from "@/lib/assessment/bundles";
import { formatPHP } from "@/lib/utils";
import type { Concern, EngineFlag, ProductId, Severity } from "@/lib/assessment/types";

// Severity → brand "Stage" framing + severity-meter position (matches the
// original screening design).
const STAGE: Record<Severity, { n: string; pct: number }> = {
  Early: { n: "Stage 1", pct: 22 },
  Moderate: { n: "Stage 2", pct: 55 },
  Advanced: { n: "Stage 3", pct: 85 },
};

// Renders the result from the stored derived fields (spec §10). Same copy.ts
// blocks as the email → the two never drift.
export function ResultView({
  concern,
  severity,
  flags,
  products,
  referral,
  fullName,
  aiAnalysis,
}: {
  concern: Concern;
  severity: Severity;
  flags: EngineFlag[];
  products: ProductId[];
  referral: boolean;
  fullName?: string | null;
  aiAnalysis?: string | null;
}) {
  const cc = CONCERN_COPY[concern];
  const sev = SEVERITY_COPY[severity];
  const flagLines = flags.map((f) => FLAG_COPY[f]).filter(Boolean) as string[];
  const bundleId = recommendBundle(concern, severity, products, referral);
  const bundle = bundleId ? BUNDLES[bundleId] : null;

  const stage = STAGE[severity];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <section>
        {fullName && <p className="text-sm text-slate-400">Hi {fullName},</p>}
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Assessment Result
        </p>

        {!referral && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-serif text-3xl font-medium text-amber-400">
                  {stage.n}
                </div>
                <div className="text-sm text-slate-300">{cc.label}</div>
              </div>
              <span className="rounded-full border border-amber-400/40 px-3 py-1 text-xs font-semibold text-amber-300">
                {sev.label}
              </span>
            </div>

            {/* severity meter */}
            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Hair Loss Severity
              </p>
              <div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500">
                <span
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#080b14] bg-white shadow"
                  style={{ left: `${stage.pct}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
          </div>
        )}

        <h1 className="mt-5 font-serif text-3xl font-medium leading-tight text-white">
          {cc.label}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
          {cc.headline}
        </p>
      </section>

      {/* safety flag lines */}
      {flagLines.length > 0 && (
        <section className="space-y-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
          {flagLines.map((t) => (
            <p key={t} className="text-sm text-amber-200">
              ⚠️ {t}
            </p>
          ))}
        </section>
      )}

      {/* 2b. AI-powered interpretation (prose only — engine still owns safety) */}
      {aiAnalysis && (
        <section className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4">
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-emerald-300">
              ✦
            </span>
            <h2 className="text-sm font-bold text-emerald-100">
              {AI_ANALYSIS_LABEL}
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-100">
            {aiAnalysis}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">{AI_ANALYSIS_NOTE}</p>
        </section>
      )}

      {/* 3. What's happening */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-sm font-bold text-white">What&apos;s happening</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">
          {cc.whatsHappening}
        </p>
        {!aiAnalysis && (
          <p className="mt-2 text-xs font-medium text-slate-500">{REVIEWED_BY}</p>
        )}
      </section>

      {referral ? (
        /* Consult block replaces routine / timeline / buy (spec §10) */
        <section className="rounded-2xl border border-emerald-400/40 bg-emerald-400/[0.06] p-5 text-center">
          <h2 className="font-serif text-2xl font-medium text-white">
            {CONSULT_COPY.heading}
          </h2>
          <p className="mt-2 text-sm text-slate-300">{CONSULT_COPY.body}</p>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href={CONSULT.messenger}
              className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950"
            >
              {CONSULT_COPY.cta}
            </a>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={CONSULT.viber}
                className="rounded-xl border border-white/20 px-4 py-3 font-semibold text-slate-100"
              >
                Viber
              </a>
              <a
                href={CONSULT.whatsapp}
                className="rounded-xl border border-white/20 px-4 py-3 font-semibold text-slate-100"
              >
                WhatsApp
              </a>
            </div>
            <a
              href={`tel:${CONSULT.phoneIntl}`}
              className="text-sm font-semibold text-emerald-400"
            >
              Call or text: {CONSULT.phone}
            </a>
          </div>
        </section>
      ) : (
        <>
          {/* 4. Routine */}
          <section>
            <h2 className="text-sm font-bold text-white">
              {cc.routineIntro || "Your routine"}
            </h2>
            <div className="mt-3 space-y-3">
              {products.map((id) => {
                const p = PRODUCTS[id];
                return (
                  <div
                    key={id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white">{p.name}</h3>
                      <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-300">
                        {p.actives}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-300">{p.why}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      How to use: {p.howToUse}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4b. Complete-system bundle — matched "protocol" (safety-gated) */}
          {bundle && (
            <section className="overflow-hidden rounded-2xl border border-amber-400/30 bg-white/[0.03]">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                  Recommended for your stage
                </p>
                <h2 className="mt-1 font-serif text-3xl font-medium text-amber-400">
                  {bundle.name}
                </h2>
                <p className="text-sm font-medium text-slate-300">{bundle.system}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {bundle.tagline}
                </p>

                <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-sm text-slate-200">
                  {bundle.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="text-amber-400" aria-hidden>
                        ✓
                      </span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-end gap-3 border-t border-white/10 pt-4">
                  <div>
                    <span className="text-sm text-slate-500 line-through">
                      {formatPHP(bundle.srp)}
                    </span>
                    <div className="text-2xl font-extrabold text-white">
                      {formatPHP(bundle.promo)}
                    </div>
                  </div>
                  <span className="mb-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                    Only ₱{bundle.perDay}/day
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{bundle.clinicNote}</p>

                <a
                  href={CONSULT.messenger}
                  className="mt-4 block rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-4 py-3 text-center font-bold text-slate-950"
                >
                  Order this system →
                </a>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <a
                    href={CONSULT.viber}
                    className="rounded-lg border border-white/15 px-3 py-2 text-center text-sm font-semibold text-slate-200"
                  >
                    Viber
                  </a>
                  <a
                    href={`tel:${CONSULT.phoneIntl}`}
                    className="rounded-lg border border-white/15 px-3 py-2 text-center text-sm font-semibold text-slate-200"
                  >
                    Call {CONSULT.phone}
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* 5. Timeline */}
          <section>
            <h2 className="text-sm font-bold text-white">What to expect</h2>
            <ol className="mt-3 space-y-3">
              {TIMELINE.map((t) => (
                <li key={t.when} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                    {t.when}
                  </span>
                  <span className="text-sm text-slate-300">{t.note}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 6. Where to buy */}
          <section>
            <h2 className="text-sm font-bold text-white">Where to buy</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={STOREFRONTS.website}
                className="col-span-2 rounded-xl bg-emerald-500 px-4 py-3 text-center font-bold text-slate-950"
              >
                minoxiplus.com
              </a>
              <a
                href={STOREFRONTS.shopee}
                className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-slate-200"
              >
                Shopee
              </a>
              <a
                href={STOREFRONTS.lazada}
                className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-slate-200"
              >
                Lazada
              </a>
              <a
                href={STOREFRONTS.tiktok}
                className="col-span-2 rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-slate-200"
              >
                TikTok Shop
              </a>
            </div>
          </section>
        </>
      )}

      {/* 7. Consult CTA (also on product results) */}
      {!referral && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-sm text-slate-300">Have a question? Just message us.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <a
              href={CONSULT.messenger}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Messenger
            </a>
            <a
              href={CONSULT.viber}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200"
            >
              Viber
            </a>
            <a
              href={CONSULT.whatsapp}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200"
            >
              WhatsApp
            </a>
          </div>
          <a
            href={`tel:${CONSULT.phoneIntl}`}
            className="mt-3 inline-block text-sm font-semibold text-emerald-400"
          >
            Call or text: {CONSULT.phone}
          </a>
        </section>
      )}

      {/* 8. Disclaimer */}
      <p className="border-t border-white/10 pt-4 text-[11px] leading-relaxed text-slate-500">
        {DISCLAIMER}
      </p>
    </div>
  );
}
