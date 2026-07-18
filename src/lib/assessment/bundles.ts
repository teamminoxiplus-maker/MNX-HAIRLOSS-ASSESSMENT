// MNX 3-Month System bundles surfaced on the result page. Which bundle a
// customer sees is DERIVED from the already-safety-gated engine output, so the
// men-only rule (TriActive = Minoxidil + Finasteride) is automatically honored:
// PRO/ADVANCED contain TriActive and are only ever recommended when tri_active
// survived applySafetyGates() — i.e. an eligible male. Everyone else who still
// has a minoxidil routine sees STARTER; refer/consult routes see no bundle.
import type { Concern, ProductId, Severity } from "./types";

export type BundleId = "STARTER" | "ADVANCED" | "PRO";

export interface Bundle {
  id: BundleId;
  name: string;
  system: string;
  tagline: string;
  items: string[];
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
    items: [
      "3 pcs Minoxiplus Signature (use 2x a day)",
      "2 pcs Ketoconazole Shampoo (use 3–4x / week)",
      "3 pcs Hair Growth Supplements (3 caps per day)",
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
    items: [
      "3 pcs TriActive (use 2x a day)",
      "2 pcs Ketoconazole Shampoo (use 3–4x / week)",
      "1 pc Scalp Massager (use 2x a day)",
      "3 pcs Hair Growth Supplements (3 caps per day)",
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
    items: [
      "3 pcs TriActive (use 2x a day)",
      "2 pcs Ketoconazole Shampoo (use 3–4x / week)",
      "1 pc Scalp Massager (use 2x a day)",
      "3 pcs Hair Growth Supplements (3 caps per day)",
      "3 pcs Derma Stamp (use 0.5mm 2x a week)",
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
