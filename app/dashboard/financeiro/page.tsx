'use client';

import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Button, Modal, Input, Select, Badge, EmptyState } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { FinancialEntry } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const INCOME_CATS = ['Venda de produto', 'Serviço', 'Orçamento aprovado', 'Outros'];
const EXPENSE_CATS = ['Materiais', 'Marketing', 'Plataformas', 'Funcionário', 'Energia', 'Aluguel', 'Outros'];

const DEMO_ENTRIES: FinancialEntry[] = [
  { id: '1', user_id: 'u1', type: 'income', value: 85, description: 'Venda Cadernos (3 und)', category: 'Venda de produto', status: 'paid', paid_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: '2', user_id: 'u1', type: 'expense', value: 20, description: 'Compra Papel Sulfite', category: 'Materiais', status: 'paid', paid_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: '3', user_id: 'u1', type: 'income', value: 120, description: 'Kit papelaria personalizado', category: 'Venda de produto', status: 'pending', created_at: new Date().toISOString() },
  { id: '4', user_id: 'u1', type: 'expense', value: 37, description: 'Assinatura Precy+', category: 'Plataformas', status: 'paid', paid_at: new Date().toISOString(), created_at: new Date().toISOString() },
];

const FLOW_DATA = [
  { mes: 'Jan', entradas: 320, saidas: 180 },
  { mes: 'Fev', entradas: 450, saidas: 210 },
  { mes: 'Mar', entradas: 280, saidas: 150 },
  { mes: 'Abr', entradas: 620, saidas: 280 },
  { mes: 'Mai', entradas: 540, saidas: 230 },
  { mes: 'Jun', entradas: 780, saidas: 310 },
];

const EMPTY_FORM = { type: 'income' as 'income' | 'expense', value: '', description: '', category: '', client_name: '', due_date: '', status: 'pending' as 'pending' | 'paid' };

