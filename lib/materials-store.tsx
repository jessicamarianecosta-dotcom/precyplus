'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';

import type { Material, StockMovement } from '@/types';

// STORAGE KEYS
const MATERIALS_KEY = 'precy_materials';
const MOVEMENTS_KEY = 'precy_movements';

// DADOS INICIAIS (só primeira vez)
const INITIAL_MATERIALS: Material[] = [
  {
    id: '1',
    user_id: 'u1',
    name: 'Papel Sulfite A4',
    category: 'Papelaria',
    purchased_qty: 500,
    unit: 'folha',
    paid_value: 20,
    available_qty: 400,
    min_stock: 100,
    unit_cost: 0.04,
    created_at: '',
  },
];

interface MaterialsContextType {
  materials: Material[];
  movements: StockMovement[];

  addMaterial: (
    m: Omit<
      Material,
      'id' | 'user_id' | 'created_at' | 'unit_cost'
    >
  ) => void;

  updateMaterial: (
    id: string,
    m: Partial<Material>
  ) => void;

  deleteMaterial: (id: string) => void;

  decreaseStock: (
    entries: {
      material_id: string;
      quantity: number;
      reason: string;
    }[]
  ) => string[];

  increaseStock: (
    material_id: string,
    quantity: number,
    reason: string
  ) => void;

  adjustStock: (
    material_id: string,
    delta: number
  ) => void;
}

const MaterialsContext =
  createContext<MaterialsContextType | null>(null);

export function MaterialsProvider({
  children,
}: {
  children: ReactNode;
}) {

  // LOAD STORAGE
  const [materials, setMaterials] = useState<Material[]>(() => {
    if (typeof window === 'undefined')
      return INITIAL_MATERIALS;

    const saved = localStorage.getItem(MATERIALS_KEY);

    return saved
      ? JSON.parse(saved)
      : INITIAL_MATERIALS;
  });

  const [movements, setMovements] =
    useState<StockMovement[]>(() => {
      if (typeof window === 'undefined')
        return [];

      const saved =
        localStorage.getItem(MOVEMENTS_KEY);

      return saved ? JSON.parse(saved) : [];
    });

  // SAVE STORAGE
  useEffect(() => {
    localStorage.setItem(
      MATERIALS_KEY,
      JSON.stringify(materials)
    );
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(
      MOVEMENTS_KEY,
      JSON.stringify(movements)
    );
  }, [movements]);

  const calcUnitCost = (
    paid: number,
    qty: number
  ) => (qty > 0 ? paid / qty : 0);

  // ADD
  const addMaterial = useCallback(
    (
      data: Omit<
        Material,
        'id' | 'user_id' | 'created_at' | 'unit_cost'
      >
    ) => {
      const id = Date.now().toString();

      const unit_cost = calcUnitCost(
        data.paid_value,
        data.purchased_qty
      );

      setMaterials(prev => [
        {
          id,
          user_id: 'u1',
          ...data,
          unit_cost,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    []
  );

  // UPDATE
  const updateMaterial = useCallback(
    (id: string, data: Partial<Material>) => {
      setMaterials(prev =>
        prev.map(m => {
          if (m.id !== id) return m;

          const updated = {
            ...m,
            ...data,
          };

          if (
            data.paid_value !== undefined ||
            data.purchased_qty !== undefined
          ) {
            updated.unit_cost = calcUnitCost(
              updated.paid_value,
              updated.purchased_qty
            );
          }

          return updated;
        })
      );
    },
    []
  );

  // DELETE
  const deleteMaterial = useCallback(
    (id: string) => {
      setMaterials(prev =>
        prev.filter(m => m.id !== id)
      );
    },
    []
  );

  // DECREASE
  const decreaseStock = useCallback(
    (
      entries: {
        material_id: string;
        quantity: number;
        reason: string;
      }[]
    ) => {
      const warnings: string[] = [];

      setMaterials(prev =>
        prev.map(m => {
          const entry = entries.find(
            e => e.material_id === m.id
          );

          if (!entry) return m;

          const newQty = Math.max(
            0,
            m.available_qty - entry.quantity
          );

          if (newQty <= 0) {
            warnings.push(
              `${m.name} zerou o estoque!`
            );
          }

          return {
            ...m,
            available_qty: newQty,
          };
        })
      );

      return warnings;
    },
    []
  );

  // INCREASE
  const increaseStock = useCallback(
    (
      material_id: string,
      quantity: number,
      reason: string
    ) => {
      setMaterials(prev =>
        prev.map(m =>
          m.id === material_id
            ? {
                ...m,
                available_qty:
                  m.available_qty + quantity,
              }
            : m
        )
      );
    },
    []
  );

  // ADJUST
  const adjustStock = useCallback(
    (material_id: string, delta: number) => {
      setMaterials(prev =>
        prev.map(m =>
          m.id === material_id
            ? {
                ...m,
                available_qty: Math.max(
                  0,
                  m.available_qty + delta
                ),
              }
            : m
        )
      );
    },
    []
  );

  return (
    <MaterialsContext.Provider
      value={{
        materials,
        movements,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        decreaseStock,
        increaseStock,
        adjustStock,
      }}
    >
      {children}
    </MaterialsContext.Provider>
  );
}

export function useMaterials() {
  const ctx = useContext(MaterialsContext);

  if (!ctx) {
    throw new Error(
      'useMaterials must be used inside MaterialsProvider'
    );
  }

  return ctx;
}