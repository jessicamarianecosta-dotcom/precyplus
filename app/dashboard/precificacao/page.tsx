'use client';

import { useState } from 'react';
import { Calculator, Plus, FileDown, Copy, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Button, Input, Select, Badge, EmptyState, Modal } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { Pricing } from '@/types';

const DEMO_PRODUCTS = [
  { id: '1', name: 'Caderno A5 Wire-o', materials_cost: 9.10, labor_time_minutes: 30 },
  { id: '2', name: 'Agenda Semanal', materials_cost: 15.50, labor_time_minutes: 45 },
  { id: 'custom', name: 'Produto personalizado', materials_cost: 0, labor_time_minutes: 0 },
];

const DEMO_PRICINGS: Pricing[] = [
  {
    id: '1', user_id: 'u1', product_id: '1', product_name: 'Caderno A5 Wire-o',
    materials_cost: 9.10, labor_cost: 6.00, fixed_cost_share: 3.20, packaging_cost: 1.50,
    delivery_cost: 0, commission_pct: 5, extra_taxes: 0, profit_margin: 40,
    total_cost: 19.80, min_price: 24.75, recommended_price: 33.00, premium_price: 42.00,
    created_at: new Date().toISOString(),
  },
];

function MarginBadge({ margin }: { margin: number }) {
  if (margin >= 30) return <Badge variant="green">🟢 Margem saudável ({margin}%)</Badge>;
  if (margin >= 15) return <Badge variant="yellow">🟡 Atenção ({margin}%)</Badge>;
  return <Badge variant="red">🔴 Lucro baixo ({margin}%)</Badge>;
}

const DEFAULT_FORM = {
  product_id: '', product_name: '', materials_cost: 0, labor_time_minutes: 0,
  hourly_rate: 15, packaging_cost: 0, delivery_cost: 0, commission_pct: 5,
  extra_taxes: 0, profit_margin: 40, fixed_cost_daily: 20,
};

