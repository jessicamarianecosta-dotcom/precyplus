'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Button, Modal, Input, Select, Textarea, EmptyState, Badge } from '@/components/ui';
import { formatCurrency, MATERIAL_CATEGORIES, getStockStatus } from '@/lib/utils';
import { useMaterials } from '@/lib/materials-store';
import type { Product, ProductMaterial } from '@/types';

const DEMO_PRODUCTS: Product[] = [
  {
    id: '1', user_id: 'u1', name: 'Caderno A5 Wire-o', category: 'Papelaria',
    description: 'Caderno artesanal com capa PVC e miolo sulfite',
    labor_time_minutes: 30, created_at: '',
    materials: [
      { material_id: '1', material_name: 'Papel Sulfite A4', quantity: 100, unit: 'folha',    unit_cost: 0.04, total_cost: 4.00 },
      { material_id: '2', material_name: 'Wire-o 3/4',       quantity: 1,   unit: 'unidade',  unit_cost: 3.50, total_cost: 3.50 },
      { material_id: '3', material_name: 'Capa PVC',         quantity: 2,   unit: 'unidade',  unit_cost: 0.80, total_cost: 1.60 },
    ],
  },
];

export default function ProdutosPage() {
  const { materials, decreaseStock } = useMaterials();
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', category: '', description: '', labor_time_minutes: 30 });
  const [prodMaterials, setProdMaterials] = useState<ProductMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  function openNew() {
    setEditing(null);
    setForm({ name: '', category: '', description: '', labor_time_minutes: 30 });
    setProdMaterials([]);
    setStockWarnings([]);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, category: p.category, description: p.description || '', labor_time_minutes: p.labor_time_minutes });
    setProdMaterials(p.materials);
    setStockWarnings([]);
    setModalOpen(true);
  }

  // Adiciona uma linha de material vazia
  function addMaterialLine() {
    setProdMaterials(prev => [
      ...prev,
      { material_id: '', material_name: '', quantity: 1, unit: '', unit_cost: 0, total_cost: 0 },
    ]);
  }

  function removeMaterialLine(i: number) {
    setProdMaterials(prev => prev.filter((_, idx) => idx !== i));
  }

  // Quando seleciona um material, auto-preenche nome, unidade e custo
  function selectMaterial(i: number, materialId: string) {
    const found = materials.find(m => m.id === materialId);
    setProdMaterials(prev => prev.map((pm, idx) => {
      if (idx !== i) return pm;
      if (!found) return { ...pm, material_id: materialId, material_name: '', unit: '', unit_cost: 0, total_cost: 0 };
      return {
        ...pm,
        material_id:   found.id,
        material_name: found.name,
        unit:          found.unit,
        unit_cost:     found.unit_cost,
        total_cost:    found.unit_cost * pm.quantity,
      };
    }));
  }

  // Quando altera a quantidade
  function setQuantity(i: number, qty: string) {
    const q = parseFloat(qty) || 0;
    setProdMaterials(prev => prev.map((pm, idx) => {
      if (idx !== i) return pm;
      return { ...pm, quantity: q, total_cost: pm.unit_cost * q };
    }));
  }

  const totalMaterialCost = prodMaterials.reduce((s, m) => s + m.total_cost, 0);

  // Checa se tem estoque suficiente para todos os materiais
  function checkStock(): { ok: boolean; alerts: string[] } {
    const alerts: string[] = [];
    for (const pm of prodMaterials) {
      if (!pm.material_id) continue;
      const mat = materials.find(m => m.id === pm.material_id);
      if (!mat) continue;
      if (pm.quantity > mat.available_qty) {
        alerts.push(`⚠️ ${mat.name}: precisa de ${pm.quantity} ${mat.unit}, mas tem apenas ${mat.available_qty}`);
      }
    }
    return { ok: alerts.length === 0, alerts };
  }

  async function handleSave() {
    if (!form.name || !form.category) { toast.error('Preencha nome e categoria'); return; }
    if (prodMaterials.some(pm => !pm.material_id)) {
      toast.error('Selecione o material em todas as linhas ou remova as linhas vazias');
      return;
    }

    // Só baixa estoque ao criar, não ao editar
    if (!editing) {
      const { ok, alerts } = checkStock();
      if (!ok) {
        setStockWarnings(alerts);
        toast.error('Estoque insuficiente em alguns materiais. Veja os alertas abaixo.');
        return;
      }
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id
        ? { ...p, ...form, materials: prodMaterials }
        : p));
      toast.success('Produto atualizado!');
    } else {
      // ✅ Baixa estoque automaticamente
      const entries = prodMaterials
        .filter(pm => pm.material_id)
        .map(pm => ({
          material_id: pm.material_id,
          quantity:    pm.quantity,
          reason:      `Produto criado: ${form.name}`,
        }));

      const warnings = decreaseStock(entries);

      const newProduct: Product = {
        id:         Date.now().toString(),
        user_id:    'u1',
        ...form,
        materials:  prodMaterials,
        created_at: new Date().toISOString(),
      };
      setProducts(prev => [newProduct, ...prev]);

      if (warnings.length > 0) {
        warnings.forEach(w => toast.warning(w, { duration: 6000 }));
      }
      toast.success('Produto criado e estoque atualizado! ✅');
    }

    setModalOpen(false);
    setLoading(false);
    setStockWarnings([]);
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir este produto?')) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Produto removido.');
  }

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle="Crie produtos, vincule materiais e o estoque é baixado automaticamente."
        action={<Button icon={Plus} onClick={openNew}>Novo produto</Button>}
      />

      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold focus:border-pink-300 bg-white" style={{ fontFamily: 'Nunito, sans-serif' }} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState icon="🛍️" title="Nenhum produto cadastrado"
            description="Crie seus produtos e vincule os materiais para o estoque baixar automaticamente."
            action={<Button icon={Plus} onClick={openNew}>Criar produto</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(p => {
            const total = p.materials.reduce((s, m) => s + m.total_cost, 0);
            return (
              <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm card-hover group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-black text-gray-800">{p.name}</h3>
                    <Badge variant="pink" className="mt-1">{p.category}</Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-pink-50 text-pink-500"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>

                {p.description && <p className="text-xs text-gray-500 font-semibold mb-3 bg-gray-50 rounded-lg px-3 py-2">{p.description}</p>}

                {/* Lista de materiais do produto */}
                <div className="space-y-1.5 mb-4">
                  {p.materials.map((m, i) => {
                    const matInStock = materials.find(mat => mat.id === m.material_id);
                    const status = matInStock ? getStockStatus(matInStock) : null;
                    return (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full inline-block ${
                            status === 'critical' ? 'bg-red-400' : status === 'low' ? 'bg-amber-400' : 'bg-emerald-400'
                          }`} />
                          <span className="text-gray-600 font-semibold">
                            {m.material_name} <span className="text-gray-400">({m.quantity} {m.unit})</span>
                          </span>
                        </div>
                        <span className="font-black text-gray-700">{formatCurrency(m.total_cost)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-pink-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Custo de materiais</p>
                    <p className="font-black text-lg" style={{ color: '#FF6BAD' }}>{formatCurrency(total)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-semibold">Produção</p>
                    <p className="font-bold text-gray-700 text-sm">{p.labor_time_minutes} min</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal de criação/edição ──────────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setStockWarnings([]); }}
        title={editing ? 'Editar produto' : 'Novo produto'} size="xl">
        <div className="space-y-5">
          {/* Dados básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome do produto *" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Agenda A5" />
            <Select label="Categoria *" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              options={[{ value: '', label: 'Selecione' }, ...MATERIAL_CATEGORIES.map(c => ({ value: c, label: c }))]} />
            <Input label="Tempo de produção (minutos)" type="number"
              value={form.labor_time_minutes}
              onChange={e => setForm(f => ({ ...f, labor_time_minutes: Number(e.target.value) }))} />
            <Textarea label="Descrição" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              placeholder="Opcional..." />
          </div>

          {/* ── Materiais ────────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-sm font-black text-gray-700">Materiais utilizados</label>
                {!editing && (
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">
                    Ao salvar, o estoque será baixado automaticamente ✅
                  </p>
                )}
              </div>
              <Button variant="secondary" size="sm" icon={Plus} onClick={addMaterialLine}>
                Adicionar material
              </Button>
            </div>

            {prodMaterials.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-pink-100 p-8 text-center">
                <p className="text-2xl mb-2">📦</p>
                <p className="text-sm text-gray-500 font-semibold">Nenhum material adicionado.</p>
                <p className="text-xs text-gray-400 font-semibold mt-1">Clique em "Adicionar material" para começar.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 px-3 pb-1">
                  <div className="col-span-5 text-xs font-black text-gray-500 uppercase tracking-wider">Material</div>
                  <div className="col-span-2 text-xs font-black text-gray-500 uppercase tracking-wider">Quantidade</div>
                  <div className="col-span-2 text-xs font-black text-gray-500 uppercase tracking-wider">Unidade</div>
                  <div className="col-span-2 text-xs font-black text-gray-500 uppercase tracking-wider">Custo</div>
                  <div className="col-span-1" />
                </div>

                {prodMaterials.map((pm, i) => {
                  const matInfo = materials.find(m => m.id === pm.material_id);
                  const hasStock = matInfo ? pm.quantity <= matInfo.available_qty : true;
                  return (
                    <div key={i}
                      className={`grid grid-cols-12 gap-2 items-center rounded-xl p-2 border ${
                        !hasStock && pm.material_id ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'
                      }`}>
                      {/* Seletor de material */}
                      <div className="col-span-5">
                        <select
                          value={pm.material_id}
                          onChange={e => selectMaterial(i, e.target.value)}
                          className="w-full py-2.5 px-3 rounded-lg border-2 border-gray-200 outline-none text-sm font-semibold focus:border-pink-300 bg-white"
                          style={{ fontFamily: 'Nunito, sans-serif' }}>
                          <option value="">Selecionar material...</option>
                          {materials.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} (estoque: {m.available_qty} {m.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantidade */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={pm.quantity || ''}
                          onChange={e => setQuantity(i, e.target.value)}
                          className="w-full py-2.5 px-3 rounded-lg border-2 border-gray-200 outline-none text-sm font-semibold focus:border-pink-300 bg-white"
                          style={{ fontFamily: 'Nunito, sans-serif' }}
                          placeholder="1"
                        />
                      </div>

                      {/* Unidade (read-only) */}
                      <div className="col-span-2">
                        <div className="py-2.5 px-3 rounded-lg bg-white border border-gray-100 text-sm font-semibold text-gray-500">
                          {pm.unit || '—'}
                        </div>
                      </div>

                      {/* Custo total da linha */}
                      <div className="col-span-2">
                        <div className="py-2.5 px-3 rounded-lg text-sm font-black text-right"
                          style={{ background: '#FFF0F6', color: '#FF6BAD' }}>
                          {formatCurrency(pm.total_cost)}
                        </div>
                      </div>

                      {/* Remover */}
                      <div className="col-span-1 flex justify-center">
                        <button onClick={() => removeMaterialLine(i)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <X size={14} />
                        </button>
                      </div>

                      {/* Aviso de estoque insuficiente na linha */}
                      {pm.material_id && !hasStock && matInfo && (
                        <div className="col-span-12 flex items-center gap-1.5 px-1">
                          <AlertTriangle size={12} className="text-red-500 shrink-0" />
                          <span className="text-xs text-red-600 font-bold">
                            Estoque insuficiente — disponível: {matInfo.available_qty} {matInfo.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Total */}
                {prodMaterials.length > 0 && (
                  <div className="flex justify-end pt-2">
                    <div className="rounded-xl px-5 py-3 flex items-center gap-3"
                      style={{ background: 'linear-gradient(135deg,#FFF0F6,#FFE4F0)', border: '1px solid #FFD6E7' }}>
                      <span className="text-sm font-bold text-gray-600">Total de materiais:</span>
                      <span className="text-xl font-black" style={{ color: '#FF6BAD' }}>
                        {formatCurrency(totalMaterialCost)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Alertas de estoque */}
          {stockWarnings.length > 0 && (
            <div className="rounded-xl p-4 border border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-500" />
                <p className="text-sm font-black text-red-700">Estoque insuficiente</p>
              </div>
              {stockWarnings.map((w, i) => (
                <p key={i} className="text-xs text-red-600 font-semibold">{w}</p>
              ))}
            </div>
          )}

          {/* Aviso de baixa automática */}
          {!editing && prodMaterials.filter(pm => pm.material_id).length > 0 && stockWarnings.length === 0 && (
            <div className="rounded-xl p-3 border flex items-center gap-2"
              style={{ background: '#F0FDF4', borderColor: '#86EFAC' }}>
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
              <p className="text-xs font-bold text-emerald-700">
                Ao salvar, o estoque de{' '}
                {prodMaterials.filter(pm => pm.material_id).length} material(is) será baixado automaticamente.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button variant="ghost" onClick={() => { setModalOpen(false); setStockWarnings([]); }}>Cancelar</Button>
          <Button onClick={handleSave} loading={loading}>
            {editing ? 'Salvar alterações' : '✅ Criar produto e baixar estoque'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
