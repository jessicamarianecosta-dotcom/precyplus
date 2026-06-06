'use client';

import {
  useState,
  useEffect,
} from 'react';

import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
} from 'lucide-react';

import { toast } from 'sonner';

import {
  PageHeader,
  Button,
  Modal,
  Input,
  Select,
  EmptyState,
} from '@/components/ui';

import {
  formatCurrency,
  formatDate,
} from '@/lib/utils';

import type {
  FinancialEntry,
} from '@/types';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// STORAGE
const FINANCE_KEY =
  'precy_finance';

const INCOME_CATS = [
  'Venda de produto',
  'Serviço',
  'Orçamento aprovado',
  'Outros',
];

const EXPENSE_CATS = [
  'Materiais',
  'Marketing',
  'Plataformas',
  'Funcionário',
  'Energia',
  'Aluguel',
  'Outros',
];

// DEMO PRIMEIRA VEZ
const DEMO_ENTRIES: FinancialEntry[] = [
  {
    id: '1',
    user_id: 'u1',
    type: 'income',
    value: 85,
    description:
      'Venda Cadernos',
    category:
      'Venda de produto',
    status: 'paid',
    paid_at:
      new Date().toISOString(),
    created_at:
      new Date().toISOString(),
  },
];

const FLOW_DATA = [
  {
    mes: 'Jan',
    entradas: 320,
    saidas: 180,
  },

  {
    mes: 'Fev',
    entradas: 450,
    saidas: 210,
  },

  {
    mes: 'Mar',
    entradas: 280,
    saidas: 150,
  },

  {
    mes: 'Abr',
    entradas: 620,
    saidas: 280,
  },

  {
    mes: 'Mai',
    entradas: 540,
    saidas: 230,
  },

  {
    mes: 'Jun',
    entradas: 780,
    saidas: 310,
  },
];

const EMPTY_FORM = {
  type:
    'income' as
      | 'income'
      | 'expense',

  value: '',

  description: '',

  category: '',

  client_name: '',

  due_date: '',

  status:
    'pending' as
      | 'pending'
      | 'paid',
};

