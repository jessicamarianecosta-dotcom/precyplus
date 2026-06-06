'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  Calculator,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
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

import { formatCurrency } from '@/lib/utils';

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

const SAMPLE_CHART = [
  { mes: 'Jan', precificacoes: 4 },
  { mes: 'Fev', precificacoes: 7 },
  { mes: 'Mar', precificacoes: 5 },
  { mes: 'Abr', precificacoes: 12 },
  { mes: 'Mai', precificacoes: 9 },
  { mes: 'Jun', precificacoes: 15 },
];

const PIE_DATA = [
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
];

const SAMPLE_MOVEMENTS = [
  {
    type: 'exit',
    material: 'Papel Sulfite',
    qty: '100 folhas',
    date: 'Hoje',
    product: 'Caderno A5',
  },

  {
    type: 'entry',
    material: 'Fita adesiva',
    qty: '2 rolos',
    date: 'Ontem',
    product: 'Compra',
  },

  {
    type: 'exit',
    material: 'Wire-o',
    qty: '1 unidade',
    date: 'Ontem',
    product: 'Agenda Semanal',
  },
];

export default function DashboardPage() {

  const [userName, setUserName] =
    useState('');

  useEffect(() => {

    const supabase =
      createClient();

    supabase.auth
      .getUser()
      .then(({ data }) => {

        const name =
          data.user?.user_metadata?.display_name ||
          data.user?.email?.split('@')[0] ||
          '';

        setUserName(name);

      });

  }, []);

  const hour =
    new Date().getHours();

  const greeting =
    hour < 12
      ? 'Bom dia'
      : hour < 18
      ? 'Boa tarde'
      : 'Boa noite';

  const currentMonth =
    MONTHS[
      new Date().getMonth()
    ];

  return (

    <div>

      {/* Header */}
      <div className="mb-8">

        <h1
          className="text-2xl font-black"
          style={{
            color: '#1A1F5E',
            fontFamily:
              'Playfair Display, serif',
          }}
        >

          {greeting}
          {userName
            ? `, ${userName.split(' ')[0]}`
            : ''}
          ! 👋

        </h1>

        <p className="text-gray-500 font-semibold mt-1">
          Aqui está um resumo do seu negócio em {currentMonth}.
        </p>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <StatCard
          label="Produtos"
          value="12"
          icon={ShoppingBag}
          color="pink"
        />

        <StatCard
          label="Materiais"
          value="28"
          icon={Package}
          color="blue"
        />

        <StatCard
          label="Precificações"
          value="47"
          icon={Calculator}
          color="yellow"
        />

        <StatCard
          label="Estoque baixo"
          value="3"
          icon={AlertTriangle}
          color="green"
        />

      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Bar chart */}
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
              2025
            </Badge>

          </div>

          <ResponsiveContainer
            width="100%"
            height={200}
          >

            <BarChart
              data={SAMPLE_CHART}
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
                    stopColor="#FF6BAD"
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

        {/* Pie chart */}
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
                data={PIE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >

                {PIE_DATA.map(
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

    </div>

  );
}