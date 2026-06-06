'use client';

import { useState, useEffect } from 'react';

import {
  Calculator,
  FileDown,
  Copy,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { toast } from 'sonner';

import {
  PageHeader,
  Button,
  Input,
  Select,
  Badge,
  EmptyState,
  Modal,
} from '@/components/ui';

import {
  formatCurrency,
} from '@/lib/utils';

import type { Pricing } from '@/types';

// STORAGE
const PRICINGS_KEY =
  'precy_pricings';

const FIXED_COSTS_KEY =
  'precy_fixed_costs';

// DEMO
const DEMO_PRODUCTS = [
  {
    id: '1',
    name: 'Caderno A5 Wire-o',
    materials_cost: 9.1,
    labor_time_minutes: 30,
  },

  {
    id: 'custom',
    name: 'Produto personalizado',
    materials_cost: 0,
    labor_time_minutes: 0,
  },
];

const DEMO_PRICINGS: Pricing[] = [
  {
    id: '1',
    user_id: 'u1',
    product_id: '1',
    product_name:
      'Caderno A5 Wire-o',

    materials_cost: 9.1,
    labor_cost: 6,
    fixed_cost_share: 3.2,
    packaging_cost: 1.5,
    delivery_cost: 0,
    commission_pct: 5,
    extra_taxes: 0,
    profit_margin: 40,

    total_cost: 19.8,
    min_price: 24.75,
    recommended_price: 33,
    premium_price: 42,

    created_at:
      new Date().toISOString(),
  },
];

function MarginBadge({
  margin,
}: {
  margin: number;
}) {

  if (margin >= 30) {
    return (
      <Badge variant="green">
        🟢 Margem saudável
      </Badge>
    );
  }

  if (margin >= 15) {
    return (
      <Badge variant="yellow">
        🟡 Atenção
      </Badge>
    );
  }

  return (
    <Badge variant="red">
      🔴 Lucro baixo
    </Badge>
  );
}

const DEFAULT_FORM = {
  product_id: '',
  product_name: '',
  materials_cost: 0,
  labor_time_minutes: 0,
  hourly_rate: 15,
  packaging_cost: 0,
  delivery_cost: 0,
  commission_pct: 5,
  extra_taxes: 0,
  profit_margin: 40,
  fixed_cost_daily: 20,
};

export default function PrecificacaoPage() {

  // LOAD STORAGE
  const [pricings, setPricings] =
    useState<Pricing[]>(() => {

      if (typeof window === 'undefined')
        return DEMO_PRICINGS;

      const saved =
        localStorage.getItem(
          PRICINGS_KEY
        );

      return saved
        ? JSON.parse(saved)
        : DEMO_PRICINGS;
    });

  // SAVE STORAGE
  useEffect(() => {
    localStorage.setItem(
      PRICINGS_KEY,
      JSON.stringify(pricings)
    );
  }, [pricings]);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [form, setForm] =
    useState(() => {
      if (typeof window === 'undefined') {
        return DEFAULT_FORM;
      }

      try {
        const saved = localStorage.getItem(FIXED_COSTS_KEY);
        if (!saved) {
          return DEFAULT_FORM;
        }

        const fixedItems = JSON.parse(saved) as { value: string }[];
        const monthlyTotal = fixedItems.reduce(
          (sum, item) => sum + (Number(item.value) || 0),
          0
        );

        return {
          ...DEFAULT_FORM,
          fixed_cost_daily: monthlyTotal / 30,
        };
      } catch {
        return DEFAULT_FORM;
      }
    });

  const [result, setResult] =
    useState<Partial<Pricing> | null>(
      null
    );

  const [fixedCostMonthly, setFixedCostMonthly] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(FIXED_COSTS_KEY);
      if (!saved) return;

      const fixedItems = JSON.parse(saved) as { value: string }[];
      const monthlyTotal = fixedItems.reduce(
        (sum, item) => sum + (Number(item.value) || 0),
        0
      );

      setFixedCostMonthly(monthlyTotal);
    } catch {
      // ignore
    }
  }, []);

  const set = (
    k: string,
    v: string | number
  ) =>
    setForm(f => ({
      ...f,
      [k]: v,
    }));

  function selectProduct(
    productId: string
  ) {

    const p = DEMO_PRODUCTS.find(
      p => p.id === productId
    );

    if (p) {
      setForm(f => ({
        ...f,
        product_id: p.id,
        product_name: p.name,
        materials_cost:
          p.materials_cost,
        labor_time_minutes:
          p.labor_time_minutes,
      }));
    }

    setResult(null);
  }

  function calculate() {

    const {
      materials_cost,
      labor_time_minutes,
      hourly_rate,
      packaging_cost,
      delivery_cost,
      commission_pct,
      extra_taxes,
      profit_margin,
      fixed_cost_daily,
    } = form;

    const laborCost =
      (labor_time_minutes / 60) *
      hourly_rate;

    const fixedShare =
      (labor_time_minutes / 480) *
      fixed_cost_daily;

    const directCost =
      Number(materials_cost) +
      laborCost +
      fixedShare +
      Number(packaging_cost) +
      Number(delivery_cost);

    const taxMultiplier =
      1 +
      Number(commission_pct) /
        100 +
      Number(extra_taxes) / 100;

    const totalCost =
      directCost *
      taxMultiplier;

    const minPrice =
      totalCost;

    const recommendedPrice =
      totalCost /
      (1 -
        Number(profit_margin) /
          100);

    const premiumPrice =
      recommendedPrice * 1.3;

    setResult({
      materials_cost:
        Number(materials_cost),

      labor_cost: laborCost,

      fixed_cost_share:
        fixedShare,

      packaging_cost:
        Number(packaging_cost),

      delivery_cost:
        Number(delivery_cost),

      commission_pct:
        Number(commission_pct),

      profit_margin:
        Number(profit_margin),

      total_cost: totalCost,

      min_price: minPrice,

      recommended_price:
        recommendedPrice,

      premium_price:
        premiumPrice,
    });
  }

  async function handleSave() {

    if (
      !result ||
      !form.product_name
    ) {
      toast.error(
        'Calcule primeiro'
      );
      return;
    }

    setLoading(true);

    await new Promise(r =>
      setTimeout(r, 400)
    );

    const {
      id: _rid,
      user_id: _ruid,
      product_name: _rpn,
      product_id: _rpid,
      created_at: _rca,
      ...resultRest
    } = result as Pricing;

    const newP: Pricing = {
      id: Date.now().toString(),

      user_id: 'u1',

      product_id:
        form.product_id,

      product_name:
        form.product_name,

      ...resultRest,

      created_at:
        new Date().toISOString(),
    };

    setPricings(prev => [
      newP,
      ...prev,
    ]);

    toast.success(
      'Precificação salva!'
    );

    setModalOpen(false);

    setForm(DEFAULT_FORM);

    setResult(null);

    setLoading(false);
  }

  function handleDuplicate(
    p: Pricing
  ) {

    const dup = {
      ...p,

      id: Date.now().toString(),

      product_name:
        p.product_name +
        ' (cópia)',

      created_at:
        new Date().toISOString(),
    };

    setPricings(prev => [
      dup,
      ...prev,
    ]);

    toast.success(
      'Duplicada!'
    );
  }

  function handleDelete(
    id: string
  ) {

    if (
      !confirm(
        'Excluir esta precificação?'
      )
    )
      return;

    setPricings(prev =>
      prev.filter(
        p => p.id !== id
      )
    );

    toast.success(
      'Removida.'
    );
  }

  const filtered =
    pricings.filter(p =>
      p.product_name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div>

      <PageHeader
        title="Precificação"
        subtitle="Calcule automaticamente o preço ideal."

        action={
          <Button
            icon={Calculator}
            onClick={() =>
              setModalOpen(true)
            }
          >
            Nova precificação
          </Button>
        }
      />

      {fixedCostMonthly > 0 && (
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-500">
            Custos fixos mensais: <strong>{formatCurrency(fixedCostMonthly)}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Custo fixo diário usado na precificação: <strong>{formatCurrency(fixedCostMonthly / 30)}</strong>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Esses valores vêm do módulo de custos fixos.
          </p>
        </div>
      )}

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
          placeholder="Buscar..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold focus:border-pink-300 bg-white"
        />
      </div>

      {/* LISTA */}
      {filtered.length === 0 ? (

        <div className="bg-white rounded-2xl border border-gray-100">

          <EmptyState
            icon="🧮"
            title="Nenhuma precificação"
            description="Crie sua primeira precificação."
            action={
              <Button
                icon={Calculator}
                onClick={() =>
                  setModalOpen(true)
                }
              >
                Calcular agora
              </Button>
            }
          />

        </div>

      ) : (

        <div className="space-y-4">

          {filtered.map(p => (

            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >

              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-pink-50/30 transition-colors"
                onClick={() =>
                  setExpandedId(
                    expandedId === p.id
                      ? null
                      : p.id
                  )
                }
              >

                <div className="flex items-center gap-4">

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        '#FFF0F6',
                    }}
                  >
                    <Calculator
                      size={18}
                      style={{
                        color:
                          '#FF6BAD',
                      }}
                    />
                  </div>

                  <div>

                    <h3 className="font-black text-gray-800">
                      {p.product_name}
                    </h3>

                    <p className="text-xs text-gray-500 font-semibold">
                      {new Date(
                        p.created_at
                      ).toLocaleDateString(
                        'pt-BR'
                      )}
                    </p>

                  </div>
                </div>

                <div className="flex items-center gap-4">

                  <div className="hidden sm:block text-right">

                    <p className="text-xs text-gray-500 font-semibold">
                      Recomendado
                    </p>

                    <p
                      className="font-black text-lg"
                      style={{
                        color:
                          '#FF6BAD',
                      }}
                    >
                      {formatCurrency(
                        p.recommended_price
                      )}
                    </p>

                  </div>

                  <MarginBadge
                    margin={
                      p.profit_margin
                    }
                  />

                  {expandedId === p.id ? (
                    <ChevronUp
                      size={16}
                      className="text-gray-400"
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      className="text-gray-400"
                    />
                  )}

                </div>
              </div>

              {expandedId === p.id && (

                <div className="border-t border-pink-50 p-5">

                  <div className="flex gap-2 justify-end">

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Copy}
                      onClick={() =>
                        handleDuplicate(
                          p
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
                      Exportar PDF
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() =>
                        handleDelete(
                          p.id
                        )
                      }
                    >
                      Excluir
                    </Button>

                  </div>
                </div>

              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setResult(null);
          setForm(DEFAULT_FORM);
        }}
        title="Nova precificação"
        size="xl"
      >

        <div className="space-y-4">

          <Select
            label="Produto"

            value={form.product_id}

            onChange={e =>
              selectProduct(
                e.target.value
              )
            }

            options={[
              {
                value: '',
                label:
                  'Selecionar...',
              },

              ...DEMO_PRODUCTS.map(
                p => ({
                  value: p.id,
                  label: p.name,
                })
              ),
            ]}
          />

          <Button
            onClick={calculate}
            icon={Calculator}
            className="w-full"
          >
            Calcular agora
          </Button>

          {result && (

            <Button
              onClick={handleSave}
              loading={loading}
              className="w-full"
            >
              Salvar precificação
            </Button>

          )}

        </div>
      </Modal>
    </div>
  );
}