-- Add new product metadata fields for integrated precificação flow
ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'unidade',
  ADD COLUMN IF NOT EXISTS product_type TEXT;
