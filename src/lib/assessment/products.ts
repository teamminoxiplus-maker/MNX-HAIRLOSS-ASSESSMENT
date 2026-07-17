// MINOXIPLUS product catalog (spec §1) with the safety-relevant attributes the
// engine reads. Buy links point at the real storefronts; swap the URLs when the
// canonical listing pages are confirmed.
import type { ProductId } from "./types";

export interface ProductInfo {
  id: ProductId;
  name: string;
  actives: string;
  // One-line "why this is for you" shown on the result card.
  why: string;
  howToUse: string;
  // --- safety attributes read by applySafetyGates (spec §9.4) ---
  containsMinoxidil: boolean;
  containsFinasteride: boolean;
  menOnly: boolean;
  minAge: number; // 0 = no age restriction
  topical: boolean; // applied to the scalp
  supplement: boolean;
  // Product image lives under /public; a placeholder ships with the repo.
  image: string;
}

export const PRODUCTS: Record<ProductId, ProductInfo> = {
  signature_hair_grower: {
    id: "signature_hair_grower",
    name: "Signature Hair Grower",
    actives: "5% Minoxidil topical spray",
    why: "Supports hair regrowth at the hairline and crown.",
    howToUse: "1 ml spray, twice a day on a dry scalp. Do not wash for 4 hours.",
    containsMinoxidil: true,
    containsFinasteride: false,
    menOnly: false,
    minAge: 18,
    topical: true,
    supplement: false,
    image: "/products/signature-hair-grower.svg",
  },
  tri_active: {
    id: "tri_active",
    name: "Tri Active",
    actives: "Minoxidil + Finasteride + Bakuchiol",
    why: "Triple-action for moderate to advanced male pattern hair loss.",
    howToUse: "Follow the label directions. Consult the doctor before starting.",
    containsMinoxidil: true,
    containsFinasteride: true,
    menOnly: true, // spec §9.4.1 — MEN ONLY, hard filter
    minAge: 18,
    topical: true,
    supplement: false,
    image: "/products/tri-active.svg",
  },
  keto_shampoo: {
    id: "keto_shampoo",
    name: "Ketoconazole 2% Shampoo",
    actives: "Ketoconazole 2%",
    why: "Targets the dandruff and itch that trigger shedding.",
    howToUse: "2–3x a week. Leave on for 3–5 minutes before rinsing.",
    containsMinoxidil: false,
    containsFinasteride: false,
    menOnly: false,
    minAge: 0,
    topical: true,
    supplement: false,
    image: "/products/keto-shampoo.svg",
  },
  hair_supplement: {
    id: "hair_supplement",
    name: "Hair Supplement Capsules",
    actives: "Hair-support vitamins",
    why: "Supports hair strength and thickness from within.",
    howToUse: "1 capsule a day with food.",
    containsMinoxidil: false,
    containsFinasteride: false,
    menOnly: false,
    minAge: 0,
    topical: false,
    supplement: true,
    image: "/products/hair-supplement.svg",
  },
  scalp_massager: {
    id: "scalp_massager",
    name: "Scalp Massager",
    actives: "Device",
    why: "Improves blood flow to the scalp so topicals work better.",
    howToUse: "3–5 minutes a day, gently massaging the scalp.",
    containsMinoxidil: false,
    containsFinasteride: false,
    menOnly: false,
    minAge: 0,
    topical: false,
    supplement: false,
    image: "/products/scalp-massager.svg",
  },
  derma_stamp: {
    id: "derma_stamp",
    name: "Derma Stamp",
    actives: "Device",
    why: "Micro-needling that helps the absorption of topical treatment.",
    howToUse: "Once a week. Clean before and after use.",
    containsMinoxidil: false,
    containsFinasteride: false,
    menOnly: false,
    minAge: 0,
    topical: false,
    supplement: false,
    image: "/products/derma-stamp.svg",
  },
};

export const PRODUCT_IDS = Object.keys(PRODUCTS) as ProductId[];

export function productName(id: ProductId): string {
  return PRODUCTS[id].name;
}

// Storefront buttons for the result page (spec §10 §6).
export const STOREFRONTS = {
  website: "https://minoxiplus.com",
  shopee: "https://shopee.ph/happylifeorganics",
  lazada: "https://www.lazada.com.ph/shop/happy-life-organics",
  tiktok: "https://www.tiktok.com/@minoxiplushairgrower",
} as const;

// Consult channels (spec §10 §7).
export const CONSULT = {
  // Customer care number — used for Viber, WhatsApp, and call/text.
  phone: "09062525475",
  phoneIntl: "+639062525475",
  viber: "viber://chat?number=%2B639062525475",
  whatsapp: "https://wa.me/639062525475",
  facebook: "https://www.facebook.com/profile.php?id=61573788813937",
  messenger: "https://m.me/61573788813937",
  email: "care@minoxiplus.com", // TODO: confirm the real support email
} as const;
