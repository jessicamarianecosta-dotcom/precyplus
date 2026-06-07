'use client';

import { useState, useEffect } from 'react';

import {
  Calculator,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
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
  MATERIAL_CATEGORIES,
  MATERIAL_UNITS,
} from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useMaterials } from '@/lib/materials-store';
import type { Pricing, ProductMaterial } from '@/types';

const PRICINGS_KEY = 'precy_pricings';
const FIXED_COSTS_KEY = 'precy_fixed_costs';

const DEFAULT_FORM = {
  product_id: '',
  product_name: '',
  category: '',
  description: '',
  image_url: '',
  unit: 'unidade',
  product_type: '',
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

const PRODUCT_TYPES = [
  'Físico',
  'Digital',
  'Sob medida',
  'Personalizado',
];

const EMPTY_MATERIAL_LINE: ProductMaterial = {
  material_id: '',
  material_name: '',
  unit: '',
  quantity: 1,
  unit_cost: 0,
  total_cost: 0,
};

export default function PrecificacaoPage() {
  const supabase = createClient();
  const { materials } = useMaterials();

  const [pricings, setPricings] = useState<Pricing[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(PRICINGS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_FORM;
    try {
      const saved = localStorage.getItem(FIXED_COSTS_KEY);
      if (!saved) return DEFAULT_FORM;
      const fixedItems = JSON.parse(saved) as { value: string }[];
      const monthlyTotal = fixedItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
      return { ...DEFAULT_FORM, fixed_cost_daily: monthlyTotal / 30 };
    } catch {
      return DEFAULT_FORM;
    }
  });
  const [pricingMaterials, setPricingMaterials] = useState<ProductMaterial[]>([EMPTY_MATERIAL_LINE]);
  const [result, setResult] = useState<Partial<Pricing> | null>(null);
  const [fixedCostMonthly, setFixedCostMonthly] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [marginOptions, setMarginOptions] = useState<number[]>([40, 50, 100]);
  const [newMargin, setNewMargin] = useState('');

  useEffect(() => {
    localStorage.setItem(PRICINGS_KEY, JSON.stringify(pricings));
  }, [pricings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(FIXED_COSTS_KEY);
      if (!saved) return;
      const fixedItems = JSON.parse(saved) as { value: string }[];
      const monthlyTotal = fixedItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
      setFixedCostMonthly(monthlyTotal);
    } catch {
      // ignore parse issues
    }
  }, []);


  const setField = (key: string, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  function addPricingMaterial() {
    setPricingMaterials(prev => [...prev, EMPTY_MATERIAL_LINE]);
    setResult(null);
  }

  function removePricingMaterial(index: number) {
    setPricingMaterials(prev => prev.filter((_, idx) => idx !== index));
    setResult(null);
  }

  function selectMaterial(index: number, materialId: string) {
    const found = materials.find(item => item.id === materialId);
    if (!found) return;

    setPricingMaterials(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return {
        ...item,
        material_id: found.id,
        material_name: found.name,
        unit: found.unit,
        unit_cost: found.unit_cost,
        total_cost: found.unit_cost * item.quantity,
      };
    }));
    setResult(null);
  }

  function setMaterialQuantity(index: number, quantity: string) {
    const qty = Number(quantity) || 0;
    setPricingMaterials(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, quantity: qty, total_cost: item.unit_cost * qty };
    }));
    setResult(null);
  }

  function setMaterialUnitCost(index: number, unitCost: string) {
    const cost = Number(unitCost) || 0;
    setPricingMaterials(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, unit_cost: cost, total_cost: cost * item.quantity };
    }));
    setResult(null);
  }

  function normalizePricingMaterials(lines: ProductMaterial[]) {
    return lines.map(item => {
      const current = materials.find(mat => mat.id === item.material_id);
      const unit_cost = current?.unit_cost ?? item.unit_cost;
      return {
        ...item,
        unit: current?.unit ?? item.unit,
        material_name: current?.name ?? item.material_name,
        unit_cost,
        total_cost: unit_cost * item.quantity,
      };
    });
  }

  function addMarginOption() {
    const margin = Number(newMargin);
    if (!margin || margin <= 0 || margin >= 200) {
      toast.error('Digite uma margem válida entre 1 e 199');
      return;
    }
    if (marginOptions.includes(margin)) {
      toast.error('Margem já adicionada');
      return;
    }
    setMarginOptions(prev => [...prev, margin].sort((a, b) => a - b));
    setNewMargin('');
  }

  function removeMarginOption(margin: number) {
    setMarginOptions(prev => prev.filter(item => item !== margin));
  }

  const materialsCost = pricingMaterials.reduce((sum, item) => sum + item.total_cost, 0);
  const laborCost = (Number(form.labor_time_minutes) / 60) * Number(form.hourly_rate);
  const fixedCostShare = (Number(form.labor_time_minutes) / 480) * Number(form.fixed_cost_daily);
  const directCost = materialsCost + laborCost + Number(form.packaging_cost) + Number(form.delivery_cost);
  const indirectCost = fixedCostShare;

  function calculate() {
    const taxMultiplier = 1 + Number(form.commission_pct) / 100 + Number(form.extra_taxes) / 100;
    const totalCost = (directCost + indirectCost) * taxMultiplier;
    const recommendedPrice = totalCost / (1 - Number(form.profit_margin) / 100);

    setResult({
      materials_cost: materialsCost,
      labor_cost: laborCost,
      fixed_cost_share: fixedCostShare,
      packaging_cost: Number(form.packaging_cost),
      delivery_cost: Number(form.delivery_cost),
      commission_pct: Number(form.commission_pct),
      extra_taxes: Number(form.extra_taxes),
      profit_margin: Number(form.profit_margin),
      direct_cost: directCost,
      indirect_cost: indirectCost,
      total_cost: totalCost,
      min_price: totalCost,
      recommended_price: recommendedPrice,
      premium_price: recommendedPrice * 1.3,
      profit_estimated: recommendedPrice - totalCost,
      materials: pricingMaterials,
    });
  }

  async function handleSave() {
    if (!result || !form.product_name) {
      toast.error('Calcule primeiro');
      return;
    }

    setLoading(true);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id || 'u1';

    const normalizedMaterials = normalizePricingMaterials(pricingMaterials);
    const existingPricing = editingPricingId ? pricings.find(item => item.id === editingPricingId) : null;
    const pricingId = editingPricingId || Date.now().toString();
    const createdAt = existingPricing?.created_at || new Date().toISOString();

    let productId = form.product_id || undefined;
    const productPayload = {
      user_id: userId,
      name: form.product_name,
      category: form.category || 'Outros',
      description: form.description || null,
      labor_time_minutes: form.labor_time_minutes,
      image_url: form.image_url || null,
      unit: form.unit || 'unidade',
      product_type: form.product_type || null,
    };

    if (editingPricingId && productId) {
      await supabase.from('products').update(productPayload).eq('id', productId);
    } else {
      const { data: productData, error: productError } = await supabase.from('products').insert(productPayload).select('id').single();
      if (productError || !productData) {

  console.error(
    'ERRO PRODUCT:',
    productError
  );

  toast.error(
    productError?.message ||
    'Erro ao salvar o produto'
  );

  setLoading(false);

  return;
}
      productId = productData.id;
    }

    if (productId) {
      await supabase.from('product_materials').delete().eq('product_id', productId);

      const productMaterialRows = normalizedMaterials
        .filter(material => material.material_id)
        .map(material => ({
          product_id: productId,
          material_id: material.material_id,
          material_name: material.material_name,
          quantity: material.quantity,
          unit: material.unit,
          unit_cost: material.unit_cost,
          total_cost: material.total_cost,
        }));

      if (productMaterialRows.length > 0) {
        await supabase.from('product_materials').insert(productMaterialRows);
      }
    }

    const pricingPayload = {
      user_id: userId,
      product_id: productId || null,
      product_name: form.product_name,
      materials_cost: result.materials_cost || 0,
      labor_cost: result.labor_cost || 0,
      fixed_cost_share: result.fixed_cost_share || 0,
      packaging_cost: result.packaging_cost || 0,
      delivery_cost: result.delivery_cost || 0,
      commission_pct: result.commission_pct || 0,
      extra_taxes: result.extra_taxes || 0,
      profit_margin: result.profit_margin || 0,
      total_cost: result.total_cost || 0,
      min_price: result.min_price || 0,
      recommended_price: result.recommended_price || 0,
      premium_price: result.premium_price || 0,
      created_at: createdAt,
    };

    if (editingPricingId) {
      await supabase.from('pricings').update(pricingPayload).eq('id', editingPricingId);
    } else {
      await supabase.from('pricings').insert(pricingPayload);
    }

    const savedPricing: Pricing = {
      id: pricingId,
      user_id: userId,
      product_id: productId || undefined,
      product_name: form.product_name,
      category: form.category,
      description: form.description,
      image_url: form.image_url,
      unit: form.unit,
      product_type: form.product_type,
      materials_cost: result.materials_cost || 0,
      labor_cost: result.labor_cost || 0,
      fixed_cost_share: result.fixed_cost_share || 0,
      packaging_cost: result.packaging_cost || 0,
      delivery_cost: result.delivery_cost || 0,
      commission_pct: result.commission_pct || 0,
      extra_taxes: result.extra_taxes || 0,
      profit_margin: result.profit_margin || 0,
      direct_cost: result.direct_cost || 0,
      indirect_cost: result.indirect_cost || 0,
      total_cost: result.total_cost || 0,
      min_price: result.min_price || 0,
      recommended_price: result.recommended_price || 0,
      premium_price: result.premium_price || 0,
      profit_estimated: result.profit_estimated || 0,
      materials: normalizedMaterials,
      created_at: createdAt,
    };

    setPricings(prev => {
      if (editingPricingId) {
        return [savedPricing, ...prev.filter(item => item.id !== editingPricingId)];
      }
      return [savedPricing, ...prev];
    });

    toast.success(editingPricingId ? 'Produto precificado atualizado!' : 'Produto precificado salvo!');
    setModalOpen(false);
    setEditingPricingId(null);
    setForm(DEFAULT_FORM);
    setPricingMaterials([EMPTY_MATERIAL_LINE]);
    setResult(null);
    setLoading(false);
  }

  function handleEdit(pricing: Pricing) {
    setEditingPricingId(pricing.id);
    setForm({
      product_id: pricing.product_id || '',
      product_name: pricing.product_name,
      category: pricing.category || '',
      description: pricing.description || '',
      image_url: pricing.image_url || '',
      unit: pricing.unit || 'unidade',
      product_type: pricing.product_type || '',
      materials_cost: pricing.materials_cost,
      labor_time_minutes: pricing.labor_cost && form.hourly_rate ? Math.round((pricing.labor_cost / form.hourly_rate) * 60) : 0,
      hourly_rate: form.hourly_rate,
      packaging_cost: pricing.packaging_cost,
      delivery_cost: pricing.delivery_cost,
      commission_pct: pricing.commission_pct,
      extra_taxes: pricing.extra_taxes,
      profit_margin: pricing.profit_margin,
      fixed_cost_daily: form.fixed_cost_daily,
    });
    setPricingMaterials(pricing.materials && pricing.materials.length > 0 ? normalizePricingMaterials(pricing.materials) : [EMPTY_MATERIAL_LINE]);
    setResult({
      materials_cost: pricing.materials_cost,
      labor_cost: pricing.labor_cost,
      fixed_cost_share: pricing.fixed_cost_share,
      packaging_cost: pricing.packaging_cost,
      delivery_cost: pricing.delivery_cost,
      commission_pct: pricing.commission_pct,
      extra_taxes: pricing.extra_taxes,
      profit_margin: pricing.profit_margin,
      direct_cost: pricing.direct_cost,
      indirect_cost: pricing.indirect_cost,
      total_cost: pricing.total_cost,
      min_price: pricing.min_price,
      recommended_price: pricing.recommended_price,
      premium_price: pricing.premium_price,
      profit_estimated: pricing.profit_estimated,
      materials: pricing.materials,
    });
    setModalOpen(true);
  }

  function handleCancelEdit() {
    setEditingPricingId(null);
    setModalOpen(false);
    setForm(DEFAULT_FORM);
    setPricingMaterials([EMPTY_MATERIAL_LINE]);
    setResult(null);
  }

  function handleDuplicate(pricing: Pricing) {
    const duplicate = {
      ...pricing,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      product_name: pricing.product_name + ' (cópia)',
    };
    setPricings(prev => [duplicate, ...prev]);
    toast.success('Duplicada!');
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir esta precificação?')) return;
    setPricings(prev => prev.filter(item => item.id !== id));
    toast.success('Removida.');
  }

  const filtered = pricings.filter(item => item.product_name.toLowerCase().includes(search.toLowerCase()));

  const suggestions = result ? marginOptions.map(margin => {
    const price =
  margin >= 100
    ? 0
    : result.total_cost
      ? result.total_cost /
        (1 - margin / 100)
      : 0;
    return { margin, price, profit: price - (result.total_cost || 0) };
  }) : [];

  return (
    <div>
      <PageHeader
        title="Precificação"
        subtitle="Calcule automaticamente o preço ideal."
        action={
          <Button icon={Calculator} onClick={() => setModalOpen(true)}>
            Criar Produto Precificado
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
            Esses valores vêm do módulo de Custos Fixos.
          </p>
        </div>
      )}

      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar precificação..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold focus:border-pink-300 bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState
            icon="🧮"
            title="Nenhuma precificação"
            description="Crie uma precificação para vincular ao produto."
            action={
              <Button icon={Calculator} onClick={() => setModalOpen(true)}>
                Calcular agora
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-pink-50/30 transition-colors"
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFF0F6' }}>
                    <Calculator size={18} style={{ color: '#FF6BAD' }} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800">{p.product_name}</h3>
                    <p className="text-xs text-gray-500 font-semibold">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-gray-500 font-semibold">Recomendado</p>
                    <p className="font-black text-lg" style={{ color: '#FF6BAD' }}>
                      {formatCurrency(p.recommended_price)}
                    </p>
                  </div>
                  <Badge variant={p.profit_margin >= 30 ? 'green' : p.profit_margin >= 15 ? 'yellow' : 'red'}>
                    {p.profit_margin}%
                  </Badge>
                  {expandedId === p.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {expandedId === p.id && (
                <div className="border-t border-pink-50 p-5">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="rounded-2xl bg-pink-50 p-4">
                      <p className="text-xs text-gray-500">Custo total</p>
                      <p className="font-black text-lg">{formatCurrency(p.total_cost)}</p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 p-4">
                      <p className="text-xs text-gray-500">Margem</p>
                      <p className="font-black text-lg">{p.profit_margin}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <strong className="block text-gray-800">{formatCurrency(p.materials_cost)}</strong> Materiais
                    </div>
                    <div>
                      <strong className="block text-gray-800">{formatCurrency(p.labor_cost)}</strong> Mão de obra
                    </div>
                    <div>
                      <strong className="block text-gray-800">{formatCurrency(p.fixed_cost_share)}</strong> Custos fixos
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={() => handleEdit(p)}>
                      Editar
                    </Button>
                    <Button variant="ghost" onClick={() => handleDuplicate(p)}>
                      Duplicar
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(p.id)}>
                      Excluir
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={handleCancelEdit} title={editingPricingId ? 'Editar produto precificado' : 'Criar produto precificado'} size="xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome do produto" value={form.product_name} onChange={e => setField('product_name', e.target.value)} />
            <Select
              label="Categoria"
              value={form.category}
              onChange={e => setField('category', e.target.value)}
              options={[{ value: '', label: 'Selecione uma categoria' }, ...MATERIAL_CATEGORIES.map(category => ({ value: category, label: category }))]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Descrição" value={form.description} onChange={e => setField('description', e.target.value)} />
            <Input label="Imagem / URL" value={form.image_url} onChange={e => setField('image_url', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Unidade"
              value={form.unit}
              onChange={e => setField('unit', e.target.value)}
              options={[{ value: '', label: 'Selecione uma unidade' }, ...MATERIAL_UNITS.map(unit => ({ value: unit, label: unit }))]}
            />
            <Select
              label="Tipo de produto"
              value={form.product_type}
              onChange={e => setField('product_type', e.target.value)}
              options={[{ value: '', label: 'Selecione um tipo' }, ...PRODUCT_TYPES.map(type => ({ value: type, label: type }))]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Tempo de produção (min)" type="number" value={form.labor_time_minutes} onChange={e => setField('labor_time_minutes', Number(e.target.value))} />
            <Input label="Custo fixo diário" type="number" value={form.fixed_cost_daily} onChange={e => setField('fixed_cost_daily', Number(e.target.value))} />
          </div>

          <div className="rounded-2xl bg-pink-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                Materiais: <strong>{formatCurrency(materialsCost)}</strong>
              </div>
              <div>
                Mão de obra: <strong>{formatCurrency(laborCost)}</strong>
              </div>
              <div>
                Custos diretos: <strong>{formatCurrency(directCost)}</strong>
              </div>
              <div>
                Custos fixos: <strong>{formatCurrency(indirectCost)}</strong>
              </div>
            </div>
          </div>

          <div className="border-t pt-5">
            <h3 className="font-black text-gray-800 mb-4">Materiais utilizados</h3>
            <div className="space-y-3">
              {pricingMaterials.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-xl">
                  <div className="col-span-5">
                    <Select
                      label="Material"
                      value={item.material_id}
                      onChange={e => selectMaterial(index, e.target.value)}
                      options={[{ value: '', label: 'Selecione' }, ...materials.map(mat => ({ value: mat.id, label: `${mat.name} (${formatCurrency(mat.unit_cost)}/${mat.unit})` }))]}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input label="Qtd" type="number" value={item.quantity} onChange={e => setMaterialQuantity(index, e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Input label="Valor unit." type="number" value={item.unit_cost} onChange={e => setMaterialUnitCost(index, e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Input label="Total" value={formatCurrency(item.total_cost)} readOnly />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => removePricingMaterial(index)} className="text-red-500">×</button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" icon={Plus} onClick={addPricingMaterial}>
              Adicionar material
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Embalagem" type="number" value={form.packaging_cost} onChange={e => setField('packaging_cost', Number(e.target.value))} />
            <Input label="Frete / entrega" type="number" value={form.delivery_cost} onChange={e => setField('delivery_cost', Number(e.target.value))} />
            <Input label="Valor hora" type="number" value={form.hourly_rate} onChange={e => setField('hourly_rate', Number(e.target.value))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Comissão (%)" type="number" value={form.commission_pct} onChange={e => setField('commission_pct', Number(e.target.value))} />
            <Input label="Impostos (%)" type="number" value={form.extra_taxes} onChange={e => setField('extra_taxes', Number(e.target.value))} />
            <Input label="Margem (%)" type="number" value={form.profit_margin} onChange={e => setField('profit_margin', Number(e.target.value))} />
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {marginOptions.map(margin => (
                  <Badge key={margin} variant="gray">
                  {margin}% <button type="button" onClick={() => removeMarginOption(margin)} className="ml-2 text-gray-400">×</button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap items-end">
              <Input label="Nova margem" type="number" value={newMargin} onChange={e => setNewMargin(e.target.value)} placeholder="Ex: 45" />
              <Button variant="secondary" icon={Plus} onClick={addMarginOption}>
                Adicionar margem
              </Button>
            </div>
          </div>

          {result && (
            <div className="rounded-2xl bg-white border border-gray-100 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="rounded-2xl bg-pink-50 p-4">
                  <p className="text-xs text-gray-500">Custo total</p>
                  <p className="font-black text-lg">{formatCurrency(result.total_cost || 0)}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-xs text-gray-500">Lucro estimado</p>
                  <p className="font-black text-lg">{formatCurrency(result.profit_estimated || 0)}</p>
                </div>
                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-xs text-gray-500">Preço recomendado</p>
                  <p className="font-black text-lg">{formatCurrency(result.recommended_price || 0)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {suggestions.map(row => (
                  <div key={row.margin} className="flex justify-between items-center rounded-xl border border-gray-100 p-3">
                    <span>{row.margin}%</span>
                    <span className="font-black">{formatCurrency(row.price)}</span>
                    <span className="text-xs text-gray-500">Lucro {formatCurrency(row.profit)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={calculate}>
            Calcular
          </Button>
          <Button variant="ghost" onClick={handleCancelEdit}>
            Cancelar
          </Button>
          <Button loading={loading} onClick={handleSave}>
            Salvar precificação
          </Button>
        </div>
      </Modal>
    </div>
  );
}