export default function FinanceiroPage() {

  // LOAD STORAGE
  const [entries, setEntries] =
    useState<
      FinancialEntry[]
    >(() => {

      if (
        typeof window ===
        'undefined'
      ) {
        return DEMO_ENTRIES;
      }

      const saved =
        localStorage.getItem(
          FINANCE_KEY
        );

      return saved
        ? JSON.parse(saved)
        : DEMO_ENTRIES;
    });

  // SAVE STORAGE
  useEffect(() => {
    localStorage.setItem(
      FINANCE_KEY,
      JSON.stringify(entries)
    );
  }, [entries]);

  const [tab, setTab] =
    useState<
      | 'all'
      | 'income'
      | 'expense'
    >('all');

  const [modalOpen, setModalOpen] =
    useState(false);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [loading, setLoading] =
    useState(false);

  const set = (
    k: string,
    v: string
  ) =>
    setForm(f => ({
      ...f,
      [k]: v,
    }));

  const totalIncome =
    entries
      .filter(
        e =>
          e.type ===
            'income' &&
          e.status ===
            'paid'
      )
      .reduce(
        (s, e) =>
          s + e.value,
        0
      );

  const totalExpense =
    entries
      .filter(
        e =>
          e.type ===
            'expense' &&
          e.status ===
            'paid'
      )
      .reduce(
        (s, e) =>
          s + e.value,
        0
      );

  const balance =
    totalIncome -
    totalExpense;

  const pending =
    entries
      .filter(
        e =>
          e.status ===
          'pending'
      )
      .reduce(
        (s, e) =>
          s + e.value,
        0
      );

  const filtered =
    entries.filter(
      e =>
        tab === 'all' ||
        e.type === tab
    );

  async function handleSave() {

    if (
      !form.value ||
      !form.description ||
      !form.category
    ) {
      toast.error(
        'Preencha os campos obrigatórios'
      );

      return;
    }

    setLoading(true);

    await new Promise(r =>
      setTimeout(r, 300)
    );

    const newE: FinancialEntry =
      {
        id: Date.now().toString(),

        user_id: 'u1',

        type: form.type,

        value: Number(
          form.value
        ),

        description:
          form.description,

        category:
          form.category,

        client_name:
          form.client_name,

        due_date:
          form.due_date,

        status: form.status,

        paid_at:
          form.status ===
          'paid'
            ? new Date().toISOString()
            : undefined,

        created_at:
          new Date().toISOString(),
      };

    setEntries(prev => [
      newE,
      ...prev,
    ]);

    toast.success(
      form.type ===
        'income'
        ? 'Entrada registrada! 💚'
        : 'Saída registrada!'
    );

    setModalOpen(false);

    setForm(EMPTY_FORM);

    setLoading(false);
  }

  function toggleStatus(
    id: string
  ) {

    setEntries(prev =>
      prev.map(e =>
        e.id === id
          ? {
              ...e,

              status:
                e.status ===
                'pending'
                  ? 'paid'
                  : 'pending',

              paid_at:
                e.status ===
                'pending'
                  ? new Date().toISOString()
                  : undefined,
            }
          : e
      )
    );
  }

  function handleDelete(
    id: string
  ) {

    if (
      !confirm(
        'Excluir lançamento?'
      )
    )
      return;

    setEntries(prev =>
      prev.filter(
        e => e.id !== id
      )
    );

    toast.success(
      'Lançamento removido.'
    );
  }

  return (
    <div>

      <PageHeader
        title="Financeiro"

        subtitle="Controle entradas e saídas."

        action={
          <div className="flex gap-2">

            <Button
              variant="secondary"
              size="sm"
              icon={
                TrendingDown
              }
              onClick={() => {
                setForm(f => ({
                  ...f,
                  type:
                    'expense',
                }));

                setModalOpen(
                  true
                );
              }}
            >
              Saída
            </Button>

            <Button
              icon={Plus}
              onClick={() => {
                setForm(f => ({
                  ...f,
                  type:
                    'income',
                }));

                setModalOpen(
                  true
                );
              }}
            >
              Entrada
            </Button>

          </div>
        }
      />

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {[
          {
            label:
              'Entradas',

            value:
              formatCurrency(
                totalIncome
              ),

            icon:
              ArrowUpRight,

            color: 'green',
          },

          {
            label:
              'Saídas',

            value:
              formatCurrency(
                totalExpense
              ),

            icon:
              ArrowDownRight,

            color: 'red',
          },

          {
            label: 'Saldo',

            value:
              formatCurrency(
                balance
              ),

            icon:
              DollarSign,

            color:
              balance >= 0
                ? 'green'
                : 'red',
          },

          {
            label:
              'Pendentes',

            value:
              formatCurrency(
                pending
              ),

            icon:
              TrendingUp,

            color:
              'yellow',
          },
        ].map(
          ({
            label,
            value,
            icon: Icon,
            color,
          }) => (

            <div
              key={label}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >

              <div className="flex items-start justify-between mb-3">

                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      color ===
                      'green'
                        ? '#F0FDF4'
                        : color ===
                            'red'
                          ? '#FFF5F5'
                          : '#FFFBE8',
                  }}
                >

                  <Icon
                    size={16}
                    style={{
                      color:
                        color ===
                        'green'
                          ? '#22c55e'
                          : color ===
                              'red'
                            ? '#ef4444'
                            : '#f59e0b',
                    }}
                  />
                </div>
              </div>

              <p
                className="text-xl font-black"
                style={{
                  color:
                    '#1A1F5E',
                }}
              >
                {value}
              </p>

              <p className="text-xs text-gray-500 font-semibold">
                {label}
              </p>

            </div>
          )
        )}
      </div>

      {/* CHART */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">

        <h2 className="font-black text-gray-800 mb-5">
          Fluxo de caixa
        </h2>

        <ResponsiveContainer
          width="100%"
          height={220}
        >

          <BarChart
            data={FLOW_DATA}
            barGap={4}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f5f5f5"
            />

            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              formatter={(
                v: number
              ) =>
                formatCurrency(
                  v
                )
              }
            />

            <Bar
              dataKey="entradas"
              fill="#86efac"
              radius={[
                6,
                6,
                0,
                0,
              ]}
            />

            <Bar
              dataKey="saidas"
              fill="#fca5a5"
              radius={[
                6,
                6,
                0,
                0,
              ]}
            />

          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LISTA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="flex border-b border-gray-100 px-4 pt-4 gap-1">

          {[
            [
              'all',
              'Todos',
            ],

            [
              'income',
              'Entradas',
            ],

            [
              'expense',
              'Saídas',
            ],
          ].map(
            ([v, l]) => (

              <button
                key={v}
                onClick={() =>
                  setTab(
                    v as any
                  )
                }
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
                  tab === v
                    ? 'text-pink-600 border-b-2 border-pink-500'
                    : 'text-gray-500'
                }`}
              >
                {l}
              </button>
            )
          )}
        </div>

        {filtered.length ===
        0 ? (

          <EmptyState
            icon="💰"
            title="Nenhum lançamento"
            description="Registre entradas e saídas."

            action={
              <Button
                icon={Plus}
                onClick={() =>
                  setModalOpen(
                    true
                  )
                }
              >
                Novo lançamento
              </Button>
            }
          />

        ) : (

          <div className="divide-y divide-gray-50">

            {filtered.map(e => (

              <div
                key={e.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >

                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      e.type ===
                      'income'
                        ? '#F0FDF4'
                        : '#FFF5F5',
                  }}
                >

                  {e.type ===
                  'income' ? (

                    <ArrowUpRight
                      size={16}
                      className="text-emerald-500"
                    />

                  ) : (

                    <ArrowDownRight
                      size={16}
                      className="text-red-400"
                    />

                  )}

                </div>

                <div className="flex-1 min-w-0">

                  <p className="font-bold text-gray-800 text-sm truncate">
                    {
                      e.description
                    }
                  </p>

                  <p className="text-xs text-gray-500 font-semibold">
                    {e.category}{' '}
                    ·{' '}
                    {formatDate(
                      e.created_at
                    )}
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <button
                    onClick={() =>
                      toggleStatus(
                        e.id
                      )
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-black ${
                      e.status ===
                      'paid'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {e.status ===
                    'paid'
                      ? '✓ Pago'
                      : '⏳ Pendente'}
                  </button>

                  <p
                    className={`font-black text-base ${
                      e.type ===
                      'income'
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    }`}
                  >
                    {e.type ===
                    'income'
                      ? '+'
                      : '-'}
                    {formatCurrency(
                      e.value
                    )}
                  </p>

                  <button
                    onClick={() =>
                      handleDelete(
                        e.id
                      )
                    }
                    className="text-red-400 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <Trash2
                      size={14}
                    />
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <Modal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        title="Novo lançamento"
        size="md"
      >

        <div className="space-y-4">

          <Input
            label="Valor"
            type="number"
            value={form.value}
            onChange={e =>
              set(
                'value',
                e.target.value
              )
            }
          />

          <Input
            label="Descrição"
            value={
              form.description
            }
            onChange={e =>
              set(
                'description',
                e.target.value
              )
            }
          />

          <Select
            label="Categoria"
            value={
              form.category
            }
            onChange={e =>
              set(
                'category',
                e.target.value
              )
            }
            options={[
              {
                value: '',
                label:
                  'Selecione',
              },

              ...(
                form.type ===
                'income'
                  ? INCOME_CATS
                  : EXPENSE_CATS
              ).map(c => ({
                value: c,
                label: c,
              })),
            ]}
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

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
      </Modal>
    </div>
  );
}