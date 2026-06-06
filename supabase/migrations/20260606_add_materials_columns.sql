-- Migration: add missing materials columns
-- Date: 2026-06-06

BEGIN;

ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS available_qty integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchased_qty integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unit_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_stock integer DEFAULT 0;

-- Ensure defaults are set
ALTER TABLE public.materials
  ALTER COLUMN available_qty SET DEFAULT 0,
  ALTER COLUMN purchased_qty SET DEFAULT 0,
  ALTER COLUMN paid_value SET DEFAULT 0,
  ALTER COLUMN unit_cost SET DEFAULT 0,
  ALTER COLUMN min_stock SET DEFAULT 0;

COMMIT;
