-- =========================================================
-- PRECY+ — Schema completo com Stripe + funções de estoque
-- Execute no SQL Editor do Supabase
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles (com campos Stripe) ──────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                      UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name               TEXT,
  avatar_url              TEXT,
  plan                    TEXT DEFAULT 'basic' CHECK (plan IN ('basic','pro','free')),
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile" ON profiles USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── Companies ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL, owner_name TEXT, whatsapp TEXT, instagram TEXT, city TEXT, state TEXT, logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own company" ON companies USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── User Settings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  work_hours_day NUMERIC DEFAULT 8, work_days_month NUMERIC DEFAULT 22,
  hourly_rate NUMERIC DEFAULT 15, profit_goal NUMERIC DEFAULT 40,
  default_margin NUMERIC DEFAULT 40, default_commission NUMERIC DEFAULT 5, default_waste NUMERIC DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own settings" ON user_settings USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Fixed Costs ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fixed_costs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, value NUMERIC NOT NULL DEFAULT 0, category TEXT DEFAULT 'Outros',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE fixed_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own fixed_costs" ON fixed_costs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Materials ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Outros',
  purchased_qty NUMERIC NOT NULL DEFAULT 0, unit TEXT NOT NULL DEFAULT 'unidade',
  paid_value NUMERIC NOT NULL DEFAULT 0, available_qty NUMERIC NOT NULL DEFAULT 0,
  min_stock NUMERIC NOT NULL DEFAULT 5,
  unit_cost NUMERIC GENERATED ALWAYS AS (
    CASE WHEN purchased_qty > 0 THEN paid_value / purchased_qty ELSE 0 END
  ) STORED,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own materials" ON materials USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── RPC: estoque ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION decrease_stock(p_material_id UUID, p_quantity NUMERIC)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE materials SET available_qty = GREATEST(0, available_qty - p_quantity), updated_at = NOW()
  WHERE id = p_material_id;
END;
$$;

CREATE OR REPLACE FUNCTION adjust_stock(p_material_id UUID, p_delta NUMERIC)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE materials SET available_qty = GREATEST(0, available_qty + p_delta), updated_at = NOW()
  WHERE id = p_material_id;
END;
$$;

-- ── Stock Movements ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  material_name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('entry','exit','adjustment')),
  quantity NUMERIC NOT NULL, reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own movements" ON stock_movements USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION fill_material_name()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.material_id IS NOT NULL AND (NEW.material_name IS NULL OR NEW.material_name = '') THEN
    SELECT name INTO NEW.material_name FROM materials WHERE id = NEW.material_id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_fill_material_name ON stock_movements;
CREATE TRIGGER trg_fill_material_name BEFORE INSERT ON stock_movements FOR EACH ROW EXECUTE FUNCTION fill_material_name();

-- ── Products ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Outros', description TEXT,
  labor_time_minutes NUMERIC DEFAULT 30, created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own products" ON products USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Product Materials ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  material_name TEXT NOT NULL, quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL, unit_cost NUMERIC NOT NULL DEFAULT 0, total_cost NUMERIC NOT NULL DEFAULT 0
);
ALTER TABLE product_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own product_materials" ON product_materials
  USING (EXISTS (SELECT 1 FROM products WHERE id = product_id AND user_id = auth.uid()));

-- ── Pricings ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pricings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  materials_cost NUMERIC DEFAULT 0, labor_cost NUMERIC DEFAULT 0, fixed_cost_share NUMERIC DEFAULT 0,
  packaging_cost NUMERIC DEFAULT 0, delivery_cost NUMERIC DEFAULT 0,
  commission_pct NUMERIC DEFAULT 5, extra_taxes NUMERIC DEFAULT 0, profit_margin NUMERIC DEFAULT 40,
  total_cost NUMERIC DEFAULT 0, min_price NUMERIC DEFAULT 0,
  recommended_price NUMERIC DEFAULT 0, premium_price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE pricings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own pricings" ON pricings USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Clients ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, whatsapp TEXT, email TEXT, observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own clients" ON clients USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Budgets ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL, items JSONB NOT NULL DEFAULT '[]', total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','approved','rejected')),
  valid_until DATE, notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own budgets" ON budgets USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Financial Entries ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  value NUMERIC NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
  client_name TEXT, due_date DATE, paid_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own financial" ON financial_entries USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_materials_user       ON materials(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user        ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_pricings_user        ON pricings(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_user       ON financial_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user         ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_movements_user       ON stock_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user         ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe      ON profiles(stripe_customer_id);
