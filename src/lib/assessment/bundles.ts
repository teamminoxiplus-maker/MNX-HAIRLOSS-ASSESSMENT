// MNX 3-Month System bundles surfaced on the result page. The tier is driven by
// SEVERITY + SEX, gated by safety: STARTER for women and mild (Early) cases;
// eligible men get ADVANCED (Moderate) or PRO (Advanced). PRO/ADVANCED contain
// TriActive (Minoxidil + Finasteride) so they are men-only; and no bundle is
// shown when the safety gates stripped the topical routine (e.g. Minoxidil
// allergy) or forced a consult (pregnancy, under-18, scalp wound).
import type { Answers, ProductId, Severity } from "./types";

export type BundleId = "STARTER" | "ADVANCED" | "PRO";

// One line per included product: what it is, how it's used, and why it matters.
export interface BundleItem {
  qty: string; // e.g. "3 pcs"
  name: string;
  use: string; // e.g. "Apply 2× daily"
  why: string; // one-line rationale
}

export interface Bundle {
  id: BundleId;
  name: string;
  system: string;
  tagline: string;
  whyMatch: string; // "why this protocol matches your assessment"
  items: BundleItem[];
  srp: number;
  promo: number;
  perDay: number;
  clinicNote: string;
  menOnly: boolean; // contains TriActive (Finasteride) — men only
}

export const BUNDLES: Record<BundleId, Bundle> = {
  STARTER: {
    id: "STARTER",
    name: "MINOXIPLUS Starter",
    system: "3-Month Hair Regrowth System",
    tagline:
      "Targets DHT, supports hair follicles, and helps restore scalp health over your 90-day routine.",
    whyMatch:
      "Your stage shows early, active thinning that responds well to a focused topical-and-support routine.",
    items: [
      {
        qty: "3 pcs",
        name: "Minoxiplus Signature",
        use: "Apply 2× daily",
        why: "5% Minoxidil topical that supports regrowth at the hairline and crown.",
      },
      {
        qty: "2 pcs",
        name: "Ketoconazole Shampoo",
        use: "Use 3–4× / week",
        why: "Clears the dandruff and buildup that can block healthy growth.",
      },
      {
        qty: "3 pcs",
        name: "Hair Growth Supplements",
        use: "3 capsules per day",
        why: "Supports hair strength and thickness from within.",
      },
    ],
    srp: 5272,
    promo: 4744,
    perDay: 52,
    clinicNote: "Typical clinic cost: ₱10,000–₱30,000 for 3 months.",
    menOnly: false,
  },
  ADVANCED: {
    id: "ADVANCED",
    name: "MINOXIPLUS Advanced",
    system: "3-Month Hair Regrowth System",
    tagline:
      "Targets DHT, supports hair follicles, and helps restore scalp health over your 90-day routine.",
    whyMatch:
      "Your stage shows active follicle miniaturization that needs a stronger approach — the TriActive formula plus scalp support to enhance circulation and absorption.",
    items: [
      {
        qty: "3 pcs",
        name: "TriActive Serum",
        use: "Apply 1–2× daily",
        why: "Triple-action: targets DHT, stimulates follicles, and conditions the scalp.",
      },
      {
        qty: "2 pcs",
        name: "Ketoconazole Shampoo",
        use: "Use 3–4× / week",
        why: "Controls scalp DHT and clears inflammation that blocks follicles.",
      },
      {
        qty: "1 pc",
        name: "Scalp Massager",
        use: "Use 2× daily",
        why: "Boosts circulation so the topical absorbs better.",
      },
      {
        qty: "3 pcs",
        name: "Hair Growth Supplements",
        use: "3 capsules per day",
        why: "Provides systemic nutritional support for stronger hair.",
      },
    ],
    srp: 6761,
    promo: 6085,
    perDay: 67,
    clinicNote: "Typical clinic cost: ₱20,000–₱50,000 for 3 months.",
    menOnly: true,
  },
  PRO: {
    id: "PRO",
    name: "MINOXIPLUS Pro",
    system: "3-Month Regrowth System (with Microneedling)",
    tagline:
      "Targets DHT, supports hair follicles, and helps restore scalp health over your 90-day routine.",
    whyMatch:
      "Your stage is more established, so this adds micro-needling to the TriActive system to maximize absorption and follicle stimulation.",
    items: [
      {
        qty: "3 pcs",
        name: "TriActive Serum",
        use: "Apply 1–2× daily",
        why: "Triple-action: targets DHT, stimulates follicles, and conditions the scalp.",
      },
      {
        qty: "2 pcs",
        name: "Ketoconazole Shampoo",
        use: "Use 3–4× / week",
        why: "Controls scalp DHT and clears inflammation that blocks follicles.",
      },
      {
        qty: "1 pc",
        name: "Scalp Massager",
        use: "Use 2× daily",
        why: "Boosts circulation so the topical absorbs better.",
      },
      {
        qty: "3 pcs",
        name: "Hair Growth Supplements",
        use: "3 capsules per day",
        why: "Provides systemic nutritional support for stronger hair.",
      },
      {
        qty: "3 pcs",
        name: "Derma Stamp",
        use: "0.5mm, 2× a week",
        why: "Micro-needling that enhances absorption and follicle activity.",
      },
    ],
    srp: 8858,
    promo: 7972,
    perDay: 88,
    clinicNote: "Typical clinic cost: ₱30,000–₱85,000 for 3 months.",
    menOnly: true,
  },
};

// Pick the bundle to surface, by SEVERITY + SEX, gated by safety.
export function recommendBundle(
  severity: Severity,
  a: Answers,
  products: ProductId[],
  referral: boolean,
): BundleId | null {
  // Consult/referral routes (patchy already handled, scalp wound, under-18,
  // pregnancy) never show a bundle.
  if (referral) return null;

  // Every bundle contains Minoxidil (Signature or TriActive). If the safety
  // gates stripped every topical — e.g. a Minoxidil allergy removed them — do
  // NOT push a Minoxidil bundle. This keeps the men-only / allergy rules honored.
  const hasTopicalRoutine =
    products.includes("signature_hair_grower") || products.includes("tri_active");
  if (!hasTopicalRoutine) return null;

  // ADVANCED/PRO add Finasteride → eligible men only. Women (any severity) and
  // mild/Early cases get the Minoxidil-based STARTER. Under-18 and pregnancy
  // already forced a referral above, so they never reach here.
  const eligibleMan = a.sex === "male" && a.age_band !== "below_18";
  if (eligibleMan && severity === "Advanced") return "PRO";
  if (eligibleMan && severity === "Moderate") return "ADVANCED";
  return "STARTER";
}
