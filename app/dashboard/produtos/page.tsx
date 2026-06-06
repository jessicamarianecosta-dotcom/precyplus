'use client';

import { useState, useEffect } from 'react';

import {
  Plus,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';

import { toast } from 'sonner';

import {
  PageHeader,
  Button,
  Modal,
  Input,
  Select,
  EmptyState,
  Badge,
} from '@/components/ui';

import {
  formatCurrency,
  MATERIAL_CATEGORIES,
} from '@/lib/utils';

import { useMaterials } from '@/lib/materials-store';

import { createClient } from '@/lib/supabase/client';

import type {
  Product,
  ProductMaterial,
} from '@/types';

export default function ProdutosPage() {

  const supabase =
    createClient();

  const {
    materials,
    decreaseStock,
  } = useMaterials();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState('');

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      name: '',
      category: '',
      description: '',
      labor_time_minutes: 30,
      sale_price: 0,
    });

  const [prodMaterials, setProdMaterials] =
    useState<ProductMaterial[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {

    const {
      data,
    } = await supabase
      .from('products')
      .select('*')
      .order(
        'created_at',
        {
          ascending: false,
        }
      );

    setProducts(
      data || []
    );
  }

  const filtered =
    products.filter(p =>
      p.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  function openNew() {

    setEditing(null);

    setForm({
      name: '',
      category: '',
      description: '',
      labor_time_minutes: 30,
      sale_price: 0,
    });

    setProdMaterials([]);

    setModalOpen(true);
  }

  function openEdit(
    p: Product
  ) {

    setEditing(p);

    setForm({
      name: p.name,
      category: p.category,
      description:
        p.description || '',
      labor_time_minutes:
        p.labor_time_minutes,
      sale_price:
        (p as any).sale_price || 0,
    });

    setProdMaterials(
      (p as any).materials || []
    );

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

  function removeMaterialLine(
    i: number
  ) {

    setProdMaterials(prev =>
      prev.filter(
        (_, idx) =>
          idx !== i
      )
    );
  }

  function selectMaterial(
    i: number,
    materialId: string
  ) {

    const found =
      materials.find(
        m =>
          m.id === materialId
      );

    if (!found)
      return;

    setProdMaterials(prev =>
      prev.map((pm, idx) => {

        if (idx !== i)
          return pm;

        return {

          ...pm,

          material_id:
            found.id,

          material_name:
            found.name,

          unit:
            found.unit,

          unit_cost:
            found.unit_cost,

          total_cost:
            found.unit_cost *
            pm.quantity,
        };
      })
    );
  }

  function setQuantity(
    i: number,
    qty: string
  ) {

    const q =
      parseFloat(qty) || 0;

    setProdMaterials(prev =>
      prev.map((pm, idx) => {

        if (idx !== i)
          return pm;

        return {

          ...pm,

          quantity: q,

          total_cost:
            pm.unit_cost * q,
        };
      })
    );
  }

  const productionCost =
    prodMaterials.reduce(
      (s, m) =>
        s + m.total_cost,
      0
    );

  async function handleSave() {

    if (
      !form.name ||
      !form.category
    ) {

      toast.error(
        'Preencha nome e categoria'
      );

      return;
    }

    setLoading(true);

    const {
      data: auth,
    } =
      await supabase.auth.getUser();

    if (editing) {

      await supabase
        .from('products')
        .update({

          name:
            form.name,

          category:
            form.category,

          description:
            form.description,

          labor_time_minutes:
            form.labor_time_minutes,

          sale_price:
            form.sale_price,

          production_cost:
            productionCost,

          materials:
            prodMaterials,
        })
        .eq(
          'id',
          editing.id
        );

      toast.success(
        'Produto atualizado!'
      );

    } else {

      await supabase
        .from('products')
        .insert({

          user_id:
            auth.user?.id,

          name:
            form.name,

          category:
            form.category,

          description:
            form.description,

          labor_time_minutes:
            form.labor_time_minutes,

          sale_price:
            form.sale_price,

          production_cost:
            productionCost,

          materials:
            prodMaterials,
        });

      const entries =
        prodMaterials.map(pm => ({

          material_id:
            pm.material_id,

          quantity:
            pm.quantity,

          reason:
            `Produto criado: ${form.name}`,
        }));

      await decreaseStock(
        entries
      );

      toast.success(
        'Produto criado!'
      );
    }

    await loadProducts();

    setModalOpen(false);

    setLoading(false);
  }

  async function handleDelete(
    id: string
  ) {

    if (
      !confirm(
        'Excluir produto?'
      )
    )
      return;

    await supabase
      .from('products')
      .delete()
      .eq('id', id);

    toast.success(
      'Produto removido.'
    );

    loadProducts();
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
            setSearch(
              e.target.value
            )
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

          {filtered.map(p => (

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
                      handleDelete(
                        p.id
                      )
                    }
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>

                </div>

              </div>

              <div className="space-y-2 text-sm">

                <div className="flex justify-between">

                  <span className="text-gray-500 font-semibold">
                    Venda
                  </span>

                  <span className="font-black text-pink-500">
                    {formatCurrency(
                      (p as any).sale_price || 0
                    )}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-500 font-semibold">
                    Produção
                  </span>

                  <span className="font-bold text-gray-700">
                    {p.labor_time_minutes} min
                  </span>

                </div>

              </div>

            </div>
          ))}

        </div>

      )}

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
                  label: 'Selecione',
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

          <div>

            <label className="block text-sm font-bold text-gray-700 mb-2">
              Descrição
            </label>

            <textarea
              value={form.description}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  description:
                    e.target.value,
                }))
              }
              rows={4}
              className="
                w-full
                rounded-2xl
                border-2
                border-gray-100
                px-4
                py-3
                outline-none
                focus:border-pink-300
                resize-none
              "
            />

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Input
              type="number"
              label="Tempo de produção (min)"
              value={
                form.labor_time_minutes
              }
              onChange={e =>
                setForm(f => ({
                  ...f,
                  labor_time_minutes:
                    Number(
                      e.target.value
                    ),
                }))
              }
            />

            <Input
              type="number"
              label="Preço de venda"
              value={form.sale_price}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  sale_price:
                    Number(
                      e.target.value
                    ),
                }))
              }
            />

          </div>

          <div className="border-t pt-5">

            <div className="flex items-center justify-between mb-4">

              <h3 className="font-black text-gray-800">
                Materiais
              </h3>

              <Button
                size="sm"
                variant="secondary"
                icon={Plus}
                onClick={
                  addMaterialLine
                }
              >
                Adicionar
              </Button>

            </div>

            <div className="space-y-3">

              {prodMaterials.map(
                (pm, i) => (

                  <div
                    key={i}
                    className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-xl"
                  >

                    <div className="col-span-5">

                      <Select
                        label="Material"
                        value={
                          pm.material_id
                        }
                        onChange={e =>
                          selectMaterial(
                            i,
                            e.target.value
                          )
                        }
                        options={[
                          {
                            value: '',
                            label:
                              'Selecione',
                          },

                          ...materials.map(
                            m => ({
                              value:
                                m.id,

                              label:
                                `${m.name} (${m.available_qty} ${m.unit})`,
                            })
                          ),
                        ]}
                      />

                    </div>

                    <div className="col-span-3">

                      <Input
                        type="number"
                        label="Quantidade"
                        value={
                          pm.quantity
                        }
                        onChange={e =>
                          setQuantity(
                            i,
                            e.target.value
                          )
                        }
                      />

                    </div>

                    <div className="col-span-3">

                      <Input
                        label="Custo"
                        value={formatCurrency(
                          pm.total_cost
                        )}
                        readOnly
                      />

                    </div>

                    <div className="col-span-1 flex justify-end">

                      <button
                        onClick={() =>
                          removeMaterialLine(
                            i
                          )
                        }
                        className="text-red-400"
                      >
                        ×
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

          <div className="rounded-xl bg-pink-50 p-4">

            <div className="flex justify-between">

              <span className="font-bold text-gray-700">
                Custo total
              </span>

              <span className="font-black text-pink-500">
                {formatCurrency(
                  productionCost
                )}
              </span>

            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">

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