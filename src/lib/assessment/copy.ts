// Result copy — SINGLE SOURCE OF TRUTH for both the web result page and the
// email (spec §10). All strings follow the §9.5 claim rules: no "cure",
// "guaranteed", "permanent", "100%", no "diagnosis"; use "likely"/"possibly"/
// "based on your answers".
import type { Concern, EngineFlag, Severity } from "./types";

// Carried on every result page and email (spec §9.5).
export const DISCLAIMER =
  "This is not a medical diagnosis. For personal advice, just message us or consult Doc Ryan Encabo.";

export const REVIEWED_BY = "Reviewed by Doc Ryan Encabo";

export const PREGNANCY_LINE =
  "For your safety and your baby's, let's talk to the doctor first before starting any treatment.";

export interface ConcernCopy {
  label: string; // shown after "Based on your answers:"
  headline: string; // 2–3 sentence plain-English explanation
  whatsHappening: string; // short educational block
  routineIntro: string; // lead-in above product cards
}

export const CONCERN_COPY: Record<Concern, ConcernCopy> = {
  AGA_MALE: {
    label: "Male Pattern Hair Loss",
    headline:
      "Based on your answers, this is likely male pattern hair loss — the most common cause of thinning in men. It develops gradually, so the earlier you start, the better the results.",
    whatsHappening:
      "It's driven by the sensitivity of hair follicles to DHT, which thins the hair at the hairline and crown. Consistent use of the right topical is the key.",
    routineIntro: "Here's the routine based on your stage:",
  },
  AGA_FEMALE: {
    label: "Female Pattern Hair Loss",
    headline:
      "Based on your answers, female pattern hair loss is a likely cause of your thinning — often seen as a widening part or general thinning on top. The right routine can support it.",
    whatsHappening:
      "In women, hair thins gradually but rarely leads to full baldness. Minoxidil and hair-support nutrients help with strength and thickness.",
    routineIntro: "Here's the routine for you:",
  },
  TELOGEN_EFFLUVIUM: {
    label: "Telogen Effluvium (temporary shedding)",
    headline:
      "Based on your answers, this is likely telogen effluvium — temporary shedding often triggered by childbirth, stress, illness, or a sudden change in the body. It usually returns to normal.",
    whatsHappening:
      "Your hair cycle was disrupted, so many follicles rested at the same time. As you recover, nutrients and scalp care help speed things up.",
    routineIntro: "To support your recovery:",
  },
  SEB_DERM: {
    label: "Dandruff / Scalp Irritation",
    headline:
      "Based on your answers, dandruff or scalp irritation is the likely cause of your shedding. Once the scalp is treated, the shedding often stops too.",
    whatsHappening:
      "Dandruff and itch affect the health of the follicle. A medicated shampoo is the first step before any regrowth routine.",
    routineIntro: "Start by treating the scalp:",
  },
  TRACTION: {
    label: "Traction (from tight hairstyles)",
    headline:
      "Based on your answers, traction may be the cause — hair thins along the edges from frequent tight ponytails, braids, or extensions. The good news: it can recover once the styling is adjusted.",
    whatsHappening:
      "Repeated pulling stresses the follicles along the edges of the scalp. Loosen the hairstyle and support it with scalp care to bring the hair back.",
    routineIntro: "Alongside avoiding tight styles:",
  },
  MIXED: {
    label: "Pattern Hair Loss + Scalp Irritation",
    headline:
      "Based on your answers, you have pattern hair loss together with dandruff or irritation. Both need to be addressed — clear the scalp first while supporting regrowth.",
    whatsHappening:
      "When the scalp is irritated, regrowth treatment isn't as effective. So we'll treat the scalp and the thinning at the same time.",
    routineIntro: "A two-step routine:",
  },
  REFER_PATCHY: {
    label: "Consultation Needed",
    headline:
      "Based on your answers, you're noticing patchy or circular spots. This may have a different cause that should be checked in person before recommending any product.",
    whatsHappening:
      "Patchy hair loss isn't addressed by over-the-counter regrowth products. It's safer to consult Doc Ryan Encabo first.",
    routineIntro: "",
  },
  REFER_SCALP: {
    label: "Treat the Scalp First",
    headline:
      "Based on your answers, you have a wound or skin condition on your scalp. This needs to be treated first before applying any topical treatment.",
    whatsHappening:
      "Applying a topical to a broken scalp can do harm. Let's talk to the doctor first for the right next step.",
    routineIntro: "",
  },
  INCONCLUSIVE: {
    label: "A Few More Details Needed",
    headline:
      "Based on your answers, we can't pin down a single clear cause yet. Don't worry — our team can help you personally.",
    whatsHappening:
      "Some cases need a few follow-up questions to make sure the routine is right. Just message us.",
    routineIntro: "",
  },
};

// Severity block (spec §10 §2).
export const SEVERITY_COPY: Record<Severity, { label: string; note: string }> = {
  Early: {
    label: "Early Stage",
    note: "Still early — there's a strong chance to slow it down and regrow hair with the right routine.",
  },
  Moderate: {
    label: "Moderate Stage",
    note: "Some loss is already happening, but treatment is still effective when used consistently.",
  },
  Advanced: {
    label: "Advanced Stage",
    note: "It's more established — a consistent routine and possibly a consultation are needed.",
  },
};

// Honest timeline expectation, incl. the shedding phase (spec §10 §5).
export const TIMELINE = [
  {
    when: "Month 1",
    note: "Just getting started. A little extra shedding is normal — it's part of the cycle, not worsening.",
  },
  {
    when: "Month 3",
    note: "Shedding usually slows down. Baby hairs may start to appear.",
  },
  {
    when: "Month 6",
    note: "This is when the clearest improvement in thickness is usually seen — with consistent use.",
  },
];

// Human-readable flag lines shown before the purchase CTA (spec §9.4).
export const FLAG_COPY: Partial<Record<EngineFlag, string>> = {
  NEEDS_DOC_CLEARANCE:
    "You mentioned a heart condition or BP maintenance. Please consult a doctor before starting Minoxidil.",
  PREGNANCY: PREGNANCY_LINE,
  UNDER_18:
    "These treatments are for ages 18 and up. Message us for a safe alternative.",
  MINOXIDIL_ALLERGY:
    "Because of your Minoxidil allergy, we've removed all Minoxidil products from your recommendation.",
  SCALP_CONDITION:
    "Because of the scalp condition, it needs to be treated first before any topical treatment.",
};

// Consult block copy for REFER routes (spec §10 — replaces sections 4–6).
export const CONSULT_COPY = {
  heading: "Let's talk to the team first",
  body: "To make sure the routine is right and safe for you, it's best to speak with our team — or Doc Ryan Encabo — in person first. Asking is free.",
  cta: "Message us",
};
