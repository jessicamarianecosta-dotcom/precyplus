export interface Company {
  id: string;
  user_id: string;
  name: string;
  owner_name: string;
  whatsapp?: string;
  instagram?: string;
  city?: string;
  state?: string;
  logo_url?: string;
  created_at: string;
}

export interface FixedCost {
  id: string;
  user_id: string;
  name: string;
  value: number;
  category: string;
  created_at: string;
}

export interface Material {
  id: string;
  user_id: string;
  name: string;
  category: string;
  purchased_qty: number;
  unit: string;
  paid_value: number;
  available_qty: number;
  min_stock: number;
  unit_cost: number;
  observations?: string;
  created_at: string;
}

export type StockStatus = 'healthy' | 'low' | 'critical';

export interface StockMovement {
  id: string;
  user_id: string;
  material_id: string;
  material_name: string;
  type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  reason?: string;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description?: string;
  sale_price?: number;
  materials: ProductMaterial[];
  labor_time_minutes: number;
  created_at: string;
}

export interface ProductMaterial {
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
}

export interface Pricing {
  id: string;
  user_id: string;
  product_id?: string;
  product_name: string;
  materials_cost: number;
  labor_cost: number;
  fixed_cost_share: number;
  packaging_cost: number;
  delivery_cost: number;
  direct_cost?: number;
  indirect_cost?: number;
  commission_pct: number;
  extra_taxes: number;
  profit_margin: number;
  total_cost: number;
  min_price: number;
  recommended_price: number;
  premium_price: number;
  profit_estimated?: number;
  materials?: ProductMaterial[];
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  whatsapp?: string;
  email?: string;
  observations?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  client_id?: string;
  client_name: string;
  items: BudgetItem[];
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  valid_until?: string;
  notes?: string;
  created_at: string;
}

export interface BudgetItem {
  pricing_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface FinancialEntry {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  value: number;
  description: string;
  category: string;
  client_name?: string;
  due_date?: string;
  paid_at?: string;
  status: 'pending' | 'paid';
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  work_hours_day: number;
  work_days_month: number;
  profit_goal: number;
  default_margin: number;
  default_commission: number;
  default_waste: number;
}

export type MaterialUnit =
  | 'unidade' | 'metro' | 'centímetro' | 'milímetro' | 'metro quadrado'
  | 'quilograma' | 'grama' | 'litro' | 'mililitro' | 'folha'
  | 'caixa' | 'pacote' | 'rolo' | 'kit';

export type MaterialCategory =
  | 'Papelaria' | 'Artesanato' | 'Confeitaria' | 'Cosméticos' | 'Brindes'
  | 'Personalizados' | 'Sublimação' | 'Costura' | 'Velas' | 'Outros';
