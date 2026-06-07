'use client';

import { useState, useEffect } from 'react';

import {
  Plus,
  FileDown,
  Trash2,
  Search,
  Pencil,
} from 'lucide-react';

import { toast } from 'sonner';

import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

import {
  PageHeader,
  Button,
  Modal,
  Input,
  Textarea,
  EmptyState,
  Badge,
} from '@/components/ui';

import {
  formatCurrency,
  formatDate,
} from '@/lib/utils';

import { createClient } from '@/lib/supabase/client';

import type {
  Budget,
  BudgetItem,
  Client,
  Pricing,
} from '@/types';

const STATUS_MAP = {
  draft: {
    label: '📝 Rascunho',
    variant: 'gray' as const,
  },

  sent: {
    label: '📤 Enviado',
    variant: 'blue' as const,
  },

  approved: {
    label: '✅ Aprovado',
    variant: 'green' as const,
  },

  rejected: {
    label: '❌ Recusado',
    variant: 'red' as const,
  },
};

export default function OrcamentosPage() {

  const supabase =
    createClient();

  const [budgets, setBudgets] =
    useState<Budget[]>([]);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [pricings, setPricings] =
    useState<Pricing[]>([]);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState('');

  const [modalOpen, setModalOpen] =
    useState(false);

  const [newClientModalOpen, setNewClientModalOpen] =
    useState(false);

  const [newProductModalOpen, setNewProductModalOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      client_id: '',
      client_name: '',
      notes: '',
      valid_until: '',
    });

  const [items, setItems] =
    useState<BudgetItem[]>([
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);

  const [newClientForm, setNewClientForm] =
    useState({
      name: '',
      whatsapp: '',
      email: '',
      observations: '',
    });

  const [newProductForm, setNewProductForm] =
    useState({
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      observations: '',
      saveAsProduct: false,
    });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const userId =
    authData.user?.id;

  if (!userId) return;

  const {
    data: budgetsData,
  } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  const {
    data: clientsData,
  } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId);

  const {
    data: pricingsData,
  } = await supabase
    .from('pricings')
    .select('*')
    .eq('user_id', userId);

  setBudgets(
    budgetsData || []
  );

  setClients(
    clientsData || []
  );

  setPricings(
    pricingsData || []
  );
}

  const filtered = budgets.filter(
    b =>
      b.client_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  const total = items.reduce(
    (s, i) => s + i.total,
    0
  );

  const selectedClient = clients.find(
    client => client.id === form.client_id
  );

  const clientOptions = clients.map((client) => client.name);

  const pricingOptions = pricings.map(
    (pricing) => pricing.product_name
  );

  function resetForm() {
    setEditingId(null);

    setForm({
      client_id: '',
      client_name: '',
      notes: '',
      valid_until: '',
    });

    setItems([
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);
  }

  function openNewBudget() {
    resetForm();
    setModalOpen(true);
  }

  function handleAddItem() {
    setItems(prev => [
      ...prev,
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);
  }

  function handleRemoveItem(idx: number) {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function updateItem(
    idx: number,
    field: string,
    value: string | number
  ) {

    setItems(prev =>
      prev.map((item, i) => {

        if (i !== idx)
          return item;

        const updated = {
          ...item,
          [field]: value,
        };

        updated.total =
          Number(
            updated.quantity
          ) *
          Number(
            updated.unit_price
          );

        return updated;
      })
    );
  }

  function handleProductSelect(
    idx: number,
    productName: string
  ) {

    const pricing = pricings.find(
      p => p.product_name === productName
    );

    if (!pricing)
      return;

    const selectedPrice =
      Number(
        pricing.recommended_price ||
        pricing.premium_price ||
        pricing.min_price ||
        pricing.total_cost ||
        0
      );

    setItems(prev =>
      prev.map((item, i) => {

        if (i !== idx)
          return item;

        return {
          ...item,
          pricing_id:
            pricing.id,
          description:
            pricing.product_name,
          unit_price:
            selectedPrice,
          total:
            selectedPrice *
            Number(
              item.quantity
            ),
        };
      })
    );
  }

  async function handleSave() {

    if (!form.client_name) {

      toast.error(
        'Informe o cliente'
      );

      return;
    }

    setLoading(true);

    if (editingId) {

      await supabase
        .from('budgets')
        .update({

          client_id:
            form.client_id || null,

          client_name:
            form.client_name,

          notes:
            form.notes,

          valid_until:
            form.valid_until,

          items,

          total,

        })
        .eq(
          'id',
          editingId
        );

      toast.success(
        'Orçamento atualizado!'
      );

    } else {

      await supabase
        .from('budgets')
        .insert({

          client_id:
            form.client_id || null,

          client_name:
            form.client_name,

          notes:
            form.notes,

          valid_until:
            form.valid_until,

          items,

          total,

          status: 'draft',
        });

      toast.success(
        'Orçamento criado!'
      );
    }

    setEditingId(null);

    setForm({
      client_id: '',
      client_name: '',
      notes: '',
      valid_until: '',
    });

    setItems([
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);

    setModalOpen(false);

    await loadData();

    setLoading(false);
  }

  function handleEdit(
    budget: Budget
  ) {

    setEditingId(
      budget.id
    );

    setForm({
      client_id:
        budget.client_id || '',

      client_name:
        budget.client_name,

      notes:
        budget.notes || '',

      valid_until:
        budget.valid_until || '',
    });

    setItems(
      budget.items
    );

    setModalOpen(true);
  }

  async function handleDelete(
    id: string
  ) {

    if (
      !confirm(
        'Excluir orçamento?'
      )
    )
      return;

    await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    toast.success(
      'Removido.'
    );

    loadData();
  }

  function generatePDF(
    budget: Budget
  ) {

    const doc =
      new jsPDF();

    doc.setFontSize(20);

    doc.text(
      'ORÇAMENTO',
      14,
      20
    );

    doc.setFontSize(11);

    doc.text(
      `Cliente: ${budget.client_name}`,
      14,
      35
    );

    doc.text(
      `Data: ${formatDate(
        budget.created_at
      )}`,
      14,
      42
    );

    autoTable(doc, {
      startY: 55,

      head: [[
        'Produto',
        'Qtd',
        'Valor',
        'Total',
      ]],

      body:
        budget.items.map(
          item => [
            item.description,
            item.quantity,
            formatCurrency(
              item.unit_price
            ),
            formatCurrency(
              item.total
            ),
          ]
        ),
    });

    doc.text(
      `TOTAL: ${formatCurrency(
        budget.total
      )}`,
      14,
      (doc as any)
        .lastAutoTable
        .finalY + 15
    );

    if (budget.notes) {

      doc.text(
        `Obs: ${budget.notes}`,
        14,
        (doc as any)
          .lastAutoTable
          .finalY + 28
      );
    }

    doc.save(
      `orcamento-${budget.client_name}.pdf`
    );
  }

  async function handleCreateClient() {

  if (!newClientForm.name.trim()) {

    toast.error(
      'Informe o nome do cliente'
    );

    return;
  }

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const userId =
    authData.user?.id;

  if (!userId) {

    toast.error(
      'Usuário não autenticado'
    );

    return;
  }

  const {
    data,
    error,
  } = await supabase
    .from('clients')
    .insert({

      user_id: userId,

      name:
        newClientForm.name,

      whatsapp:
        newClientForm.whatsapp,

      email:
        newClientForm.email,

      observations:
        newClientForm.observations,
    })
    .select()
    .single();

  if (error || !data) {

    console.error(error);

    toast.error(
      error?.message ||
      'Falha ao criar cliente'
    );

    return;
  }

  setClients(prev => [
    data,
    ...prev,
  ]);

  setForm({
    ...form,

    client_id:
      data.id,

    client_name:
      data.name,
  });

  setNewClientForm({

    name: '',

    whatsapp: '',

    email: '',

    observations: '',
  });

  setNewClientModalOpen(false);

  toast.success(
    'Cliente criado e selecionado!'
  );
}

  async function handleAddCustomProduct() {
    if (!newProductForm.name.trim()) {
      toast.error('Informe o nome do produto');
      return;
    }

    const newItem: BudgetItem = {
      description: newProductForm.name,
      quantity: newProductForm.quantity,
      unit_price: newProductForm.unit_price,
      total: Number(newProductForm.quantity) * Number(newProductForm.unit_price),
    };

    setItems(prev => [...prev, newItem]);

    if (newProductForm.saveAsProduct) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from('products').insert({
          user_id: userData.user.id,
          name: newProductForm.name,
          category: 'Outros',
          description: newProductForm.description,
          unit: 'unidade',
        });
      }
    }

    setNewProductForm({
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      observations: '',
      saveAsProduct: false,
    });
    setNewProductModalOpen(false);
    toast.success('Produto personalizado adicionado!');
  }

  return (
    <div>
      <PageHeader
        title="Orçamentos"
        subtitle="Crie, edite e envie seus orçamentos."
        action={
          <Button icon={Plus} onClick={openNewBudget}>
            Novo orçamento
          </Button>
        }
      />

      <div className="relative mb-6 max-w-md">
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cliente..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold focus:border-pink-300 bg-white"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState
            icon="📄"
            title="Nenhum orçamento encontrado"
            description="Cadastre o primeiro orçamento."
            action={
              <Button icon={Plus} onClick={openNewBudget}>
                Criar orçamento
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map(budget => (
            <div
              key={budget.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {budget.client_name}
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    Criado em {formatDate(budget.created_at)}
                  </p>
                </div>
                <Badge variant={STATUS_MAP[budget.status].variant}>
                  {STATUS_MAP[budget.status].label}
                </Badge>
              </div>

              <div className="grid gap-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center justify-between">
                  <span>Validade</span>
                  <span>{budget.valid_until ? formatDate(budget.valid_until) : 'Não definida'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span className="font-black">{formatCurrency(budget.total)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                {budget.notes || 'Sem observações'}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => generatePDF(budget)}>
                  PDF
                </Button>
                <Button variant="secondary" onClick={() => handleEdit(budget)}>
                  Editar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(budget.id)}>
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar orçamento' : 'Novo orçamento'}
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
            <div className="space-y-2">
              <Input
                label="Cliente *"
                value={form.client_name}
                onChange={e => {
                  const value = e.target.value;
                  const matched = clients.find(c => c.name === value);
                  setForm({
                    ...form,
                    client_name: value,
                    client_id: matched ? matched.id : '',
                  });
                }}
                placeholder="Buscar cliente existente"
                list="client-options"
              />
              <datalist id="client-options">
                {clientOptions.map(name => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setNewClientModalOpen(true)}
                >
                  + Novo Cliente
                </Button>
              </div>
              {selectedClient && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
                  {selectedClient.whatsapp && (
                    <div>WhatsApp: {selectedClient.whatsapp}</div>
                  )}
                  {selectedClient.email && (
                    <div>Email: {selectedClient.email}</div>
                  )}
                  {selectedClient.observations && (
                    <div>Obs: {selectedClient.observations}</div>
                  )}
                </div>
              )}
            </div>
            <Input
              label="Validade"
              type="date"
              value={form.valid_until}
              onChange={e => setForm({ ...form, valid_until: e.target.value })}
            />
            <Input
              label="Total"
              type="text"
              value={formatCurrency(total)}
              disabled
            />
          </div>

          <Textarea
            label="Observações"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Texto adicional para o orçamento"
          />

          <div className="space-y-4">
            <datalist id="product-options">
              {pricingOptions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>

            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid gap-3 md:grid-cols-[1.8fr_0.8fr_0.9fr_0.9fr_auto] items-end"
              >
                <div>
                  <Input
                    label="Produto"
                    list="product-options"
                    value={item.description}
                    onChange={e => {
                      updateItem(idx, 'description', e.target.value);
                      handleProductSelect(idx, e.target.value);
                    }}
                    placeholder="Buscar produto existente"
                  />
                </div>
                <Input
                  label="Qtd"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                />
                <Input
                  label="Valor unit."
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.unit_price}
                  onChange={e => updateItem(idx, 'unit_price', Number(e.target.value))}
                />
                <Input
                  label="Total"
                  type="text"
                  value={formatCurrency(item.total)}
                  disabled
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-red-500 hover:text-red-600 font-bold text-xl"
                  aria-label="Remover item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" icon={Plus} onClick={handleAddItem}>
              Adicionar item
            </Button>
            <Button variant="secondary" onClick={() => setNewProductModalOpen(true)}>
              + Produto Personalizado
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button loading={loading} onClick={handleSave}>
            Salvar orçamento
          </Button>
        </div>
      </Modal>

      <Modal
        open={newClientModalOpen}
        onClose={() => setNewClientModalOpen(false)}
        title="Novo cliente"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={newClientForm.name}
            onChange={e => setNewClientForm({ ...newClientForm, name: e.target.value })}
          />
          <Input
            label="WhatsApp"
            value={newClientForm.whatsapp}
            onChange={e => setNewClientForm({ ...newClientForm, whatsapp: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={newClientForm.email}
            onChange={e => setNewClientForm({ ...newClientForm, email: e.target.value })}
          />
          <Textarea
            label="Observações"
            value={newClientForm.observations}
            onChange={e => setNewClientForm({ ...newClientForm, observations: e.target.value })}
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setNewClientModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateClient}>
            Criar cliente
          </Button>
        </div>
      </Modal>

      <Modal
        open={newProductModalOpen}
        onClose={() => setNewProductModalOpen(false)}
        title="Produto personalizado"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nome do produto"
            value={newProductForm.name}
            onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
          />
          <Input
            label="Quantidade"
            type="number"
            min={1}
            value={newProductForm.quantity}
            onChange={e => setNewProductForm({ ...newProductForm, quantity: Number(e.target.value) })}
          />
          <Input
            label="Valor unitário"
            type="number"
            min={0}
            step={0.01}
            value={newProductForm.unit_price}
            onChange={e => setNewProductForm({ ...newProductForm, unit_price: Number(e.target.value) })}
          />
          <Input
            label="Total"
            type="text"
            value={formatCurrency(newProductForm.quantity * newProductForm.unit_price)}
            disabled
          />
          <Textarea
            label="Descrição"
            value={newProductForm.description}
            onChange={e => setNewProductForm({ ...newProductForm, description: e.target.value })}
            rows={3}
          />
          <div className="flex items-center gap-3">
            <input
              id="save-product"
              type="checkbox"
              checked={newProductForm.saveAsProduct}
              onChange={e => setNewProductForm({ ...newProductForm, saveAsProduct: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <label htmlFor="save-product" className="text-sm text-gray-600 font-semibold">
              Salvar como produto definitivo
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setNewProductModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddCustomProduct}>
            Adicionar produto
          </Button>
        </div>
      </Modal>
    </div>
  );
}
