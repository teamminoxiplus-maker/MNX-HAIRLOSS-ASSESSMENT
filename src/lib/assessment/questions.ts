// Question bank (spec §8). Typed config, NOT hardcoded JSX — copy gets edited
// often without touching components. Order here is the on-screen order (1–7).
//
// The public flow asks exactly 7 questions. The safety-critical fields the
// engine also needs — sex, age band, and the medical safety flags — are
// collected on the final "send my result" step (see FINISH_FIELDS + the contact
// form), NOT as assessment questions, so the flow stays 7 questions while every
// safety gate (men-only, under-18, pregnancy, heart, allergy, scalp) still fires.
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
  required: boolean;
  // For multi-select: a value that clears the others when picked ("None").
  exclusiveValue?: string;
}

export const QUESTIONS: Question[] = [
  {
    id: "duration",
    type: "single",
    step: 1,
    title: "How long have you been experiencing hair loss or thinning?",
    required: true,
    options: [
      { value: "lt_6m", label: "Less than 6 months" },
      { value: "6_12m", label: "6–12 months" },
      { value: "1_3y", label: "1–3 years" },
      { value: "gt_3y", label: "More than 3 years" },
    ],
  },
  {
    id: "pattern",
    type: "single",
    step: 2,
    title: "Where on your scalp are you losing hair?",
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
    step: 3,
    title: "How much hair are you shedding daily?",
    required: true,
    options: [
      { value: "normal", label: "Just a little — normal" },
      { value: "noticeable", label: "Noticeable on my pillow or drain" },
      { value: "clumps", label: "A lot — clumps when I shampoo" },
    ],
  },
  {
    id: "family_history",
    type: "single",
    step: 4,
    title: "Does hair loss run in your family?",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unknown", label: "I don't know" },
    ],
  },
  {
    id: "triggers",
    type: "multi",
    step: 5,
    title: "Have you recently experienced any of the following?",
    required: true,
    exclusiveValue: "none",
    options: [
      { value: "postpartum", label: "Gave birth (postpartum)" },
      { value: "stress", label: "Severe stress" },
      { value: "illness", label: "Serious illness or fever" },
      { value: "crash_diet", label: "Crash diet or sudden weight loss" },
      { value: "surgery", label: "Surgery" },
      { value: "none", label: "None of these" },
    ],
  },
  {
    id: "scalp",
    type: "multi",
    step: 6,
    title: "How would you describe your scalp?",
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
    id: "tried",
    type: "multi",
    step: 7,
    title: "Have you tried treating your hair loss before?",
    required: true,
    exclusiveValue: "none",
    options: [
      { value: "minoxidil", label: "Minoxidil" },
      { value: "finasteride", label: "Finasteride" },
      { value: "anti_dandruff", label: "Anti-dandruff shampoo" },
      { value: "supplements", label: "Supplements" },
      { value: "hair_spa", label: "Hair spa" },
      { value: "none", label: "Nothing yet" },
    ],
  },
];

// Collected on the final step (contact form), not as assessment questions.
// These feed the safety gates (sex → men-only, age_band → under-18,
// medical_flags → pregnancy / heart / allergy / scalp). Kept here so the admin
// dashboard and labelForAnswer can render them like any other answer.
export const FINISH_FIELDS: Question[] = [
  {
    id: "sex",
    type: "single",
    step: 0,
    title: "Sex",
    required: true,
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
    ],
  },
  {
    id: "age_band",
    type: "single",
    step: 0,
    title: "Age",
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
    id: "medical_flags",
    type: "multi",
    step: 0,
    title: "Any of these apply to you?",
    required: true, // hard safety question — never skippable (spec §8)
    exclusiveValue: "none",
    options: [
      { value: "pregnant", label: "Pregnant or breastfeeding" },
      { value: "planning_pregnancy", label: "Planning to get pregnant" },
      { value: "heart_bp", label: "Heart condition or BP maintenance" },
      { value: "minoxidil_allergy", label: "Allergic to Minoxidil" },
      { value: "scalp_wound", label: "Wound or skin condition on the scalp" },
      { value: "none", label: "None of these" },
    ],
  },
];

// Every field, for label lookup and admin display.
export const ALL_FIELDS: Question[] = [...QUESTIONS, ...FINISH_FIELDS];

// Conservative defaults for the two engine-read fields that are neither asked
// as one of the 7 questions nor collected on the finish step:
//   styling "no"    → no traction classification (adds no risk)
//   goal    "regrow"→ informational only (unused by the engine)
export const DEFAULT_UNASKED: Pick<Answers, "styling" | "goal"> = {
  styling: "no",
  goal: "regrow",
};

// Merge collected answers over the neutral defaults. Collected values win.
export function withDefaults(a: PartialAnswers): PartialAnswers {
  return { ...DEFAULT_UNASKED, ...a };
}

export const TOTAL_STEPS = QUESTIONS.length;

export function questionByStep(step: number): Question | undefined {
  return QUESTIONS.find((q) => q.step === step);
}

export function labelForAnswer(id: keyof Answers, value: string): string {
  const q = ALL_FIELDS.find((x) => x.id === id);
  return q?.options.find((o) => o.value === value)?.label ?? value;
}
