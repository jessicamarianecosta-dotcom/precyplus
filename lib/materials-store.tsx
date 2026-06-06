'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Material, StockMovement } from '@/types';

// ── Dados demo iniciais ───────────────────────────────────────────────────────
const INITIAL_MATERIALS: Material[] = [
  { id: '1', user_id: 'u1', name: 'Papel Sulfite A4', category: 'Papelaria', purchased_qty: 500, unit: 'folha', paid_value: 20, available_qty: 400, min_stock: 100, unit_cost: 0.04, created_at: '' },
  { id: '2', user_id: 'u1', name: 'Wire-o 3/4',       category: 'Papelaria', purchased_qty: 10,  unit: 'unidade', paid_value: 35, available_qty: 8,   min_stock: 5,   unit_cost: 3.50, created_at: '' },
  { id: '3', user_id: 'u1', name: 'Capa PVC',         category: 'Papelaria', purchased_qty: 50,  unit: 'unidade', paid_value: 40, available_qty: 38,  min_stock: 10,  unit_cost: 0.80, created_at: '' },
  { id: '4', user_id: 'u1', name: 'Fita Washi Floral',category: 'Artesanato',purchased_qty: 5,   unit: 'rolo',    paid_value: 25, available_qty: 4,   min_stock: 3,   unit_cost: 5.00, created_at: '' },
  { id: '5', user_id: 'u1', name: 'Papelão duplex',   category: 'Papelaria', purchased_qty: 30,  unit: 'folha',   paid_value: 15, available_qty: 30,  min_stock: 5,   unit_cost: 0.50, created_at: '' },
  { id: '6', user_id: 'u1', name: 'Miolo sulfite A5', category: 'Papelaria', purchased_qty: 200, unit: 'folha',   paid_value: 18, available_qty: 200, min_stock: 50,  unit_cost: 0.09, created_at: '' },
  { id: '7', user_id: 'u1', name: 'Adesivo vinil',    category: 'Personalizados', purchased_qty: 10, unit: 'folha', paid_value: 30, available_qty: 10, min_stock: 3, unit_cost: 3.00, created_at: '' },
];

// ── Tipos do contexto ─────────────────────────────────────────────────────────
interface MaterialsContextType {
  materials: Material[];
  movements: StockMovement[];
  // CRUD
  addMaterial: (m: Omit<Material, 'id' | 'user_id' | 'created_at' | 'unit_cost'>) => void;
  updateMaterial: (id: string, m: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  // Estoque
  decreaseStock: (entries: { material_id: string; quantity: number; reason: string }[]) => string[];
  increaseStock: (material_id: string, quantity: number, reason: string) => void;
  adjustStock: (material_id: string, delta: number) => void;
}

const MaterialsContext = createContext<MaterialsContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function MaterialsProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  // Calcula custo unitário
  const calcUnitCost = (paid: number, qty: number) => (qty > 0 ? paid / qty : 0);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addMaterial = useCallback((data: Omit<Material, 'id' | 'user_id' | 'created_at' | 'unit_cost'>) => {
    const id = Date.now().toString();
    const unit_cost = calcUnitCost(data.paid_value, data.purchased_qty);
    setMaterials(prev => [
      { id, user_id: 'u1', ...data, unit_cost, created_at: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const updateMaterial = useCallback((id: string, data: Partial<Material>) => {
    setMaterials(prev => prev.map(m => {
      if (m.id !== id) return m;
      const updated = { ...m, ...data };
      if (data.paid_value !== undefined || data.purchased_qty !== undefined) {
        updated.unit_cost = calcUnitCost(updated.paid_value, updated.purchased_qty);
      }
      return updated;
    }));
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  }, []);

  // ── Baixar estoque (ao salvar produto) ────────────────────────────────────
  // Retorna array de warnings (materiais que ficaram com estoque crítico/zerado)
  const decreaseStock = useCallback((
    entries: { material_id: string; quantity: number; reason: string }[]
  ): string[] => {
    const warnings: string[] = [];

    setMaterials(prev => prev.map(m => {
      const entry = entries.find(e => e.material_id === m.id);
      if (!entry) return m;

      const newQty = Math.max(0, m.available_qty - entry.quantity);
      if (newQty <= 0) warnings.push(`${m.name} zerou o estoque!`);
      else if (newQty < m.min_stock) warnings.push(`${m.name} ficou abaixo do estoque mínimo.`);

      return { ...m, available_qty: newQty };
    }));

    // Registra movimentações
    setMovements(prev => [
      ...entries.map(e => {
        const mat = materials.find(m => m.id === e.material_id);
        return {
          id: Date.now().toString() + Math.random(),
          user_id: 'u1',
          material_id: e.material_id,
          material_name: mat?.name ?? e.material_id,
          type: 'exit' as const,
          quantity: e.quantity,
          reason: e.reason,
          created_at: new Date().toISOString(),
        };
      }),
      ...prev,
    ]);

    return warnings;
  }, [materials]);

  // ── Entrada de estoque ────────────────────────────────────────────────────
  const increaseStock = useCallback((material_id: string, quantity: number, reason: string) => {
    const mat = materials.find(m => m.id === material_id);
    setMaterials(prev => prev.map(m =>
      m.id === material_id ? { ...m, available_qty: m.available_qty + quantity } : m
    ));
    setMovements(prev => [{
      id: Date.now().toString(),
      user_id: 'u1',
      material_id,
      material_name: mat?.name ?? material_id,
      type: 'entry' as const,
      quantity,
      reason,
      created_at: new Date().toISOString(),
    }, ...prev]);
  }, [materials]);

  // ── Ajuste manual ─────────────────────────────────────────────────────────
  const adjustStock = useCallback((material_id: string, delta: number) => {
    const mat = materials.find(m => m.id === material_id);
    setMaterials(prev => prev.map(m =>
      m.id === material_id
        ? { ...m, available_qty: Math.max(0, m.available_qty + delta) }
        : m
    ));
    setMovements(prev => [{
      id: Date.now().toString(),
      user_id: 'u1',
      material_id,
      material_name: mat?.name ?? material_id,
      type: 'adjustment' as const,
      quantity: Math.abs(delta),
      reason: delta > 0 ? `Ajuste manual +${delta}` : `Ajuste manual ${delta}`,
      created_at: new Date().toISOString(),
    }, ...prev]);
  }, [materials]);

  return (
    <MaterialsContext.Provider value={{
      materials, movements,
      addMaterial, updateMaterial, deleteMaterial,
      decreaseStock, increaseStock, adjustStock,
    }}>
      {children}
    </MaterialsContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useMaterials() {
  const ctx = useContext(MaterialsContext);
  if (!ctx) throw new Error('useMaterials must be used inside <MaterialsProvider>');
  return ctx;
}
