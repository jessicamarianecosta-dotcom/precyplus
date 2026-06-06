'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

import { toast } from 'sonner';

import {
  PageHeader,
  Button,
  Modal,
  Input,
  Select,
  Textarea,
  EmptyState,
  Badge,
} from '@/components/ui';

import {
  formatCurrency,
  MATERIAL_CATEGORIES,
  getStockStatus,
} from '@/lib/utils';

import { useMaterials } from '@/lib/materials-store';

import type {
  Product,
  ProductMaterial,
} from '@/types';

// STORAGE
const PRODUCTS_KEY = 'precy_products';

// DEMO APENAS PRIMEIRA VEZ
const DEMO_PRODUCTS: Product[] = [
  {
    id: '1',
    user_id: 'u1',
    name: 'Caderno A5 Wire-o',
    category: 'Papelaria',
    description:
      'Caderno artesanal com capa PVC e miolo sulfite',
    labor_time_minutes: 30,
    created_at: '',

    materials: [
      {
        material_id: '1',
        material_name: 'Papel Sulfite A4',
        quantity: 100,
        unit: 'folha',
        unit_cost: 0.04,
        total_cost: 4.0,
      },
    ],
  },
];

export default function ProdutosPage() {

  const {
    materials,
    decreaseStock,
  } = useMaterials();

  // LOAD STORAGE
  const [products, setProducts] =
    useState<Product[]>(() => {
      if (typeof window === 'undefined')
        return DEMO_PRODUCTS;

      const saved =
        localStorage.getItem(PRODUCTS_KEY);

      return saved
        ? JSON.parse(saved)
        : DEMO_PRODUCTS;
    });

  // SAVE STORAGE
  useEffect(() => {
    localStorage.setItem(
      PRODUCTS_KEY,
      JSON.stringify(products)
    );
  }, [products]);

  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<Product | null>(null);

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    labor_time_minutes: 30,
  });

  const [prodMaterials, setProdMaterials] =
    useState<ProductMaterial[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [stockWarnings, setStockWarnings] =
    useState<string[]>([]);

  const filtered = products.filter(p =>
    p.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function openNew() {
    setEditing(null);

    setForm({
      name: '',
      category: '',
      description: '',
      labor_time_minutes: 30,
    });

    setProdMaterials([]);
    setStockWarnings([]);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);

    setForm({
      name: p.name,
      category: p.category,
      description: p.description || '',
      labor_time_minutes:
        p.labor_time_minutes,
    });

    setProdMaterials(p.materials);

    setStockWarnings([]);

    setModalOpen(true);
  }

  function addMaterialLine() {
    setProdMaterials(prev => [
      ...prev,
      {
        material_id: '',
        material_name: '',
        quantity: 1,
        unit: '',
        unit_cost: 0,
        total_cost: 0,
      },
    ]);
  }

  function removeMaterialLine(i: number) {
    setProdMaterials(prev =>
      prev.filter((_, idx) => idx !== i)
    );
  }

  function selectMaterial(
    i: number,
    materialId: string
  ) {
    const found = materials.find(
      m => m.id === materialId
    );

    setProdMaterials(prev =>
      prev.map((pm, idx) => {
        if (idx !== i) return pm;

        if (!found) {
          return {
            ...pm,
            material_id: materialId,
            material_name: '',
            unit: '',
            unit_cost: 0,
            total_cost: 0,
          };
        }

        return {
          ...pm,
          material_id: found.id,
          material_name: found.name,
          unit: found.unit,
          unit_cost: found.unit_cost,
          total_cost:
            found.unit_cost * pm.quantity,
        };
      })
    );
  }

  function setQuantity(
    i: number,
    qty: string
  ) {
    const q = parseFloat(qty) || 0;

    setProdMaterials(prev =>
      prev.map((pm, idx) => {
        if (idx !== i) return pm;

        return {
          ...pm,
          quantity: q,
          total_cost:
            pm.unit_cost * q,
        };
      })
    );
  }

  const totalMaterialCost =
    prodMaterials.reduce(
      (s, m) => s + m.total_cost,
      0
    );

  function checkStock(): {
    ok: boolean;
    alerts: string[];
  } {
    const alerts: string[] = [];

    for (const pm of prodMaterials) {
      if (!pm.material_id) continue;

      const mat = materials.find(
        m => m.id === pm.material_id
      );

      if (!mat) continue;

      if (
        pm.quantity >
        mat.available_qty
      ) {
        alerts.push(
          `⚠️ ${mat.name}: precisa de ${pm.quantity} ${mat.unit}, mas tem apenas ${mat.available_qty}`
        );
      }
    }

    return {
      ok: alerts.length === 0,
      alerts,
    };
  }

  async function handleSave() {

    if (!form.name || !form.category) {
      toast.error(
        'Preencha nome e categoria'
      );
      return;
    }

    if (
      prodMaterials.some(
        pm => !pm.material_id
      )
    ) {
      toast.error(
        'Selecione os materiais'
      );
      return;
    }

    if (!editing) {
      const { ok, alerts } =
        checkStock();

      if (!ok) {
        setStockWarnings(alerts);

        toast.error(
          'Estoque insuficiente'
        );

        return;
      }
    }

    setLoading(true);

    await new Promise(r =>
      setTimeout(r, 400)
    );

    if (editing) {

      setProducts(prev =>
        prev.map(p =>
          p.id === editing.id
            ? {
                ...p,
                ...form,
                materials:
                  prodMaterials,
              }
            : p
        )
      );

      toast.success(
        'Produto atualizado!'
      );

    } else {

      const entries =
        prodMaterials.map(pm => ({
          material_id:
            pm.material_id,
          quantity:
            pm.quantity,
          reason:
            `Produto criado: ${form.name}`,
        }));

      decreaseStock(entries);

      const newProduct: Product = {
        id: Date.now().toString(),
        user_id: 'u1',
        ...form,
        materials: prodMaterials,
        created_at:
          new Date().toISOString(),
      };

      setProducts(prev => [
        newProduct,
        ...prev,
      ]);

      toast.success(
        'Produto criado!'
      );
    }

    setModalOpen(false);
    setLoading(false);
  }

  function handleDelete(id: string) {

    if (
      !confirm(
        'Excluir este produto?'
      )
    )
      return;

    setProducts(prev =>
      prev.filter(p => p.id !== id)
    );

    toast.success(
      'Produto removido.'
    );
  }

  return (
    <div>

      <PageHeader
        title="Produtos"
        subtitle="Gerencie seus produtos."
        action={
          <Button
            icon={Plus}
            onClick={openNew}
          >
            Novo produto
          </Button>
        }
      />

      <div className="relative mb-6 max-w-sm">

        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={search}
          onChange={e =>
            setSearch(e.target.value)
          }
          placeholder="Buscar produto..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold focus:border-pink-300 bg-white"
        />
      </div>

      {filtered.length === 0 ? (

        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState
            icon="🛍️"
            title="Nenhum produto cadastrado"
            description="Crie seu primeiro produto."
            action={
              <Button
                icon={Plus}
                onClick={openNew}
              >
                Criar produto
              </Button>
            }
          />
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {filtered.map(p => {

            const total =
              p.materials.reduce(
                (s, m) =>
                  s + m.total_cost,
                0
              );

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
              >

                <div className="flex items-start justify-between mb-3">

                  <div>
                    <h3 className="font-black text-gray-800">
                      {p.name}
                    </h3>

                    <Badge
                      variant="pink"
                      className="mt-1"
                    >
                      {p.category}
                    </Badge>
                  </div>

                  <div className="flex gap-1">

                    <button
                      onClick={() =>
                        openEdit(p)
                      }
                      className="p-1.5 rounded-lg hover:bg-pink-50 text-pink-500"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(p.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>
                </div>

                <div className="pt-3 border-t border-pink-50 flex items-center justify-between">

                  <div>
                    <p className="text-xs text-gray-500 font-semibold">
                      Custo
                    </p>

                    <p
                      className="font-black text-lg"
                      style={{
                        color: '#FF6BAD',
                      }}
                    >
                      {formatCurrency(total)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-semibold">
                      Produção
                    </p>

                    <p className="font-bold text-gray-700 text-sm">
                      {
                        p.labor_time_minutes
                      }{' '}
                      min
                    </p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      <Modal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        title={
          editing
            ? 'Editar produto'
            : 'Novo produto'
        }
        size="xl"
      >

        <div className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Input
              label="Nome do produto"
              value={form.name}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  name:
                    e.target.value,
                }))
              }
            />

            <Select
              label="Categoria"
              value={form.category}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  category:
                    e.target.value,
                }))
              }
              options={[
                {
                  value: '',
                  label:
                    'Selecione',
                },

                ...MATERIAL_CATEGORIES.map(
                  c => ({
                    value: c,
                    label: c,
                  })
                ),
              ]}
            />

          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">

            <Button
              variant="ghost"
              onClick={() =>
                setModalOpen(false)
              }
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSave}
              loading={loading}
            >
              Salvar
            </Button>

          </div>
        </div>
      </Modal>
    </div>
  );
}