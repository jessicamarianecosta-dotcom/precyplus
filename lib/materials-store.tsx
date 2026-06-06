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

  const PENDING_KEY = 'precy_pending_materials';

  useEffect(() => {
    reloadMaterials();
    loadMovements();
    // try to sync any locally saved pending materials
    (async () => {
      await new Promise(r => setTimeout(r, 500));
      try { await syncPendingMaterials(); } catch (e) { /* ignore */ }
    })();

    const _int = setInterval(() => {
      syncPendingMaterials();
    }, 1000 * 60 * 2); // every 2 minutes

    return () => clearInterval(_int);
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

        try {
          const { data: inserted, error } = await supabase
            .from('materials')
            .insert({
              ...data,
              user_id: auth.user?.id,
              unit_cost,
              available_qty: data.available_qty ?? data.purchased_qty,
            })
            .select()
            .single();

          if (error) throw error;

          await reloadMaterials();
        } catch (err) {
          // Fallback: save locally to be synced later
          try {
            const id = (globalThis.crypto && (globalThis.crypto as any).randomUUID)
              ? (globalThis.crypto as any).randomUUID()
              : String(Date.now());

            const pendingItem: Material = {
              id,
              user_id: auth.user?.id || null,
              name: data.name,
              category: data.category,
              purchased_qty: Number(data.purchased_qty) || 0,
              unit: data.unit,
              paid_value: Number(data.paid_value) || 0,
              available_qty: Number(data.available_qty ?? data.purchased_qty) || 0,
              min_stock: Number(data.min_stock) || 0,
              observations: data.observations || '',
              unit_cost: unit_cost,
              created_at: new Date().toISOString(),
            } as Material;

            const raw = localStorage.getItem(PENDING_KEY);
            const list: Material[] = raw ? JSON.parse(raw) : [];
            list.unshift(pendingItem);
            localStorage.setItem(PENDING_KEY, JSON.stringify(list));

            // show in UI immediately
            setMaterials(prev => [pendingItem, ...prev]);
          } catch (localErr) {
            console.error('Failed to save pending material locally', localErr);
            throw err;
          }
        }
      },
      []
    );

  // Try to sync pending materials saved in localStorage to Supabase
  async function syncPendingMaterials() {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (!raw) return;
      const list: Material[] = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) return;

      const { data: auth } = await supabase.auth.getUser();

      const remaining: Material[] = [];

      for (const itm of list) {
        try {
          const payload = {
            name: itm.name,
            category: itm.category,
            purchased_qty: itm.purchased_qty,
            unit: itm.unit,
            paid_value: itm.paid_value,
            available_qty: itm.available_qty,
            min_stock: itm.min_stock,
            observations: itm.observations,
            user_id: auth.user?.id || itm.user_id,
          };

          const { error } = await supabase.from('materials').insert(payload);
          if (error) {
            console.warn('Sync: insert error for pending material', itm.id, error.message);
            remaining.push(itm);
          }
        } catch (e) {
          console.warn('Sync attempt failed for item', itm.id, e);
          remaining.push(itm);
        }
      }

      if (remaining.length === 0) {
        localStorage.removeItem(PENDING_KEY);
      } else {
        localStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
      }

      // refresh from server to reflect successful inserts
      await reloadMaterials();
    } catch (e) {
      console.warn('syncPendingMaterials error', e);
    }
  }

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