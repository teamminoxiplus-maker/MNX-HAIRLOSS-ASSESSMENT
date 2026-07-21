import { describe, it, expect } from "vitest";
import { BUNDLES } from "./bundles";
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

const bundleFor = (a: Answers) => runEngine(a).recommended_bundle;

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

  it("severe man WITH a scalp issue (MIXED) still reaches ADVANCED/PRO", () => {
    // Previously capped at STARTER — a dandruffy scalp shouldn't downgrade the tier.
    expect(
      bundleFor(
        base({ sex: "male", pattern: "crown", scalp: ["dandruff"], duration: "gt_3y", shedding: "clumps", family_history: "yes" }),
      ),
    ).toBe("PRO");
    expect(
      bundleFor(
        base({ sex: "male", pattern: "receding", scalp: ["oily"], duration: "1_3y", shedding: "noticeable" }),
      ),
    ).toBe("ADVANCED");
  });

  it("woman with a scalp issue (MIXED) stays STARTER (men-only rule)", () => {
    expect(
      bundleFor(
        base({ sex: "female", pattern: "widening_part", scalp: ["dandruff"], duration: "gt_3y", shedding: "clumps", family_history: "yes" }),
      ),
    ).toBe("STARTER");
  });

  it("advanced man with dandruff (SEB_DERM) reaches PRO, not STARTER", () => {
    // The reported case: Stage 3 dandruff/scalp irritation was capping at Starter.
    const r = runEngine(
      base({ sex: "male", pattern: "diffuse", scalp: ["dandruff"], duration: "gt_3y", shedding: "clumps", family_history: "yes" }),
    );
    expect(r.concern).toBe("SEB_DERM");
    expect(r.recommended_bundle).toBe("PRO");
  });

  it("tier is severity+sex across concerns: STARTER only for women or mild", () => {
    // eligible man, moderate → ADVANCED regardless of concern
    expect(bundleFor(base({ sex: "male", pattern: "diffuse", scalp: ["oily"], duration: "1_3y", shedding: "noticeable" }))).toBe("ADVANCED");
    // eligible man, mild → STARTER
    expect(bundleFor(base({ sex: "male", pattern: "receding", duration: "lt_6m", shedding: "normal", family_history: "no" }))).toBe("STARTER");
    // woman, severe → STARTER
    expect(bundleFor(base({ sex: "female", pattern: "diffuse", scalp: ["dandruff"], duration: "gt_3y", shedding: "clumps", family_history: "yes" }))).toBe("STARTER");
  });
});
