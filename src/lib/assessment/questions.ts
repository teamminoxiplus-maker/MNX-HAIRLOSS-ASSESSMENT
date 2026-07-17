// Question bank (spec §8). Typed config, NOT hardcoded JSX — copy gets edited
// often without touching components. Order here is the on-screen order (1–12).
import type { Answers } from "./types";

export type QuestionType = "single" | "multi";

export interface Option {
  value: string; // STORED contract — never change (lands in answers jsonb)
  label: string; // English, shown on the tap target
  hint?: string; // optional secondary line
}

export interface Question {
  id: keyof Answers;
  type: QuestionType;
  // Screen number 1–12 (matches /assessment/q/[step]).
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
    id: "family_history",
    type: "single",
    step: 7,
    title: "Is there baldness in your family (parents, grandparents, aunts/uncles)?",
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
    step: 8,
    title: "Have you experienced any of these in the past year?",
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
    id: "styling",
    type: "single",
    step: 9,
    title: "Do you often wear tight ponytails, braids, buns, or extensions?",
    required: true,
    options: [
      { value: "daily", label: "Yes, daily" },
      { value: "sometimes", label: "Sometimes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "tried",
    type: "multi",
    step: 10,
    title: "What have you already tried?",
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
  {
    id: "medical_flags",
    type: "multi",
    step: 11,
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
  {
    id: "goal",
    type: "single",
    step: 12,
    title: "What would you most like to happen?",
    required: true,
    options: [
      { value: "stop_shedding", label: "Stop the shedding" },
      { value: "regrow", label: "Regrow hair on the hairline or crown" },
      { value: "thicken", label: "Thicken thinning hair" },
      { value: "fix_dandruff", label: "Fix dandruff and itch" },
    ],
  },
];

export const TOTAL_STEPS = QUESTIONS.length;

export function questionByStep(step: number): Question | undefined {
  return QUESTIONS.find((q) => q.step === step);
}

export function labelForAnswer(id: keyof Answers, value: string): string {
  const q = QUESTIONS.find((x) => x.id === id);
  return q?.options.find((o) => o.value === value)?.label ?? value;
}
