'use client';

import { useState, useEffect } from 'react';

import {
  Package,
  ShoppingBag,
  Calculator,
  AlertTriangle,
} from 'lucide-react';

import Link from 'next/link';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  StatCard,
  Badge,
} from '@/components/ui';

import { createClient } from '@/lib/supabase/client';

const MONTHS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export default function DashboardPage() {

  const [userName, setUserName] =
    useState('');

  const [productsCount, setProductsCount] =
    useState(0);

  const [materialsCount, setMaterialsCount] =
    useState(0);

  const [pricingCount, setPricingCount] =
    useState(0);

  const [lowStockCount, setLowStockCount] =
    useState(0);

  const [chartData, setChartData] =
    useState([
      { mes: 'Jan', precificacoes: 0 },
      { mes: 'Fev', precificacoes: 0 },
      { mes: 'Mar', precificacoes: 0 },
      { mes: 'Abr', precificacoes: 0 },
      { mes: 'Mai', precificacoes: 0 },
      { mes: 'Jun', precificacoes: 0 },
    ]);

  const [pieData, setPieData] =
    useState([
      {
        name: 'Materiais',
        value: 40,
        color: '#FFB3D1',
      },

      {
        name: 'Custos fixos',
        value: 25,
        color: '#B3D4FF',
      },

      {
        name: 'Mão de obra',
        value: 20,
        color: '#FFF3B0',
      },

      {
        name: 'Margem',
        value: 15,
        color: '#A7F3D0',
      },
    ]);

  useEffect(() => {

    async function loadDashboard() {

      const supabase =
        createClient();

      const {
        count: products,
      } = await supabase
        .from('products')
        .select('*', {
          count: 'exact',
          head: true,
        });

      const {
        count: materials,
      } = await supabase
        .from('materials')
        .select('*', {
          count: 'exact',
          head: true,
        });

      const {
        count: pricing,
      } = await supabase
        .from('pricing')
        .select('*', {
          count: 'exact',
          head: true,
        });

      const {
        data: lowStock,
      } = await supabase
        .from('materials')
        .select('*')
        .lt(
          'current_stock',
          5
        );

      const {
        data: userData,
      } = await supabase.auth
        .getUser();

      const name =
        userData.user?.user_metadata?.display_name ||
        userData.user?.user_metadata?.full_name ||
        'Usuário';

      setUserName(name);

      setProductsCount(
        products || 0
      );

      setMaterialsCount(
        materials || 0
      );

      setPricingCount(
        pricing || 0
      );

      setLowStockCount(
        lowStock?.length || 0
      );
    }

    loadDashboard();

  }, []);

  const hour =
    new Date().getHours();

  const greeting =
    hour >= 5 && hour < 12
      ? 'Bom dia'
      : hour >= 12 && hour < 18
      ? 'Boa tarde'
      : 'Boa noite';

  const displayName =
    userName || 'Usuário';

  const currentMonth =
    MONTHS[
      new Date().getMonth()
    ];

  return (

    <div>

      {/* HEADER */}
      <div className="mb-8">

        <h1
          className="text-2xl font-black"
          style={{
            color:
              'var(--secondary-color)',
            fontFamily:
              'Playfair Display, serif',
          }}
        >

          {greeting}, {displayName} ! 👋

        </h1>

        <p className="text-gray-500 font-semibold mt-1">
          Aqui está um resumo do seu negócio em {currentMonth}.
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <StatCard
          label="Produtos"
          value={String(productsCount)}
          icon={ShoppingBag}
          color="pink"
        />

        <StatCard
          label="Materiais"
          value={String(materialsCount)}
          icon={Package}
          color="blue"
        />

        <StatCard
          label="Precificações"
          value={String(pricingCount)}
          icon={Calculator}
          color="yellow"
        />

        <StatCard
          label="Estoque baixo"
          value={String(lowStockCount)}
          icon={AlertTriangle}
          color="green"
        />

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* BAR CHART */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-pink-50 shadow-sm">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="font-black text-gray-800">
                Precificações por mês
              </h2>

              <p className="text-xs text-gray-500 font-semibold mt-0.5">
                Últimos 6 meses
              </p>

            </div>

            <Badge variant="pink">
              2026
            </Badge>

          </div>

          <ResponsiveContainer
            width="100%"
            height={200}
          >

            <BarChart
              data={chartData}
              barSize={32}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="mes"
                tick={{
                  fontSize: 12,
                  fontFamily: 'Nunito',
                  fontWeight: 600,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 12,
                  fontFamily: 'Nunito',
                  fontWeight: 600,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  fontFamily: 'Nunito',
                  borderRadius: '12px',
                  border: '1px solid #FFD6E7',
                  fontSize: '13px',
                }}
                cursor={{
                  fill: '#FFF0F6',
                }}
              />

              <Bar
                dataKey="precificacoes"
                fill="url(#barGrad)"
                radius={[8, 8, 0, 0]}
                name="Precificações"
              />

              <defs>

                <linearGradient
                  id="barGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="var(--primary-color)"
                  />

                  <stop
                    offset="100%"
                    stopColor="#FFB3D1"
                  />

                </linearGradient>

              </defs>

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* PIE CHART */}
        <div className="bg-white rounded-2xl p-6 border border-pink-50 shadow-sm">

          <h2 className="font-black text-gray-800 mb-1">
            Composição do custo
          </h2>

          <p className="text-xs text-gray-500 font-semibold mb-4">
            Distribuição média
          </p>

          <ResponsiveContainer
            width="100%"
            height={160}
          >

            <PieChart>

              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >

                {pieData.map(
                  (entry, i) => (

                    <Cell
                      key={i}
                      fill={entry.color}
                    />

                  )
                )}

              </Pie>

              <Tooltip
                contentStyle={{
                  fontFamily: 'Nunito',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">

        {[
          {
            href: '/dashboard/precificacao',
            icon: '🧮',
            label: 'Nova precificação',
            color: '#FFF0F6',
          },

          {
            href: '/dashboard/produtos',
            icon: '📦',
            label: 'Novo produto',
            color: '#EBF4FF',
          },

          {
            href: '/dashboard/materiais',
            icon: '🏪',
            label: 'Novo material',
            color: '#FFFBE8',
          },

          {
            href: '/dashboard/orcamentos',
            icon: '📋',
            label: 'Novo orçamento',
            color: '#F0FDF4',
          },

        ].map(
          ({
            href,
            icon,
            label,
            color,
          }) => (

            <Link
              key={href}
              href={href}
              className="
                bg-white
                rounded-2xl
                p-4
                text-center
                border
                border-gray-100
                hover:border-pink-200
                hover:shadow-md
                transition-all
                group
              "
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-3
                  text-2xl
                "
                style={{
                  background:
                    color,
                }}
              >
                {icon}
              </div>

              <p className="text-xs font-bold text-gray-700">
                {label}
              </p>

            </Link>

          )
        )}

      </div>

    </div>

  );
}