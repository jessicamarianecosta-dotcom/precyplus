'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

import { createClient } from '@/lib/supabase/client';

import type {
  Material,
  StockMovement,
} from '@/types';

interface MaterialsContextType {
  materials: Material[];
  movements: StockMovement[];
  loading: boolean;

  syncPendingMaterials: () => Promise<void>;

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
  createContext<MaterialsContextType | null>(null);

export function MaterialsProvider({
  children,
}: {
  children: ReactNode;
}) {

  const supabase = createClient();

  const [materials, setMaterials] =
    useState<Material[]>([]);

  const [movements, setMovements] =
    useState<StockMovement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const PENDING_KEY =
    'precy_pending_materials';

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);

    try {
      await syncPendingMaterials();
      await reloadMaterials();
      await loadMovements();
    } catch (error) {
      console.error(
        'Erro ao iniciar materiais:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function reloadMaterials() {

    try {

      const {
        data: authData,
      } = await supabase.auth.getUser();

      if (!authData.user) {
        setMaterials([]);
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from('materials')
        .select('*')
        .eq(
          'user_id',
          authData.user.id
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        );

      if (error) {
        console.error(
          'Erro ao carregar materiais:',
          error
        );
        return;
      }

      setMaterials(data || []);

    } catch (error) {

      console.error(
        'Erro reloadMaterials:',
        error
      );
    }
  }

  async function loadMovements() {

    try {

      const {
        data,
        error,
      } = await supabase
        .from('stock_movements')
        .select('*')
        .order(
          'created_at',
          {
            ascending: false,
          }
        );

      if (error) {
        console.error(
          'Erro ao carregar movimentações:',
          error
        );
        return;
      }

      setMovements(data || []);

    } catch (error) {

      console.error(
        'Erro loadMovements:',
        error
      );
    }
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

    try {

      await supabase
        .from('stock_movements')
        .insert({
          material_id: material.id,
          material_name: material.name,
          quantity,
          type,
          reason,
        });

      await loadMovements();

    } catch (error) {

      console.error(
        'Erro ao adicionar movimentação:',
        error
      );
    }
  }

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
          data: authData,
          error: authError,
        } = await supabase.auth.getUser();

        if (
          authError ||
          !authData.user
        ) {
          throw new Error(
            'Usuário não autenticado'
          );
        }

        const unit_cost =
          calcUnitCost(
            Number(data.paid_value),
            Number(data.purchased_qty)
          );

        const payload = {
          name: data.name,
          category: data.category,
          purchased_qty:
            Number(data.purchased_qty),
          unit: data.unit,
          paid_value:
            Number(data.paid_value),
          available_qty:
            Number(
              data.available_qty ??
              data.purchased_qty
            ),
          min_stock:
            Number(data.min_stock),
          observations:
            data.observations || '',
          unit_cost,
          user_id:
            authData.user.id,
        };

        const {
          data: inserted,
          error,
        } = await supabase
          .from('materials')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error(
            'Erro ao salvar material:',
            error
          );
          throw error;
        }

        setMaterials(prev => [
          inserted,
          ...prev,
        ]);

        await reloadMaterials();
      },
      [supabase]
    );

  async function syncPendingMaterials() {

    try {

      const raw =
        localStorage.getItem(
          PENDING_KEY
        );

      if (!raw) return;

      const list: Material[] =
        JSON.parse(raw);

      if (
        !Array.isArray(list) ||
        list.length === 0
      ) {
        return;
      }

      const {
        data: authData,
      } = await supabase.auth.getUser();

      if (!authData.user) return;

      const remaining: Material[] =
        [];

      for (const itm of list) {

        try {

          const payload = {
            name: itm.name,
            category: itm.category,
            purchased_qty:
              itm.purchased_qty,
            unit: itm.unit,
            paid_value:
              itm.paid_value,
            available_qty:
              itm.available_qty,
            min_stock:
              itm.min_stock,
            observations:
              itm.observations,
            unit_cost:
              itm.unit_cost,
            user_id:
              authData.user.id,
          };

          const {
            error,
          } = await supabase
            .from('materials')
            .insert(payload);

          if (error) {
            remaining.push(itm);
          }

        } catch {
          remaining.push(itm);
        }
      }

      if (remaining.length === 0) {
        localStorage.removeItem(
          PENDING_KEY
        );
      } else {
        localStorage.setItem(
          PENDING_KEY,
          JSON.stringify(remaining)
        );
      }

    } catch (error) {

      console.error(
        'Erro syncPendingMaterials:',
        error
      );
    }
  }

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
          data.paid_value !== undefined ||
          data.purchased_qty !== undefined
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

        const {
          error,
        } = await supabase
          .from('materials')
          .update(updated)
          .eq('id', id);

        if (error) {
          console.error(
            'Erro ao atualizar material:',
            error
          );
          throw error;
        }

        await reloadMaterials();
      },
      [supabase]
    );

  const deleteMaterial =
    useCallback(
      async (id: string) => {

        const {
          error,
        } = await supabase
          .from('materials')
          .delete()
          .eq('id', id);

        if (error) {
          console.error(
            'Erro ao deletar material:',
            error
          );
          throw error;
        }

        await reloadMaterials();
      },
      [supabase]
    );

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
      [materials, supabase]
    );

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
      [materials, supabase]
    );

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
      [materials, supabase]
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
        syncPendingMaterials,
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