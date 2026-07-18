"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QUESTIONS, TOTAL_STEPS, questionByStep } from "@/lib/assessment/questions";
import {
  getAnswers,
  getAttribution,
  getSessionId,
  logEvent,
  postDraft,
  setAnswers,
} from "@/lib/assessment/session";
import type { PartialAnswers } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

// One question per screen (spec §7). Big tap targets, progress bar, back button,
// no typing. Single-select auto-advances; multi-select uses a Next button.
export function QuestionStep({ step }: { step: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const kiosk = params.get("kiosk") === "1";
  const q = questionByStep(step);

  const [answers, setLocal] = useState<PartialAnswers>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sid = getSessionId(kiosk);
    const a = getAnswers(kiosk);
    setLocal(a);
    const cur = q ? a[q.id] : undefined;
    setSelected(cur === undefined ? [] : Array.isArray(cur) ? cur : [cur]);
    setHydrated(true);
    logEvent(sid, `q${step}`, "view");
  }, [step, kiosk, q]);

  const progress = useMemo(() => Math.round((step / TOTAL_STEPS) * 100), [step]);

  if (!q) return null;

  const persist = (nextSelected: string[]) => {
    const value =
      q.type === "single" ? nextSelected[0] : (nextSelected as string[]);
    const next = { ...answers, [q.id]: value } as PartialAnswers;
    setLocal(next);
    setAnswers(next, kiosk);
    const sid = getSessionId(kiosk);
    const attr = kiosk ? null : getAttribution();
    postDraft({
      session_id: sid,
      answers: next,
      step: `q${step}`,
      src: attr?.src,
      utm_source: attr?.utm_source,
      utm_medium: attr?.utm_medium,
      utm_campaign: attr?.utm_campaign,
      referrer: attr?.referrer,
    });
    logEvent(sid, `q${step}`, "answer");
    return next;
  };

  const goNext = () => {
    const q2 = kiosk ? "?kiosk=1" : "";
    if (step >= TOTAL_STEPS) {
      router.push(`/assessment/contact${q2}`);
    } else {
      router.push(`/assessment/q/${step + 1}${q2}`);
    }
  };

  const goBack = () => {
    const q2 = kiosk ? "?kiosk=1" : "";
    if (step <= 1) router.push(`/assessment${q2}`);
    else router.push(`/assessment/q/${step - 1}${q2}`);
  };

  const onSingle = (value: string) => {
    setSelected([value]);
    persist([value]);
    // Brief highlight before advancing.
    setTimeout(goNext, 180);
  };

  const onToggleMulti = (value: string) => {
    let next: string[];
    if (value === q.exclusiveValue) {
      next = [value];
    } else {
      const withoutExclusive = selected.filter((v) => v !== q.exclusiveValue);
      next = withoutExclusive.includes(value)
        ? withoutExclusive.filter((v) => v !== value)
        : [...withoutExclusive, value];
    }
    setSelected(next);
    persist(next);
  };

  const canProceed = q.type === "multi" ? selected.length > 0 : true;

  return (
    <div>
      {/* progress */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={goBack}
          className="shrink-0 rounded-md px-2 py-1 text-sm text-slate-400 hover:text-white"
          aria-label="Back"
        >
          ← Back
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-slate-400">
          {step}/{TOTAL_STEPS}
        </span>
      </div>

      <h2 className="mb-1 font-serif text-2xl font-medium leading-snug text-white">
        {q.title}
      </h2>
      {q.type === "multi" && (
        <p className="mb-4 text-xs text-slate-400">
          You can choose more than one.
        </p>
      )}

      <div className={cn("mt-4 space-y-2.5", hydrated ? "" : "opacity-0")}>
        {q.options.map((opt) => {
          const isSel = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() =>
                q.type === "single" ? onSingle(opt.value) : onToggleMulti(opt.value)
              }
              aria-pressed={isSel}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-colors",
                isSel
                  ? "border-emerald-400 bg-emerald-500/10 text-emerald-50"
                  : "border-white/10 bg-white/[0.03] text-slate-100 hover:border-white/25",
              )}
              style={{ minHeight: 54 }}
            >
              <span>
                <span className="font-medium">{opt.label}</span>
                {opt.hint && (
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {opt.hint}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                  isSel
                    ? "border-emerald-400 bg-emerald-500 text-slate-950"
                    : "border-white/25",
                )}
                aria-hidden
              >
                {isSel ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>

      {q.type === "multi" && (
        <button
          onClick={goNext}
          disabled={!canProceed}
          className="mt-6 w-full rounded-2xl bg-emerald-500 px-6 py-3.5 text-base font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
          style={{ minHeight: 54 }}
        >
          Next →
        </button>
      )}
    </div>
  );
}
