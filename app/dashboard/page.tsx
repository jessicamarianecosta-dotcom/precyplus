'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  Package,
  Calculator,
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

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

  const supabase = useMemo(
    () => createClient(),
    []
  );

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
  }, [supabase]);

  async function loadDashboard() {
    try {
      setLoading(true);

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        setLoading(false);
        return;
      }

      const user = authData.user;
      const userId = user.id;

      const [
        materialsResult,
        pricingsResult,
        clientsResult,
        budgetsResult,
        financialResult,
        profileResult,
      ] = await Promise.all([
        supabase
          .from('materials')
          .select('id, available_qty, min_stock')
          .eq('user_id', userId),
        supabase
          .from('pricings')
          .select('id')
          .eq('user_id', userId),
        supabase
          .from('clients')
          .select('id')
          .eq('user_id', userId),
        supabase
          .from('budgets')
          .select('id, status')
          .eq('user_id', userId),
        supabase
          .from('financial')
          .select('id, type, amount')
          .eq('user_id', userId),
        supabase
          .from('profiles')
          .select('display_name')
          .eq('id', userId)
          .maybeSingle(),
      ]);

      if (
        materialsResult.error ||
        pricingsResult.error ||
        clientsResult.error ||
        budgetsResult.error ||
        financialResult.error ||
        profileResult.error
      ) {
        throw new Error('Erro ao carregar dados do painel.');
      }

      const materials = materialsResult.data || [];
      const pricings = pricingsResult.data || [];
      const clients = clientsResult.data || [];
      const budgets = budgetsResult.data || [];
      const financial = financialResult.data || [];

      const lowStock =
        materials.filter(
          (material) =>
            Number(material.available_qty) <=
            Number(material.min_stock)
        ).length;

      const criticalStock =
        materials.filter(
          (material) =>
            Number(material.available_qty) <= 0
        ).length;

      const revenue =
        financial
          .filter(
            (entry) =>
              entry.type === 'income' ||
              entry.type === 'entrada'
          )
          .reduce(
            (sum, entry) =>
              sum + Number(entry.amount || 0),
            0
          );

      const expenses =
        financial
          .filter(
            (entry) =>
              entry.type === 'expense' ||
              entry.type === 'saida'
          )
          .reduce(
            (sum, entry) =>
              sum + Number(entry.amount || 0),
            0
          );

      const approvedQuotes =
        budgets.filter(
          (quote) =>
            quote.status === 'approved' ||
            quote.status === 'aprovado'
        ).length;

      setUserName(
        profileResult.data?.display_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name ||
          user.email?.split('@')[0] ||
          'Usuário'
      );

      setStats({
        totalMaterials: materials.length,
        lowStock,
        criticalStock,
        totalProducts: pricings.length,
        totalClients: clients.length,
        totalQuotes: budgets.length,
        approvedQuotes,
        totalRevenue: revenue,
        totalExpenses: expenses,
        estimatedProfit: revenue - expenses,
      });
    } catch (error) {
      console.error('Erro dashboard:', error);
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

  const financeData =
    stats.totalRevenue === 0 &&
    stats.totalExpenses === 0 &&
    stats.estimatedProfit === 0
      ? []
      : [
          {
            name: 'Faturamento',
            value: stats.totalRevenue,
          },
          {
            name: 'Despesas',
            value: stats.totalExpenses,
          },
          {
            name: 'Lucro',
            value: stats.estimatedProfit,
          },
        ];

  const stockData =
    stats.totalMaterials === 0
      ? []
      : [
          {
            name: 'Baixo',
            value: stats.lowStock,
          },
          {
            name: 'Crítico',
            value: stats.criticalStock,
          },
          {
            name: 'Normal',
            value:
              Math.max(
                0,
                stats.totalMaterials -
                  stats.lowStock -
                  stats.criticalStock
              ),
          },
        ];

  const quotesData =
    stats.totalQuotes === 0
      ? []
      : [
          {
            name: 'Aprovados',
            value: stats.approvedQuotes,
          },
          {
            name: 'Pendentes',
            value:
              stats.totalQuotes -
              stats.approvedQuotes,
          },
        ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-black text-[#1A1F5E]">
          {getGreeting()}, {userName} 👋
        </h1>

        <p className="text-gray-500 mt-1 font-medium">
          Aqui está o resumo do seu negócio.
        </p>
      </div>

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

      {/* GRÁFICOS */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-lg font-black text-[#1A1F5E] mb-5">
            Financeiro
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart data={financeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar
                dataKey="value"
                radius={[10, 10, 0, 0]}
                fill="#ec4899"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-lg font-black text-[#1A1F5E] mb-5">
            Orçamentos
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <PieChart>
              <Pie
                data={quotesData}
                dataKey="value"
                outerRadius={100}
                label
              >
                <Cell fill="#22c55e" />
                <Cell fill="#facc15" />
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 xl:col-span-2">
          <h2 className="text-lg font-black text-[#1A1F5E] mb-5">
            Estoque
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <LineChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#ec4899"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

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