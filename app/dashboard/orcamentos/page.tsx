'use client';

import { useState, useEffect } from 'react';

import {
  Plus,
  FileDown,
  Copy,
  Trash2,
  Search,
  Pencil,
} from 'lucide-react';

import { toast } from 'sonner';

import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

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
  formatDate,
} from '@/lib/utils';

import { createClient } from '@/lib/supabase/client';

import type {
  Budget,
  BudgetItem,
} from '@/types';

const STATUS_MAP = {
  draft: {
    label: '📝 Rascunho',
    variant: 'gray' as const,
  },

  sent: {
    label: '📤 Enviado',
    variant: 'blue' as const,
  },

  approved: {
    label: '✅ Aprovado',
    variant: 'green' as const,
  },

  rejected: {
    label: '❌ Recusado',
    variant: 'red' as const,
  },
};

export default function OrcamentosPage() {

  const supabase =
    createClient();

  const [budgets, setBudgets] =
    useState<Budget[]>([]);

  const [clients, setClients] =
    useState<any[]>([]);

  const [products, setProducts] =
    useState<any[]>([]);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState('');

  const [modalOpen, setModalOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      client_name: '',
      notes: '',
      valid_until: '',
    });

  const [items, setItems] =
    useState<BudgetItem[]>([
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const {
      data: budgetsData,
    } = await supabase
      .from('budgets')
      .select('*')
      .order(
        'created_at',
        {
          ascending: false,
        }
      );

    const {
      data: clientsData,
    } = await supabase
      .from('clients')
      .select('*');

    const {
      data: productsData,
    } = await supabase
      .from('products')
      .select('*');

    setBudgets(
      budgetsData || []
    );

    setClients(
      clientsData || []
    );

    setProducts(
      productsData || []
    );
  }

  const filtered = budgets.filter(
    b =>
      b.client_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  const total = items.reduce(
    (s, i) => s + i.total,
    0
  );

  function updateItem(
    idx: number,
    field: string,
    value: string | number
  ) {

    setItems(prev =>
      prev.map((item, i) => {

        if (i !== idx)
          return item;

        const updated = {
          ...item,
          [field]: value,
        };

        updated.total =
          Number(
            updated.quantity
          ) *
          Number(
            updated.unit_price
          );

        return updated;
      })
    );
  }

  function handleProductSelect(
    idx: number,
    productName: string
  ) {

    const product =
      products.find(
        p =>
          p.name ===
          productName
      );

    if (!product)
      return;

    setItems(prev =>
      prev.map((item, i) => {

        if (i !== idx)
          return item;

        return {
          ...item,
          description:
            product.name,
          unit_price:
            Number(
              product.sale_price
            ),
          total:
            Number(
              product.sale_price
            ) *
            Number(
              item.quantity
            ),
        };
      })
    );
  }

  async function handleSave() {

    if (!form.client_name) {

      toast.error(
        'Informe o cliente'
      );

      return;
    }

    setLoading(true);

    if (editingId) {

      await supabase
        .from('budgets')
        .update({

          client_name:
            form.client_name,

          notes:
            form.notes,

          valid_until:
            form.valid_until,

          items,

          total,

        })
        .eq(
          'id',
          editingId
        );

      toast.success(
        'Orçamento atualizado!'
      );

    } else {

      await supabase
        .from('budgets')
        .insert({

          client_name:
            form.client_name,

          notes:
            form.notes,

          valid_until:
            form.valid_until,

          items,

          total,

          status: 'draft',
        });

      toast.success(
        'Orçamento criado!'
      );
    }

    setEditingId(null);

    setForm({
      client_name: '',
      notes: '',
      valid_until: '',
    });

    setItems([
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);

    setModalOpen(false);

    await loadData();

    setLoading(false);
  }

  function handleEdit(
    budget: Budget
  ) {

    setEditingId(
      budget.id
    );

    setForm({
      client_name:
        budget.client_name,

      notes:
        budget.notes || '',

      valid_until:
        budget.valid_until || '',
    });

    setItems(
      budget.items
    );

    setModalOpen(true);
  }

  async function handleDelete(
    id: string
  ) {

    if (
      !confirm(
        'Excluir orçamento?'
      )
    )
      return;

    await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    toast.success(
      'Removido.'
    );

    loadData();
  }

  function generatePDF(
    budget: Budget
  ) {

    const doc =
      new jsPDF();

    doc.setFontSize(20);

    doc.text(
      'ORÇAMENTO',
      14,
      20
    );

    doc.setFontSize(11);

    doc.text(
      `Cliente: ${budget.client_name}`,
      14,
      35
    );

    doc.text(
      `Data: ${formatDate(
        budget.created_at
      )}`,
      14,
      42
    );

    autoTable(doc, {
      startY: 55,

      head: [[
        'Produto',
        'Qtd',
        'Valor',
        'Total',
      ]],

      body:
        budget.items.map(
          item => [
            item.description,
            item.quantity,
            formatCurrency(
              item.unit_price
            ),
            formatCurrency(
              item.total
            ),
          ]
        ),
    });

    doc.text(
      `TOTAL: ${formatCurrency(
        budget.total
      )}`,
      14,
      doc
        .lastAutoTable
        .finalY + 15
    );

    if (budget.notes) {

      doc.text(
        `Obs: ${budget.notes}`,
        14,
        doc
          .lastAutoTable
          .finalY + 28
      );
    }

    doc.save(
      `orcamento-${budget.client_name}.pdf`
    );
  }

  return (

    <div>

      <PageHeader
        title="Orçamentos"
        subtitle="Crie e gerencie orçamentos."

        action={
          <Button
            icon={Plus}
            onClick={() =>
              setModalOpen(true)
            }
          >
            Novo orçamento
          </Button>
        }
      />

      {/* BUSCA */}
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

          placeholder="Buscar cliente..."

          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold focus:border-pink-300 bg-white"
        />

      </div>

      {/* LISTA */}
      {filtered.length === 0 ? (

        <div className="bg-white rounded-2xl border border-gray-100">

          <EmptyState
            icon="📋"
            title="Nenhum orçamento"
            description="Crie seu primeiro orçamento."

            action={
              <Button
                icon={Plus}
                onClick={() =>
                  setModalOpen(true)
                }
              >
                Criar orçamento
              </Button>
            }
          />

        </div>

      ) : (

        <div className="space-y-4">

          {filtered.map(b => {

            const sc =
              STATUS_MAP[
                b.status
              ];

            return (

              <div
                key={b.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >

                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">

                  <div>

                    <h3 className="font-black text-gray-800 text-lg">
                      {b.client_name}
                    </h3>

                    <p className="text-xs text-gray-500 font-semibold">
                      {formatDate(
                        b.created_at
                      )}
                    </p>

                  </div>

                  <div className="flex items-center gap-2">

                    <Badge
                      variant={
                        sc.variant
                      }
                    >
                      {sc.label}
                    </Badge>

                    <p className="text-2xl font-black text-pink-500">
                      {formatCurrency(
                        b.total
                      )}
                    </p>

                  </div>

                </div>

                <div className="flex flex-wrap gap-2">

                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Pencil}
                    onClick={() =>
                      handleEdit(b)
                    }
                  >
                    Editar
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    icon={FileDown}
                    onClick={() =>
                      generatePDF(b)
                    }
                  >
                    PDF
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    icon={Trash2}
                    onClick={() =>
                      handleDelete(
                        b.id
                      )
                    }
                  >
                    Excluir
                  </Button>

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
          editingId
            ? 'Editar orçamento'
            : 'Novo orçamento'
        }

        size="xl"
      >

        <div className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Select
              label="Cliente"

              value={
                form.client_name
              }

              onChange={e =>
                setForm(f => ({
                  ...f,
                  client_name:
                    e.target.value,
                }))
              }

              options={[
                ...clients.map(
                  c => ({
                    value:
                      c.name,
                    label:
                      c.name,
                  })
                ),

                {
                  value:
                    'CLIENTE_PERSONALIZADO',

                  label:
                    '+ Novo cliente',
                },
              ]}
            />

            <Input
              label="Válido até"

              type="date"

              value={
                form.valid_until
              }

              onChange={e =>
                setForm(f => ({
                  ...f,
                  valid_until:
                    e.target.value,
                }))
              }
            />

          </div>

          {form.client_name ===
            'CLIENTE_PERSONALIZADO' && (

            <Input
              label="Novo cliente"

              onChange={e =>
                setForm(f => ({
                  ...f,
                  client_name:
                    e.target.value,
                }))
              }
            />

          )}

          {/* ITENS */}
          <div className="space-y-3">

            {items.map(
              (item, i) => (

                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-xl"
                >

                  <div className="col-span-5">

                    <Select
                      label="Produto"

                      value={
                        item.description
                      }

                      onChange={e => {

                        if (
                          e.target
                            .value ===
                          'PERSONALIZADO'
                        ) {

                          updateItem(
                            i,
                            'description',
                            ''
                          );

                          return;
                        }

                        handleProductSelect(
                          i,
                          e.target.value
                        );
                      }}

                      options={[
                        ...products.map(
                          p => ({
                            value:
                              p.name,
                            label:
                              `${p.name} - ${formatCurrency(
                                p.sale_price
                              )}`,
                          })
                        ),

                        {
                          value:
                            'PERSONALIZADO',

                          label:
                            '+ Produto personalizado',
                        },
                      ]}
                    />

                  </div>

                  <div className="col-span-2">

                    <Input
                      label="Qtd"

                      type="number"

                      value={
                        item.quantity
                      }

                      onChange={e =>
                        updateItem(
                          i,
                          'quantity',
                          e.target
                            .value
                        )
                      }
                    />

                  </div>

                  <div className="col-span-2">

                    <Input
                      label="Preço"

                      type="number"

                      value={
                        item.unit_price
                      }

                      onChange={e =>
                        updateItem(
                          i,
                          'unit_price',
                          e.target
                            .value
                        )
                      }
                    />

                  </div>

                  <div className="col-span-2">

                    <Input
                      label="Total"

                      value={formatCurrency(
                        item.total
                      )}

                      readOnly
                    />

                  </div>

                  <div className="col-span-1 flex justify-end">

                    <button
                      onClick={() =>
                        setItems(
                          p =>
                            p.filter(
                              (
                                _,
                                idx
                              ) =>
                                idx !==
                                i
                            )
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

            <Button
              variant="secondary"
              icon={Plus}
              onClick={() =>
                setItems(p => [
                  ...p,

                  {
                    description:
                      '',

                    quantity: 1,

                    unit_price: 0,

                    total: 0,
                  },
                ])
              }
            >
              Adicionar item
            </Button>

            <div className="flex justify-end">

              <div
                className="rounded-xl px-4 py-2 bg-pink-50"
              >

                <span className="font-black text-pink-500">
                  Total:{' '}
                  {formatCurrency(
                    total
                  )}
                </span>

              </div>

            </div>

          </div>

          <Textarea
            label="Observações"

            value={form.notes}

            onChange={e =>
              setForm(f => ({
                ...f,
                notes:
                  e.target.value,
              }))
            }
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
            {editingId
              ? 'Salvar alterações'
              : 'Criar orçamento'}
          </Button>

        </div>

      </Modal>

    </div>

  );
}