export default function FinanceiroPage() {
  const [entries, setEntries] = useState<FinancialEntry[]>(DEMO_ENTRIES);
  const [tab, setTab] = useState<'all' | 'income' | 'expense'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const totalIncome = entries.filter(e => e.type === 'income' && e.status === 'paid').reduce((s, e) => s + e.value, 0);
  const totalExpense = entries.filter(e => e.type === 'expense' && e.status === 'paid').reduce((s, e) => s + e.value, 0);
  const balance = totalIncome - totalExpense;
  const pending = entries.filter(e => e.status === 'pending').reduce((s, e) => s + e.value, 0);

  const filtered = entries.filter(e => tab === 'all' || e.type === tab);

  async function handleSave() {
    if (!form.value || !form.description || !form.category) { toast.error('Preencha os campos obrigatórios'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const newE: FinancialEntry = {
      id: Date.now().toString(), user_id: 'u1', type: form.type, value: Number(form.value),
      description: form.description, category: form.category, client_name: form.client_name,
      due_date: form.due_date, status: form.status,
      paid_at: form.status === 'paid' ? new Date().toISOString() : undefined,
      created_at: new Date().toISOString(),
    };
    setEntries(prev => [newE, ...prev]);
    toast.success(form.type === 'income' ? 'Entrada registrada! 💚' : 'Saída registrada!');
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setLoading(false);
  }

  function toggleStatus(id: string) {
    setEntries(prev => prev.map(e => e.id === id
      ? { ...e, status: e.status === 'pending' ? 'paid' : 'pending', paid_at: e.status === 'pending' ? new Date().toISOString() : undefined }
      : e));
  }

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Controle suas entradas, saídas e fluxo de caixa."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={TrendingDown} onClick={() => { setForm(f => ({ ...f, type: 'expense' })); setModalOpen(true); }}>Saída</Button>
            <Button icon={Plus} onClick={() => { setForm(f => ({ ...f, type: 'income' })); setModalOpen(true); }}>Entrada</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Entradas (mês)', value: formatCurrency(totalIncome), icon: ArrowUpRight, color: 'green', sub: 'pagas' },
          { label: 'Saídas (mês)', value: formatCurrency(totalExpense), icon: ArrowDownRight, color: 'red', sub: 'pagas' },
          { label: 'Saldo', value: formatCurrency(balance), icon: DollarSign, color: balance >= 0 ? 'green' : 'red', sub: 'atual' },
          { label: 'A receber/pagar', value: formatCurrency(pending), icon: TrendingUp, color: 'yellow', sub: 'pendente' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center`}
                style={{ background: color === 'green' ? '#F0FDF4' : color === 'red' ? '#FFF5F5' : color === 'yellow' ? '#FFFBE8' : '#EBF4FF' }}>
                <Icon size={16} style={{ color: color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : color === 'yellow' ? '#f59e0b' : '#4DA6FF' }} />
              </div>
            </div>
            <p className="text-xl font-black" style={{ color: '#1A1F5E' }}>{value}</p>
            <p className="text-xs text-gray-500 font-semibold">{label} <span className="text-gray-400">· {sub}</span></p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <h2 className="font-black text-gray-800 mb-5">Fluxo de caixa — últimos 6 meses</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={FLOW_DATA} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fontFamily: 'Nunito', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fontFamily: 'Nunito', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
            <Tooltip contentStyle={{ fontFamily: 'Nunito', borderRadius: '12px', fontSize: '13px' }} formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="entradas" fill="#86efac" radius={[6, 6, 0, 0]} name="Entradas" />
            <Bar dataKey="saidas" fill="#fca5a5" radius={[6, 6, 0, 0]} name="Saídas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs + entries */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex border-b border-gray-100 px-4 pt-4 gap-1">
          {([['all', 'Todos'], ['income', 'Entradas'], ['expense', 'Saídas']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${tab === v ? 'text-pink-600 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="💰" title="Nenhum lançamento" description="Registre suas entradas e saídas financeiras." action={<Button icon={Plus} onClick={() => setModalOpen(true)}>Novo lançamento</Button>} />
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(e => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: e.type === 'income' ? '#F0FDF4' : '#FFF5F5' }}>
                  {e.type === 'income' ? <ArrowUpRight size={16} className="text-emerald-500" /> : <ArrowDownRight size={16} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{e.description}</p>
                  <p className="text-xs text-gray-500 font-semibold">{e.category} · {formatDate(e.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleStatus(e.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-black transition-colors ${e.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {e.status === 'paid' ? '✓ Pago' : '⏳ Pendente'}
                  </button>
                  <p className={`font-black text-base ${e.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {e.type === 'income' ? '+' : '-'}{formatCurrency(e.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo lançamento" size="md">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['income', 'expense'] as const).map(t => (
              <button key={t} onClick={() => set('type', t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all border-2 ${form.type === t ? 'text-white border-transparent' : 'border-gray-100 text-gray-500'}`}
                style={form.type === t ? { background: t === 'income' ? 'linear-gradient(135deg,#22c55e,#86efac)' : 'linear-gradient(135deg,#ef4444,#fca5a5)' } : {}}>
                {t === 'income' ? '📥 Entrada' : '📤 Saída'}
              </button>
            ))}
          </div>
          <Input label="Valor (R$) *" type="number" step="0.01" value={form.value} onChange={e => set('value', e.target.value)} prefix="R$" />
          <Input label="Descrição *" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ex: Venda de 3 cadernos" />
          <Select label="Categoria *" value={form.category} onChange={e => set('category', e.target.value)}
            options={[{ value: '', label: 'Selecione' }, ...(form.type === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => ({ value: c, label: c }))]} />
          {form.type === 'income' && <Input label="Cliente" value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="Opcional" />}
          <Input label="Data de vencimento" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
          <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}
            options={[{ value: 'pending', label: '⏳ Pendente' }, { value: 'paid', label: '✓ Pago/Recebido' }]} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={loading}>Registrar lançamento</Button>
        </div>
      </Modal>
    </div>
  );
}
