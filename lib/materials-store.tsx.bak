'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

import {
  createClient,
} from '@/lib/supabase/client';

import type {
  Material,
  StockMovement,
} from '@/types';

interface MaterialsContextType {

  materials: Material[];

  movements: StockMovement[];

  loading: boolean;

  addMaterial: (
    data: Omit<
      Material,
      'id' |
      'user_id' |
      'created_at' |
      'unit_cost'
    >
  ) => Promise<void>;

  updateMaterial: (
    id: string,
    data: Partial<Material>
  ) => Promise<void>;

  deleteMaterial: (
    id: string
  ) => Promise<void>;

  decreaseStock: (
    entries: {
      material_id: string;
      quantity: number;
      reason: string;
    }[]
  ) => Promise<string[]>;

  increaseStock: (
    material_id: string,
    quantity: number,
    reason: string
  ) => Promise<void>;

  adjustStock: (
    material_id: string,
    delta: number
  ) => Promise<void>;

  reloadMaterials: () => Promise<void>;
}

const MaterialsContext =
  createContext<MaterialsContextType | null>(
    null
  );

export function MaterialsProvider({
  children,
}: {
  children: ReactNode;
}) {

  const supabase =
    createClient();

  const [materials, setMaterials] =
    useState<Material[]>([]);

  const [movements, setMovements] =
    useState<StockMovement[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    reloadMaterials();
    loadMovements();
  }, []);

  async function reloadMaterials() {

    const {
      data,
    } = await supabase
      .from('materials')
      .select('*')
      .order(
        'created_at',
        {
          ascending: false,
        }
      );

    setMaterials(
      data || []
    );

    setLoading(false);
  }

  async function loadMovements() {

    const {
      data,
    } = await supabase
      .from('stock_movements')
      .select('*')
      .order(
        'created_at',
        {
          ascending: false,
        }
      );

    setMovements(
      data || []
    );
  }

  function calcUnitCost(
    paid: number,
    qty: number
  ) {

    return qty > 0
      ? paid / qty
      : 0;
  }

  async function addMovement(
    material: Material,
    type:
      | 'entry'
      | 'exit'
      | 'adjust',
    quantity: number,
    reason: string
  ) {

    await supabase
      .from(
        'stock_movements'
      )
      .insert({

        material_id:
          material.id,

        material_name:
          material.name,

        quantity,

        type,

        reason,
      });

    loadMovements();
  }

  // ADD
  const addMaterial =
    useCallback(
      async (
        data: Omit<
          Material,
          'id' |
          'user_id' |
          'created_at' |
          'unit_cost'
        >
      ) => {

        const {
          data: auth,
        } =
          await supabase.auth.getUser();

        const unit_cost =
          calcUnitCost(
            data.paid_value,
            data.purchased_qty
          );

        await supabase
          .from('materials')
          .insert({

            ...data,

            user_id:
              auth.user?.id,

            unit_cost,

            available_qty:
              data.available_qty ??
              data.purchased_qty,
          });

        await reloadMaterials();
      },
      []
    );

  // UPDATE
  const updateMaterial =
    useCallback(
      async (
        id: string,
        data: Partial<Material>
      ) => {

        const updated = {
          ...data,
        };

        if (
          data.paid_value !==
            undefined ||
          data.purchased_qty !==
            undefined
        ) {

          updated.unit_cost =
            calcUnitCost(
              Number(
                data.paid_value
              ),
              Number(
                data.purchased_qty
              )
            );
        }

        await supabase
          .from('materials')
          .update(updated)
          .eq('id', id);

        await reloadMaterials();
      },
      []
    );

  // DELETE
  const deleteMaterial =
    useCallback(
      async (id: string) => {

        await supabase
          .from('materials')
          .delete()
          .eq('id', id);

        await reloadMaterials();
      },
      []
    );

  // DECREASE
  const decreaseStock =
    useCallback(
      async (
        entries: {
          material_id: string;
          quantity: number;
          reason: string;
        }[]
      ) => {

        const warnings: string[] =
          [];

        for (const entry of entries) {

          const material =
            materials.find(
              m =>
                m.id ===
                entry.material_id
            );

          if (!material)
            continue;

          const newQty =
            Math.max(
              0,
              material.available_qty -
                entry.quantity
            );

          await supabase
            .from('materials')
            .update({
              available_qty:
                newQty,
            })
            .eq(
              'id',
              material.id
            );

          await addMovement(
            material,
            'exit',
            entry.quantity,
            entry.reason
          );

          if (newQty <= 0) {

            warnings.push(
              `${material.name} zerou o estoque!`
            );
          }
        }

        await reloadMaterials();

        return warnings;
      },
      [materials]
    );

  // INCREASE
  const increaseStock =
    useCallback(
      async (
        material_id: string,
        quantity: number,
        reason: string
      ) => {

        const material =
          materials.find(
            m =>
              m.id ===
              material_id
          );

        if (!material)
          return;

        await supabase
          .from('materials')
          .update({

            available_qty:
              material.available_qty +
              quantity,
          })
          .eq(
            'id',
            material_id
          );

        await addMovement(
          material,
          'entry',
          quantity,
          reason
        );

        await reloadMaterials();
      },
      [materials]
    );

  // ADJUST
  const adjustStock =
    useCallback(
      async (
        material_id: string,
        delta: number
      ) => {

        const material =
          materials.find(
            m =>
              m.id ===
              material_id
          );

        if (!material)
          return;

        const newQty =
          Math.max(
            0,
            material.available_qty +
              delta
          );

        await supabase
          .from('materials')
          .update({
            available_qty:
              newQty,
          })
          .eq(
            'id',
            material_id
          );

        await addMovement(
          material,
          'adjust',
          Math.abs(delta),
          'Ajuste manual'
        );

        await reloadMaterials();
      },
      [materials]
    );

  return (

    <MaterialsContext.Provider
      value={{

        materials,

        movements,

        loading,

        addMaterial,

        updateMaterial,

        deleteMaterial,

        decreaseStock,

        increaseStock,

        adjustStock,

        reloadMaterials,
      }}
    >

      {children}

    </MaterialsContext.Provider>
  );
}

export function useMaterials() {

  const ctx =
    useContext(
      MaterialsContext
    );

  if (!ctx) {

    throw new Error(
      'useMaterials must be used inside MaterialsProvider'
    );
  }

  return ctx;
}