'use client';

import { useEffect, useState } from 'react';

import {
  Package,
  Calculator,
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  totalMaterials: number;
  lowStock: number;
  criticalStock: number;
  totalProducts: number;
  totalClients: number;
  totalQuotes: number;
  approvedQuotes: number;
  totalRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
}

export default function DashboardPage() {

  const supabase = createClient();

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState<DashboardStats>({
      totalMaterials: 0,
      lowStock: 0,
      criticalStock: 0,
      totalProducts: 0,
      totalClients: 0,
      totalQuotes: 0,
      approvedQuotes: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      estimatedProfit: 0,
    });

  const [userName, setUserName] =
    useState('Usuário');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {

    try {

      setLoading(true);

      const {
        data: authData,
      } = await supabase.auth.getUser();

      const userId =
        authData.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      setUserName(
        authData.user?.user_metadata?.name ||
        authData.user?.email?.split('@')[0] ||
        'Usuário'
      );

      // ======================
      // MATERIAIS
      // ======================

      const {
        data: materials,
      } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', userId);

      const lowStock =
        materials?.filter(
          m =>
            m.available_qty <=
            m.min_stock
        ).length || 0;

      const criticalStock =
        materials?.filter(
          m =>
            m.available_qty <= 0
        ).length || 0;

      // ======================
      // PRECIFICAÇÕES
      // ======================

      const {
        data: pricings,
      } = await supabase
        .from('pricings')
        .select('*')
        .eq('user_id', userId);

      // ======================
      // CLIENTES
      // ======================

      const {
        data: clients,
      } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);

      // ======================
      // ORÇAMENTOS
      // ======================

      const {
        data: quotes,
      } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', userId);

      // ======================
      // FINANCEIRO
      // ======================

      const {
        data: financial,
      } = await supabase
        .from('financial')
        .select('*')
        .eq('user_id', userId);

      const revenue =
        financial
          ?.filter(
            f => f.type === 'income'
          )
          .reduce(
            (acc, item) =>
              acc + Number(item.amount),
            0
          ) || 0;

      const expenses =
        financial
          ?.filter(
            f => f.type === 'expense'
          )
          .reduce(
            (acc, item) =>
              acc + Number(item.amount),
            0
          ) || 0;

      setStats({
        totalMaterials:
          materials?.length || 0,

        lowStock,

        criticalStock,

        totalProducts:
          pricings?.length || 0,

        totalClients:
          clients?.length || 0,

        totalQuotes:
          quotes?.length || 0,

        approvedQuotes:
          quotes?.filter(
            q =>
              q.status ===
              'approved'
          ).length || 0,

        totalRevenue:
          revenue,

        totalExpenses:
          expenses,

        estimatedProfit:
          revenue - expenses,
      });

    } catch (error) {

      console.error(
        'Erro dashboard:',
        error
      );

    } finally {

      setLoading(false);
    }
  }

  function getGreeting() {

    const hour =
      new Date().getHours();

    if (hour >= 5 && hour < 12)
      return 'Bom dia';

    if (hour >= 12 && hour < 18)
      return 'Boa tarde';

    return 'Boa noite';
  }

  const cards = [
    {
      title: 'Materiais',
      value: stats.totalMaterials,
      icon: Package,
      color: 'bg-pink-100',
    },
    {
      title: 'Produtos Precificados',
      value: stats.totalProducts,
      icon: Calculator,
      color: 'bg-blue-100',
    },
    {
      title: 'Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-purple-100',
    },
    {
      title: 'Orçamentos',
      value: stats.totalQuotes,
      icon: FileText,
      color: 'bg-yellow-100',
    },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-black text-[#1A1F5E]">
          {getGreeting()}, {userName} 👋
        </h1>

        <p className="text-gray-500 mt-1 font-medium">
          Aqui está o resumo do seu negócio.
        </p>
      </div>

      {/* CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {cards.map(card => {

          const Icon =
            card.icon;

          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500 font-semibold">
                    {card.title}
                  </p>

                  <h2 className="text-3xl font-black text-[#1A1F5E] mt-2">
                    {loading
                      ? '...'
                      : card.value}
                  </h2>
                </div>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.color}`}>
                  <Icon
                    size={26}
                    className="text-[#1A1F5E]"
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* FINANCEIRO */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="bg-white rounded-2xl border border-gray-100 p-5">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="text-green-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500 font-semibold">
                Faturamento
              </p>

              <h2 className="text-2xl font-black text-[#1A1F5E]">
                {formatCurrency(
                  stats.totalRevenue
                )}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingUp className="text-red-500" />
            </div>

            <div>
              <p className="text-sm text-gray-500 font-semibold">
                Despesas
              </p>

              <h2 className="text-2xl font-black text-[#1A1F5E]">
                {formatCurrency(
                  stats.totalExpenses
                )}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <DollarSign className="text-blue-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500 font-semibold">
                Lucro Estimado
              </p>

              <h2 className="text-2xl font-black text-[#1A1F5E]">
                {formatCurrency(
                  stats.estimatedProfit
                )}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* ALERTAS */}

      <div className="bg-white rounded-2xl border border-gray-100 p-5">

        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle
            className="text-yellow-500"
            size={22}
          />

          <h2 className="text-lg font-black text-[#1A1F5E]">
            Alertas do Sistema
          </h2>
        </div>

        <div className="space-y-3">

          <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-50">
            <span className="font-semibold text-sm">
              Estoque baixo
            </span>

            <span className="font-black text-yellow-700">
              {stats.lowStock}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-red-50">
            <span className="font-semibold text-sm">
              Estoque crítico
            </span>

            <span className="font-black text-red-600">
              {stats.criticalStock}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
            <span className="font-semibold text-sm">
              Orçamentos aprovados
            </span>

            <span className="font-black text-green-600">
              {stats.approvedQuotes}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}