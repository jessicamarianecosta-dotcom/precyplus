'use client';

import { useState, useEffect } from 'react';

import {
  Plus,
  FileDown,
  Copy,
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
  Textarea,
  EmptyState,
  Badge,
} from '@/components/ui';

import {
  formatCurrency,
  formatDate,
} from '@/lib/utils';

import type {
  Budget,
  BudgetItem,
} from '@/types';

// STORAGE
const BUDGETS_KEY =
  'precy_budgets';

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

const DEMO: Budget[] = [
  {
    id: '1',

    user_id: 'u1',

    client_name:
      'Ana Paula Silva',

    total: 165,

    status: 'sent',

    valid_until:
      '2025-07-30',

    notes:
      'Kit presente personalizado',

    items: [
      {
        description:
          'Caderno A5',
        quantity: 3,
        unit_price: 33,
        total: 99,
      },
    ],

    created_at:
      new Date().toISOString(),
  },
];

export default function OrcamentosPage() {

  // LOAD STORAGE
  const [budgets, setBudgets] =
    useState<Budget[]>(() => {

      if (typeof window === 'undefined')
        return DEMO;

      const saved =
        localStorage.getItem(
          BUDGETS_KEY
        );

      return saved
        ? JSON.parse(saved)
        : DEMO;
    });

  // SAVE STORAGE
  useEffect(() => {
    localStorage.setItem(
      BUDGETS_KEY,
      JSON.stringify(budgets)
    );
  }, [budgets]);

  const [search, setSearch] =
    useState('');

  const [modalOpen, setModalOpen] =
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

  const [loading, setLoading] =
    useState(false);

  const filtered = budgets.filter(
    b =>
      b.client_name
        .toLowerCase()
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
            updated.unit_price
          ) *
          Number(
            updated.quantity
          );

        return updated;
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

    await new Promise(r =>
      setTimeout(r, 300)
    );

    setBudgets(prev => [
      {
        id: Date.now().toString(),

        user_id: 'u1',

        ...form,

        items,

        total,

        status: 'draft',

        created_at:
          new Date().toISOString(),
      },

      ...prev,
    ]);

    toast.success(
      'Orçamento criado!'
    );

    setModalOpen(false);

    setItems([
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);

    setForm({
      client_name: '',
      notes: '',
      valid_until: '',
    });

    setLoading(false);
  }

  function changeStatus(
    id: string,
    status: Budget['status']
  ) {

    setBudgets(prev =>
      prev.map(b =>
        b.id === id
          ? {
              ...b,
              status,
            }
          : b
      )
    );

    toast.success(
      'Status atualizado!'
    );
  }

  function handleDuplicate(
    b: Budget
  ) {

    setBudgets(prev => [
      {
        ...b,

        id: Date.now().toString(),

        status: 'draft',

        client_name:
          b.client_name +
          ' (cópia)',

        created_at:
          new Date().toISOString(),
      },

      ...prev,
    ]);

    toast.success(
      'Duplicado!'
    );
  }

  function handleDelete(
    id: string
  ) {

    if (
      !confirm(
        'Excluir orçamento?'
      )
    )
      return;

    setBudgets(prev =>
      prev.filter(
        x => x.id !== id
      )
    );

    toast.success(
      'Removido.'
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
              STATUS_MAP[b.status];

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

                    {b.notes && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        {b.notes}
                      </p>
                    )}

                  </div>

                  <div className="flex items-center gap-2">

                    <Badge
                      variant={
                        sc.variant
                      }
                    >
                      {sc.label}
                    </Badge>

                    <p
                      className="text-2xl font-black"
                      style={{
                        color:
                          '#FF6BAD',
                      }}
                    >
                      {formatCurrency(
                        b.total
                      )}
                    </p>

                  </div>
                </div>

                {/* ITENS */}
                <div className="rounded-xl border border-gray-100 overflow-hidden mb-4">

                  {b.items.map(
                    (item, i) => (

                      <div
                        key={i}
                        className="flex items-center justify-between px-4 py-2.5 odd:bg-gray-50 text-sm"
                      >

                        <span className="font-semibold text-gray-700">
                          {
                            item.description
                          }
                        </span>

                        <span className="font-black text-gray-800">
                          {formatCurrency(
                            item.total
                          )}
                        </span>

                      </div>
                    )
                  )}
                </div>

                {/* AÇÕES */}
                <div className="flex flex-wrap gap-2">

                  <Select
                    value={b.status}

                    onChange={e =>
                      changeStatus(
                        b.id,
                        e.target
                          .value as Budget['status']
                      )
                    }

                    options={Object.entries(
                      STATUS_MAP
                    ).map(
                      ([
                        v,
                        { label },
                      ]) => ({
                        value: v,
                        label,
                      })
                    )}

                    className="text-xs py-2 rounded-lg"
                  />

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Copy}
                    onClick={() =>
                      handleDuplicate(
                        b
                      )
                    }
                  >
                    Duplicar
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={FileDown}
                  >
                    PDF
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
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

        title="Novo orçamento"

        size="xl"
      >

        <div className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Input
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

          {/* ITENS */}
          <div className="space-y-3">

            {items.map(
              (item, i) => (

                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-xl"
                >

                  <div className="col-span-5">

                    <Input
                      label="Descrição"

                      value={
                        item.description
                      }

                      onChange={e =>
                        updateItem(
                          i,
                          'description',
                          e.target
                            .value
                        )
                      }
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
                        item.unit_price ||
                        ''
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
                className="rounded-xl px-4 py-2"
                style={{
                  background:
                    '#FFF0F6',
                }}
              >
                <span
                  className="font-black"
                  style={{
                    color:
                      '#FF6BAD',
                  }}
                >
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
            Criar orçamento
          </Button>

        </div>
      </Modal>
    </div>
  );
}