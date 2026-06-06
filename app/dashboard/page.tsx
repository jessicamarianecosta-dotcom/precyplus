'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Calculator, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatCard, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const SAMPLE_CHART = [
  { mes: 'Jan', precificacoes: 4 },
  { mes: 'Fev', precificacoes: 7 },
  { mes: 'Mar', precificacoes: 5 },
  { mes: 'Abr', precificacoes: 12 },
  { mes: 'Mai', precificacoes: 9 },
  { mes: 'Jun', precificacoes: 15 },
];

const PIE_DATA = [
  { name: 'Materiais', value: 40, color: '#FFB3D1' },
  { name: 'Custos fixos', value: 25, color: '#B3D4FF' },
  { name: 'Mão de obra', value: 20, color: '#FFF3B0' },
  { name: 'Margem', value: 15, color: '#A7F3D0' },
];

const SAMPLE_MOVEMENTS = [
  { type: 'exit', material: 'Papel Sulfite', qty: '100 folhas', date: 'Hoje', product: 'Caderno A5' },
  { type: 'entry', material: 'Fita adesiva', qty: '2 rolos', date: 'Ontem', product: 'Compra' },
  { type: 'exit', material: 'Wire-o', qty: '1 unidade', date: 'Ontem', product: 'Agenda Semanal' },
];

export default function DashboardPage() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || '';
      setUserName(name);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const currentMonth = MONTHS[new Date().getMonth()];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: '#1A1F5E', fontFamily: 'Playfair Display, serif' }}>
          {greeting}{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-gray-500 font-semibold mt-1">Aqui está um resumo do seu negócio em {currentMonth}.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Produtos" value="12" icon={ShoppingBag} color="pink" />
        <StatCard label="Materiais" value="28" icon={Package} color="blue" />
        <StatCard label="Precificações" value="47" icon={Calculator} color="yellow" />
        <StatCard label="Estoque baixo" value="3" icon={AlertTriangle} color="green" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-pink-50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-black text-gray-800">Precificações por mês</h2>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">Últimos 6 meses</p>
            </div>
            <Badge variant="pink">2025</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SAMPLE_CHART} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fontFamily: 'Nunito', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fontFamily: 'Nunito', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontFamily: 'Nunito', borderRadius: '12px', border: '1px solid #FFD6E7', fontSize: '13px' }}
                cursor={{ fill: '#FFF0F6' }}
              />
              <Bar dataKey="precificacoes" fill="url(#barGrad)" radius={[8, 8, 0, 0]} name="Precificações" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6BAD" />
                  <stop offset="100%" stopColor="#FFB3D1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl p-6 border border-pink-50 shadow-sm">
          <h2 className="font-black text-gray-800 mb-1">Composição do custo</h2>
          <p className="text-xs text-gray-500 font-semibold mb-4">Distribuição média</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: 'Nunito', borderRadius: '12px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {PIE_DATA.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs font-semibold text-gray-600">{item.name}</span>
                </div>
                <span className="text-xs font-black text-gray-700">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock alerts */}
        <div className="bg-white rounded-2xl p-6 border border-pink-50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-800">⚠️ Estoque baixo</h2>
            <Link href="/dashboard/materiais" className="text-xs font-bold text-pink-500 hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Wire-o 3/4', qty: '2 unidades', min: '5 unidades', status: 'critical' },
              { name: 'Papel A4 colorido', qty: '50 folhas', min: '100 folhas', status: 'low' },
              { name: 'Fita washi', qty: '1 rolo', min: '3 rolos', status: 'critical' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: item.status === 'critical' ? '#FFF5F5' : '#FFFBE8' }}>
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500 font-semibold">Disponível: {item.qty}</p>
                </div>
                <Badge variant={item.status === 'critical' ? 'red' : 'yellow'}>
                  {item.status === 'critical' ? '🔴 Crítico' : '🟡 Baixo'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent movements */}
        <div className="bg-white rounded-2xl p-6 border border-pink-50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-800">Últimas movimentações</h2>
            <Link href="/dashboard/materiais" className="text-xs font-bold text-pink-500 hover:underline flex items-center gap-1">
              Ver histórico <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {SAMPLE_MOVEMENTS.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: m.type === 'exit' ? '#FFF0F6' : '#F0FDF4' }}>
                  <span>{m.type === 'exit' ? '📤' : '📥'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{m.material}</p>
                  <p className="text-xs text-gray-500 font-semibold">{m.product} · {m.qty}</p>
                </div>
                <span className="text-xs text-gray-400 font-semibold shrink-0">{m.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/dashboard/precificacao', icon: '🧮', label: 'Nova precificação', color: '#FFF0F6' },
          { href: '/dashboard/produtos', icon: '📦', label: 'Novo produto', color: '#EBF4FF' },
          { href: '/dashboard/materiais', icon: '🏪', label: 'Novo material', color: '#FFFBE8' },
          { href: '/dashboard/orcamentos', icon: '📋', label: 'Novo orçamento', color: '#F0FDF4' },
        ].map(({ href, icon, label, color }) => (
          <Link key={href} href={href}
            className="bg-white rounded-2xl p-4 text-center border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all group card-hover">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl" style={{ background: color }}>
              {icon}
            </div>
            <p className="text-xs font-bold text-gray-700 group-hover:text-pink-600 transition-colors">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