export default function PrecificacaoPage() {
  const [pricings, setPricings] = useState<Pricing[]>(DEMO_PRICINGS);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState<Partial<Pricing> | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  function selectProduct(productId: string) {
    const p = DEMO_PRODUCTS.find(p => p.id === productId);
    if (p) {
      setForm(f => ({ ...f, product_id: p.id, product_name: p.name, materials_cost: p.materials_cost, labor_time_minutes: p.labor_time_minutes }));
    }
    setResult(null);
  }

  function calculate() {
    const { materials_cost, labor_time_minutes, hourly_rate, packaging_cost, delivery_cost, commission_pct, extra_taxes, profit_margin, fixed_cost_daily } = form;
    const laborCost = (labor_time_minutes / 60) * hourly_rate;
    const fixedShare = (labor_time_minutes / 480) * fixed_cost_daily; // 8h workday
    const directCost = Number(materials_cost) + laborCost + fixedShare + Number(packaging_cost) + Number(delivery_cost);
    const taxMultiplier = 1 + Number(commission_pct) / 100 + Number(extra_taxes) / 100;
    const totalCost = directCost * taxMultiplier;
    const minPrice = totalCost;
    const recommendedPrice = totalCost / (1 - Number(profit_margin) / 100);
    const premiumPrice = recommendedPrice * 1.3;

    setResult({
      materials_cost: Number(materials_cost), labor_cost: laborCost, fixed_cost_share: fixedShare,
      packaging_cost: Number(packaging_cost), delivery_cost: Number(delivery_cost),
      commission_pct: Number(commission_pct), profit_margin: Number(profit_margin),
      total_cost: totalCost, min_price: minPrice, recommended_price: recommendedPrice, premium_price: premiumPrice,
    });
  }

  async function handleSave() {
    if (!result || !form.product_name) { toast.error('Calcule a precificação primeiro'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const { id: _rid, user_id: _ruid, product_name: _rpn, product_id: _rpid, created_at: _rca, ...resultRest } = result as Pricing;
    const newP: Pricing = {
      id: Date.now().toString(), user_id: 'u1', product_id: form.product_id, product_name: form.product_name,
      ...resultRest, created_at: new Date().toISOString(),
    };
    setPricings(prev => [newP, ...prev]);
    toast.success('Precificação salva! ✨');
    setModalOpen(false);
    setForm(DEFAULT_FORM);
    setResult(null);
    setLoading(false);
  }

  function handleDuplicate(p: Pricing) {
    const dup = { ...p, id: Date.now().toString(), product_name: p.product_name + ' (cópia)', created_at: new Date().toISOString() };
    setPricings(prev => [dup, ...prev]);
    toast.success('Precificação duplicada!');
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir esta precificação?')) return;
    setPricings(prev => prev.filter(p => p.id !== id));
    toast.success('Removida.');
  }

  const filtered = pricings.filter(p => p.product_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Precificação"
        subtitle="Calcule automaticamente o preço ideal para seus produtos."
        action={<Button icon={Calculator} onClick={() => setModalOpen(true)}>Nova precificação</Button>}
      />

      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar precificação..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold focus:border-pink-300 bg-white" style={{ fontFamily: 'Nunito, sans-serif' }} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState icon="🧮" title="Nenhuma precificação ainda"
            description="Crie sua primeira precificação e descubra o preço ideal para seus produtos."
            action={<Button icon={Calculator} onClick={() => setModalOpen(true)}>Calcular agora</Button>} />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-pink-50/30 transition-colors"
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF0F6' }}>
                    <Calculator size={18} style={{ color: '#FF6BAD' }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-gray-800 truncate">{p.product_name}</h3>
                    <p className="text-xs text-gray-500 font-semibold">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-gray-500 font-semibold">Recomendado</p>
                    <p className="font-black text-lg" style={{ color: '#FF6BAD' }}>{formatCurrency(p.recommended_price)}</p>
                  </div>
                  <MarginBadge margin={p.profit_margin} />
                  {expandedId === p.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {expandedId === p.id && (
                <div className="border-t border-pink-50 p-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
                    {[
                      { label: 'Custo materiais', value: formatCurrency(p.materials_cost), color: '#FFF0F6' },
                      { label: 'Mão de obra', value: formatCurrency(p.labor_cost), color: '#EBF4FF' },
                      { label: 'Custo fixo', value: formatCurrency(p.fixed_cost_share), color: '#FFFBE8' },
                      { label: 'Custo total', value: formatCurrency(p.total_cost), color: '#F0FDF4' },
                      { label: 'Preço mínimo', value: formatCurrency(p.min_price), color: '#FFF5F5' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-xl p-3 text-center" style={{ background: color }}>
                        <p className="text-xs text-gray-500 font-semibold mb-1">{label}</p>
                        <p className="font-black text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-5">
                    {[
                      { label: 'Preço mínimo', value: p.min_price, sub: 'Sem lucro' },
                      { label: 'Preço recomendado', value: p.recommended_price, sub: `${p.profit_margin}% margem`, highlight: true },
                      { label: 'Preço premium', value: p.premium_price, sub: '+30% premium' },
                    ].map(({ label, value, sub, highlight }) => (
                      <div key={label} className="rounded-xl p-4 text-center border-2 transition-all"
                        style={{ borderColor: highlight ? '#FF6BAD' : 'transparent', background: highlight ? '#FFF0F6' : 'white' }}>
                        <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
                        <p className={`text-2xl font-black`} style={{ color: highlight ? '#FF6BAD' : '#1A1F5E' }}>{formatCurrency(value)}</p>
                        <p className="text-xs text-gray-400 font-semibold mt-1">{sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="secondary" size="sm" icon={Copy} onClick={() => handleDuplicate(p)}>Duplicar</Button>
                    <Button variant="secondary" size="sm" icon={FileDown}>Exportar PDF</Button>
                    <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(p.id)}>Excluir</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Calc Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setResult(null); setForm(DEFAULT_FORM); }} title="Nova precificação" size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: inputs */}
          <div className="space-y-4">
            <h3 className="font-black text-gray-700 text-sm uppercase tracking-wider">Produto</h3>
            <Select label="Produto cadastrado" value={form.product_id}
              onChange={e => selectProduct(e.target.value)}
              options={[{ value: '', label: 'Selecionar produto...' }, ...DEMO_PRODUCTS.map(p => ({ value: p.id, label: p.name }))]} />
            {form.product_id === 'custom' && (
              <Input label="Nome do produto" value={form.product_name} onChange={e => set('product_name', e.target.value)} placeholder="Ex: Caderno personalizado" />
            )}

            <div className="pt-2">
              <h3 className="font-black text-gray-700 text-sm uppercase tracking-wider mb-3">Custos</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Custo materiais (R$)" type="number" step="0.01" value={form.materials_cost || ''} onChange={e => set('materials_cost', e.target.value)} prefix="R$" />
                <Input label="Tempo de produção (min)" type="number" value={form.labor_time_minutes || ''} onChange={e => set('labor_time_minutes', e.target.value)} />
                <Input label="Valor/hora (R$)" type="number" step="0.01" value={form.hourly_rate || ''} onChange={e => set('hourly_rate', e.target.value)} prefix="R$" />
                <Input label="Custo fixo/dia (R$)" type="number" step="0.01" value={form.fixed_cost_daily || ''} onChange={e => set('fixed_cost_daily', e.target.value)} prefix="R$" />
                <Input label="Embalagem (R$)" type="number" step="0.01" value={form.packaging_cost || ''} onChange={e => set('packaging_cost', e.target.value)} prefix="R$" />
                <Input label="Entrega (R$)" type="number" step="0.01" value={form.delivery_cost || ''} onChange={e => set('delivery_cost', e.target.value)} prefix="R$" />
              </div>
            </div>

            <div className="pt-2">
              <h3 className="font-black text-gray-700 text-sm uppercase tracking-wider mb-3">Margem e taxas</h3>
              <div className="grid grid-cols-3 gap-3">
                <Input label="Comissão (%)" type="number" value={form.commission_pct || ''} onChange={e => set('commission_pct', e.target.value)} />
                <Input label="Taxas extras (%)" type="number" value={form.extra_taxes || ''} onChange={e => set('extra_taxes', e.target.value)} />
                <Input label="Margem de lucro (%)" type="number" value={form.profit_margin || ''} onChange={e => set('profit_margin', e.target.value)} />
              </div>
            </div>

            <Button onClick={calculate} className="w-full" icon={Calculator} size="lg">
              Calcular agora
            </Button>
          </div>

          {/* Right: result */}
          <div>
            {!result ? (
              <div className="h-full flex items-center justify-center rounded-2xl border-2 border-dashed border-pink-100 p-8 text-center">
                <div>
                  <div className="text-4xl mb-3">🧮</div>
                  <p className="font-bold text-gray-500">Preencha os dados e clique em <br />"Calcular agora" para ver o resultado.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-black text-gray-700 text-sm uppercase tracking-wider">Resultado</h3>

                {/* Cost breakdown */}
                <div className="rounded-2xl border border-pink-100 overflow-hidden">
                  {[
                    { label: 'Materiais', value: result.materials_cost! },
                    { label: 'Mão de obra', value: result.labor_cost! },
                    { label: 'Custo fixo', value: result.fixed_cost_share! },
                    { label: 'Embalagem', value: result.packaging_cost! },
                    { label: 'Entrega', value: result.delivery_cost! },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center px-4 py-2.5 odd:bg-pink-50/30">
                      <span className="text-sm font-semibold text-gray-600">{label}</span>
                      <span className="text-sm font-bold text-gray-800">{formatCurrency(value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-4 py-3 bg-pink-100">
                    <span className="font-black text-gray-800">Custo total</span>
                    <span className="font-black text-gray-800">{formatCurrency(result.total_cost!)}</span>
                  </div>
                </div>

                {/* Price suggestions */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Mínimo', value: result.min_price!, sub: 'sem lucro' },
                    { label: 'Recomendado', value: result.recommended_price!, sub: `${form.profit_margin}% lucro`, highlight: true },
                    { label: 'Premium', value: result.premium_price!, sub: '+30%' },
                  ].map(({ label, value, sub, highlight }) => (
                    <div key={label} className="rounded-xl p-3 text-center border-2"
                      style={{ borderColor: highlight ? '#FF6BAD' : '#f0f0f0', background: highlight ? '#FFF0F6' : 'white' }}>
                      <p className="text-xs font-bold text-gray-500">{label}</p>
                      <p className="font-black text-lg my-0.5" style={{ color: highlight ? '#FF6BAD' : '#1A1F5E' }}>{formatCurrency(value)}</p>
                      <p className="text-xs text-gray-400 font-semibold">{sub}</p>
                    </div>
                  ))}
                </div>

                <MarginBadge margin={form.profit_margin} />

                <Button onClick={handleSave} loading={loading} className="w-full" size="lg">
                  Salvar precificação 💾
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
