// MNX 3-Month System bundles surfaced on the result page. Which bundle a
// customer sees is DERIVED from the already-safety-gated engine output, so the
// men-only rule (TriActive = Minoxidil + Finasteride) is automatically honored:
// PRO/ADVANCED contain TriActive and are only ever recommended when tri_active
// survived applySafetyGates() — i.e. an eligible male. Everyone else who still
// has a minoxidil routine sees STARTER; refer/consult routes see no bundle.
import type { Concern, ProductId, Severity } from "./types";

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

// Pick the bundle to surface. Returns null for referral/consult routes and for
// concerns where a full regrowth system isn't the right push.
export function recommendBundle(
  concern: Concern,
  severity: Severity,
  products: ProductId[],
  referral: boolean,
): BundleId | null {
  if (referral || products.length === 0) return null;

  // TriActive present ⇒ eligible male, moderate/advanced AGA. Advanced adds
  // microneedling (PRO); moderate is the TriActive system without it (ADVANCED).
  if (products.includes("tri_active")) {
    return severity === "Advanced" ? "PRO" : "ADVANCED";
  }

  // Signature-based system for pattern-loss concerns (incl. all female AGA,
  // early male AGA, and mixed). Only where a minoxidil routine survived gates.
  const patternLoss =
    concern === "AGA_MALE" || concern === "AGA_FEMALE" || concern === "MIXED";
  if (patternLoss && products.includes("signature_hair_grower")) {
    return "STARTER";
  }

  return null;
}
