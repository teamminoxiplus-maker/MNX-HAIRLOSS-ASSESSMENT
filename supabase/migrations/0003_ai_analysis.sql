-- ============================================================================
-- MINOXIPLUS — AI-powered analysis text (spec §9.5)
-- ============================================================================
-- Stores the short, AI-generated interpretation shown on the result page and
-- emailed to the lead. Prose only — the deterministic engine still owns every
-- concern / severity / product / referral decision. Nullable: if generation is
-- unconfigured or fails, the row keeps NULL and the static copy is shown.
-- ============================================================================

alter table public.assessments
  add column if not exists ai_analysis text;
