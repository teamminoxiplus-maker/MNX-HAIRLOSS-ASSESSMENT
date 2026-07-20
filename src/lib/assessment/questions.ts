// Question bank (spec §8). Typed config, NOT hardcoded JSX — copy gets edited
// often without touching components. Order here is the on-screen order (1–7).
//
// The public flow asks 7 questions — the fields that drive concern
// classification, severity, and (critically) the safety gates. The remaining
// engine-read fields that aren't asked are back-filled with conservative,
// neutral defaults via `withDefaults()` so the deterministic engine still gets
// a complete, valid answer set and no safety gate can ever be bypassed.
import type { Answers, PartialAnswers } from "./types";

export type QuestionType = "single" | "multi";

export interface Option {
  value: string; // STORED contract — never change (lands in answers jsonb)
  label: string; // English, shown on the tap target
  hint?: string; // optional secondary line
}

export interface Question {
  id: keyof Answers;
  type: QuestionType;
  // Screen number 1–7 (matches /assessment/q/[step]).
  step: number;
  title: string;
  options: Option[];
  // Safety questions are never skippable (spec §8, Q11).
  required: boolean;
  // For multi-select: a value that clears the others when picked ("Wala").
  exclusiveValue?: string;
}

export const QUESTIONS: Question[] = [
  {
    id: "sex",
    type: "single",
    step: 1,
    title: "What is your sex?",
    required: true,
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
    ],
  },
  {
    id: "age_band",
    type: "single",
    step: 2,
    title: "How old are you?",
    required: true,
    options: [
      { value: "below_18", label: "Below 18" },
      { value: "18_24", label: "18–24" },
      { value: "25_34", label: "25–34" },
      { value: "35_44", label: "35–44" },
      { value: "45_54", label: "45–54" },
      { value: "55_plus", label: "55+" },
    ],
  },
  {
    id: "duration",
    type: "single",
    step: 3,
    title: "How long have you had hair loss?",
    required: true,
    options: [
      { value: "lt_6m", label: "Below 6 months" },
      { value: "6_12m", label: "6–12 months" },
      { value: "1_3y", label: "1–3 years" },
      { value: "gt_3y", label: "More than 3 years" },
    ],
  },
  {
    id: "pattern",
    type: "single",
    step: 4,
    title: "Where do you notice the thinning most?",
    required: true,
    options: [
      { value: "receding", label: "Receding hairline / temples" },
      { value: "crown", label: "Crown or top of the head", hint: "bald spot" },
      { value: "widening_part", label: "Widening part line" },
      { value: "diffuse", label: "All over — even thinning" },
      { value: "patchy", label: "Patchy, circular spots" },
      { value: "edges", label: "Along the edges", hint: "where a ponytail or braids pull" },
    ],
  },
  {
    id: "shedding",
    type: "single",
    step: 5,
    title: "How much hair do you shed each day?",
    required: true,
    options: [
      { value: "normal", label: "Just a little — normal" },
      { value: "noticeable", label: "Noticeable on my pillow or drain" },
      { value: "clumps", label: "A lot — clumps when I shampoo" },
    ],
  },
  {
    id: "scalp",
    type: "multi",
    step: 6,
    title: "How is your scalp?",
    required: true,
    exclusiveValue: "normal",
    options: [
      { value: "dandruff", label: "Dandruff" },
      { value: "itchy", label: "Itchy" },
      { value: "oily", label: "Oily" },
      { value: "wound", label: "Inflamed or has sores" },
      { value: "normal", label: "Normal" },
    ],
  },
  {
    id: "medical_flags",
    type: "multi",
    step: 7,
    title: "Which of these are true for you?",
    required: true, // hard safety question — never skippable (spec §8)
    exclusiveValue: "none",
    options: [
      { value: "pregnant", label: "Pregnant or breastfeeding" },
      { value: "planning_pregnancy", label: "Planning to get pregnant" },
      { value: "heart_bp", label: "Have a heart condition or BP maintenance" },
      { value: "minoxidil_allergy", label: "Allergic to Minoxidil" },
      { value: "scalp_wound", label: "Have a wound or skin condition on the scalp" },
      { value: "none", label: "None of these" },
    ],
  },
];

// Conservative defaults for the engine-read fields the 7-question flow doesn't
// ask. Chosen so they add NO extra risk and trigger no special-case concern:
//   family_history "unknown" → +0 to severity (neutral)
//   triggers ["none"]        → no telogen-effluvium classification
//   styling  "no"            → no traction classification
//   tried    ["none"]        → informational only (unused by the engine)
//   goal     "regrow"        → informational only (unused by the engine)
// Safety gates read sex / age_band / medical_flags — all still asked — so every
// gate (men-only, under-18, pregnancy, heart, allergy, scalp) stays enforced.
export const DEFAULT_UNASKED: Pick<
  Answers,
  "family_history" | "triggers" | "styling" | "tried" | "goal"
> = {
  family_history: "unknown",
  triggers: ["none"],
  styling: "no",
  tried: ["none"],
  goal: "regrow",
};

// Merge the collected answers over the neutral defaults, producing a complete
// answer set the shared `answersSchema` and engine accept. Collected values
// always win — defaults only fill fields the flow no longer asks.
export function withDefaults(a: PartialAnswers): PartialAnswers {
  return { ...DEFAULT_UNASKED, ...a };
}

export const TOTAL_STEPS = QUESTIONS.length;

export function questionByStep(step: number): Question | undefined {
  return QUESTIONS.find((q) => q.step === step);
}

export function labelForAnswer(id: keyof Answers, value: string): string {
  const q = QUESTIONS.find((x) => x.id === id);
  return q?.options.find((o) => o.value === value)?.label ?? value;
}
