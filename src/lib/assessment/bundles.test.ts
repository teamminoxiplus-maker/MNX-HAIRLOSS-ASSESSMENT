import { describe, it, expect } from "vitest";
import { recommendBundle, BUNDLES } from "./bundles";
import { runEngine } from "./engine";
import type { Answers } from "./types";

function base(overrides: Partial<Answers> = {}): Answers {
  return {
    sex: "male",
    age_band: "25_34",
    duration: "6_12m",
    pattern: "receding",
    shedding: "noticeable",
    scalp: ["normal"],
    family_history: "no",
    triggers: ["none"],
    styling: "no",
    tried: ["none"],
    medical_flags: ["none"],
    goal: "regrow",
    ...overrides,
  };
}

const bundleFor = (a: Answers) => {
  const r = runEngine(a);
  return recommendBundle(r.concern, r.severity, r.recommended_products, r.referral_required);
};

describe("recommendBundle — safety-gated", () => {
  it("PRO/ADVANCED bundles always contain TriActive (men-only)", () => {
    expect(BUNDLES.PRO.items.map((i) => i.name).join(" ")).toMatch(/TriActive/);
    expect(BUNDLES.ADVANCED.items.map((i) => i.name).join(" ")).toMatch(/TriActive/);
    expect(BUNDLES.PRO.menOnly).toBe(true);
    expect(BUNDLES.ADVANCED.menOnly).toBe(true);
    expect(BUNDLES.STARTER.menOnly).toBe(false);
  });

  it("male advanced AGA → PRO", () => {
    expect(
      bundleFor(base({ sex: "male", pattern: "crown", duration: "gt_3y", shedding: "clumps", family_history: "yes" })),
    ).toBe("PRO");
  });

  it("male moderate AGA → ADVANCED", () => {
    expect(
      bundleFor(base({ sex: "male", pattern: "receding", duration: "1_3y", shedding: "noticeable" })),
    ).toBe("ADVANCED");
  });

  it("early male AGA → STARTER", () => {
    expect(
      bundleFor(base({ sex: "male", pattern: "receding", duration: "lt_6m", shedding: "normal", family_history: "no" })),
    ).toBe("STARTER");
  });

  it("female AGA never gets a TriActive bundle — STARTER only", () => {
    const b = bundleFor(
      base({ sex: "female", pattern: "widening_part", duration: "gt_3y", shedding: "clumps", family_history: "yes" }),
    );
    expect(b).toBe("STARTER");
    expect(b).not.toBe("PRO");
    expect(b).not.toBe("ADVANCED");
  });

  it("pregnant → no bundle (consult route)", () => {
    expect(
      bundleFor(base({ sex: "female", pattern: "widening_part", medical_flags: ["pregnant"] })),
    ).toBeNull();
  });

  it("under 18 → no bundle", () => {
    expect(bundleFor(base({ age_band: "below_18", pattern: "crown" }))).toBeNull();
  });

  it("refer route (scalp wound) → no bundle", () => {
    expect(
      bundleFor(base({ medical_flags: ["scalp_wound"], pattern: "crown" })),
    ).toBeNull();
  });

  it("minoxidil allergy strips TriActive → not a TriActive bundle", () => {
    const b = bundleFor(
      base({ sex: "male", pattern: "crown", duration: "gt_3y", shedding: "clumps", medical_flags: ["minoxidil_allergy"] }),
    );
    expect(b).not.toBe("PRO");
    expect(b).not.toBe("ADVANCED");
  });
});
