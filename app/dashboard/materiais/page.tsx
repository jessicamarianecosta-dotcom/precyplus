'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, TrendingDown, History } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Button, Modal, Input, Select, Textarea, EmptyState, Badge } from '@/components/ui';
import { formatCurrency, MATERIAL_UNITS, MATERIAL_CATEGORIES, getStockStatus } from '@/lib/utils';
import { useMaterials } from '@/lib/materials-store';
import type { Material } from '@/types';

const UNIT_OPTS = [{ value: '', label: 'Selecione a unidade' }, ...MATERIAL_UNITS.map(u => ({ value: u, label: u }))];
const CAT_OPTS  = [{ value: '', label: 'Selecione a categoria' }, ...MATERIAL_CATEGORIES.map(c => ({ value: c, label: c }))];

const EMPTY_FORM = { name: '', category: '', purchased_qty: 0, unit: '', paid_value: 0, available_qty: 0, min_stock: 5, observations: '' };

const STATUS_CONFIG = {
  healthy:  { label: '🟢 Saudável', variant: 'green'  as const },
  low:      { label: '🟡 Baixo',    variant: 'yellow' as const },
  critical: { label: '🔴 Crítico',  variant: 'red'    as const },
};

export default function MateriaisPage() {
  const { materials, movements, addMaterial, updateMaterial, deleteMaterial, adjustStock, syncPendingMaterials, reloadMaterials } = useMaterials();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [adjustModal, setAdjustModal] = useState<Material | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  const filtered = materials.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !catFilter || m.category === catFilter;
    return matchSearch && matchCat;
  });

  function openNew() { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(m: Material) {
    setEditing(m);
    setForm({ name: m.name, category: m.category, purchased_qty: m.purchased_qty, unit: m.unit, paid_value: m.paid_value, available_qty: m.available_qty, min_stock: m.min_stock, observations: m.observations || '' });
    setModalOpen(true);
  }

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const calcUnitCost = (paid: number, qty: number) => qty > 0 ? paid / qty : 0;

  async function handleSave() {
    if (!form.name || !form.unit || !form.category) { toast.error('Preencha os campos obrigatórios'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const data = {
      name:          form.name,
      category:      form.category,
      purchased_qty: Number(form.purchased_qty),
      unit:          form.unit,
      paid_value:    Number(form.paid_value),
      available_qty: editing ? Number(form.available_qty) : Number(form.purchased_qty),
      min_stock:     Number(form.min_stock),
      observations:  form.observations,
    };

    try {
      if (editing) {
        await updateMaterial(editing.id, data);
        toast.success('Material atualizado!');
      } else {
        await addMaterial(data);
        toast.success('Material cadastrado! 📦');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar material: ' + ((err as any)?.message || String(err)));
      setLoading(false);
      return;
    }
    setModalOpen(false);
    setLoading(false);
  }

  // expose sync to global for the header button to call (avoids prop drilling)
  // register/unregister on component mount
  useEffect(() => {
    // @ts-ignore
    (window as any).__materialSync = async () => {
      setLoading(true);
      try {
        await syncPendingMaterials();
        await reloadMaterials();
        toast.success('Sincronização concluída.');
      } catch (e) {
        console.error(e);
        toast.error('Falha na sincronização.');
      } finally {
        setLoading(false);
      }
    };

    return () => { try { delete (window as any).__materialSync; } catch {} };
  }, [syncPendingMaterials, reloadMaterials]);

  function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;
    deleteMaterial(id);
    toast.success('Material removido.');
  }

  function handleAdjust() {
    if (!adjustModal || !adjustQty) return;
    const delta = Number(adjustQty);
    if (isNaN(delta)) { toast.error('Digite um número válido. Use + ou - (ex: 50 ou -20)'); return; }
    adjustStock(adjustModal.id, delta);
    toast.success(`Estoque ajustado! ${delta > 0 ? '+' : ''}${delta} ${adjustModal.unit}`);
    setAdjustModal(null);
    setAdjustQty('');
  }

 return (
  <div className="space-y-4 sm:space-y-0">
    <PageHeader
      title="Materiais & Estoque"
      subtitle="Gerencie seus materiais. O estoque baixa automaticamente quando você cria produtos."
      action={
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-4 sm:mt-0">

          <Button
            variant="secondary"
            icon={History}
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setHistoryOpen(true)}
          >
            Histórico
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={async () => {
              setLoading(true);

              try {
                await (window as any).__materialSync &&
                  await (window as any).__materialSync();
              } catch (e) {
                /* noop */
              } finally {
                setLoading(false);
              }
            }}
          >
            Sincronizar pendentes
          </Button>

          <Button
            icon={Plus}
            onClick={openNew}
            className="w-full sm:w-auto"
          >
            Novo material
          </Button>

        </div>
      }
    />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar material..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold focus:border-pink-300 bg-white" style={{ fontFamily: 'Nunito, sans-serif' }} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="py-2.5 px-4 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold focus:border-pink-300 bg-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
          <option value="">Todas as categorias</option>
          {MATERIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: materials.length, color: '#EBF4FF', icon: '📦' },
          { label: 'Estoque baixo', value: materials.filter(m => getStockStatus(m) === 'low').length, color: '#FFFBE8', icon: '🟡' },
          { label: 'Crítico',       value: materials.filter(m => getStockStatus(m) === 'critical').length, color: '#FFF5F5', icon: '🔴' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className="text-xl mb-1">{icon}</div>
            <p className="text-2xl font-black" style={{ color: '#1A1F5E' }}>{value}</p>
            <p className="text-xs text-gray-500 font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState icon="📦" title="Nenhum material encontrado"
            description="Cadastre seus materiais para começar a controlar o estoque automaticamente."
            action={<Button
  icon={Plus}
  onClick={openNew}
  className="w-full sm:w-auto"
>Cadastrar material</Button>} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Material', 'Categoria', 'Custo unit.', 'Disponível', 'Mín.', 'Status', 'Ações'].map(h => (
                    <th key={h} className="text-left py-3.5 px-4 text-xs font-black text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(m => {
                  const status = getStockStatus(m);
                  const sc = STATUS_CONFIG[status];
                  return (
                    <tr key={m.id} className="hover:bg-pink-50/30 transition-colors group">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-800 text-sm">{m.name}</p>
                        <p className="text-xs text-gray-400 font-semibold">{m.unit}</p>
                      </td>
                      <td className="py-3.5 px-4"><Badge variant="blue">{m.category}</Badge></td>
                      <td className="py-3.5 px-4 font-bold text-sm text-gray-700">{formatCurrency(m.unit_cost)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-black text-sm ${m.available_qty <= 0 ? 'text-red-500' : m.available_qty < m.min_stock ? 'text-amber-600' : 'text-gray-700'}`}>
                          {m.available_qty}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold ml-1">{m.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-gray-500 font-semibold">{m.min_stock}</td>
                      <td className="py-3.5 px-4"><Badge variant={sc.variant}>{sc.label}</Badge></td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setAdjustModal(m); setAdjustQty(''); }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="Ajustar estoque">
                            <TrendingDown size={14} />
                          </button>
                          <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-pink-50 text-pink-500"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Material Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar material' : 'Novo material'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Nome do material *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Papelão duplex" />
          </div>
          <Select label="Categoria *" value={form.category} onChange={e => set('category', e.target.value)} options={CAT_OPTS} />
          <Select label="Unidade *" value={form.unit} onChange={e => set('unit', e.target.value)} options={UNIT_OPTS} />
          <Input label="Quantidade comprada *" type="number" value={form.purchased_qty || ''} onChange={e => set('purchased_qty', e.target.value)} placeholder="Ex: 30" />
          <Input label="Valor pago (R$) *" type="number" step="0.01" value={form.paid_value || ''} onChange={e => set('paid_value', e.target.value)} placeholder="Ex: 15.00" prefix="R$" />
          {editing && (
            <Input label="Qtd. disponível atual" type="number" value={form.available_qty ?? ''} onChange={e => set('available_qty', e.target.value)} />
          )}
          <Input label="Estoque mínimo" type="number" value={form.min_stock || ''} onChange={e => set('min_stock', e.target.value)} placeholder="Ex: 5" />

          {Number(form.purchased_qty) > 0 && Number(form.paid_value) > 0 && (
            <div className="sm:col-span-2 rounded-xl p-4 border" style={{ background: '#FFF0F6', borderColor: '#FFD6E7' }}>
              <p className="text-sm font-bold" style={{ color: '#FF6BAD' }}>
                💡 Custo por {form.unit || 'unidade'}:{' '}
                {formatCurrency(calcUnitCost(Number(form.paid_value), Number(form.purchased_qty)))}
              </p>
            </div>
          )}

          <div className="sm:col-span-2">
            <Textarea label="Observações" value={form.observations} onChange={e => set('observations', e.target.value)} rows={2} placeholder="Informações adicionais..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={loading}>{editing ? 'Salvar alterações' : 'Cadastrar material'}</Button>
        </div>
      </Modal>

      {/* Adjust Modal */}
      <Modal open={!!adjustModal} onClose={() => setAdjustModal(null)} title="Ajustar estoque" size="sm">
        {adjustModal && (
          <>
            <div className="rounded-xl p-3 mb-4" style={{ background: '#FFF0F6' }}>
              <p className="text-sm font-bold" style={{ color: '#FF6BAD' }}>📦 {adjustModal.name}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Disponível: <strong>{adjustModal.available_qty} {adjustModal.unit}</strong>
              </p>
            </div>
            <Input label="Ajuste (+entrada / -saída)" type="number" value={adjustQty}
              onChange={e => setAdjustQty(e.target.value)} placeholder="Ex: 50 ou -20" />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="ghost" onClick={() => setAdjustModal(null)}>Cancelar</Button>
              <Button onClick={handleAdjust}>Aplicar ajuste</Button>
            </div>
          </>
        )}
      </Modal>

      {/* History Modal */}
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Histórico de movimentações" size="lg">
        {movements.length === 0 ? (
          <div className="text-center py-8 text-gray-400 font-semibold text-sm">
            Nenhuma movimentação registrada ainda.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 -mx-6">
            {movements.map(mv => (
              <div key={mv.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: mv.type === 'entry' ? '#F0FDF4' : mv.type === 'exit' ? '#FFF0F6' : '#EBF4FF' }}>
                  <span className="text-sm">
                    {mv.type === 'entry' ? '📥' : mv.type === 'exit' ? '📤' : '🔧'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{mv.material_name}</p>
                  <p className="text-xs text-gray-500 font-semibold">{mv.reason}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${mv.type === 'entry' ? 'text-emerald-600' : mv.type === 'exit' ? 'text-red-500' : 'text-blue-500'}`}>
                    {mv.type === 'entry' ? '+' : mv.type === 'exit' ? '-' : '±'}{mv.quantity}
                  </p>
                  <p className="text-xs text-gray-400 font-semibold">
                    {new Date(mv.created_at).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}


