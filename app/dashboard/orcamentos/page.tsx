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
  Select,
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
  Product,
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

  const [products, setProducts] =
    useState<Product[]>([]);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState('');

  const [modalOpen, setModalOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
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

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const {
      data: budgetsData,
    } = await supabase
      .from('budgets')
      .select('*')
      .order(
        'created_at',
        {
          ascending: false,
        }
      );

    const {
      data: clientsData,
    } = await supabase
      .from('clients')
      .select('*');

    const {
      data: productsData,
    } = await supabase
      .from('products')
      .select('*');

    setBudgets(
      budgetsData || []
    );

    setClients(
      clientsData || []
    );

    setProducts(
      productsData || []
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

  const clientOptions = [
    { value: '', label: 'Selecione um cliente' },
    ...clients.map(client => ({
      value: client.name,
      label: client.name,
    })),
  ];

  const productOptions = [
    { value: '', label: 'Selecione um produto' },
    ...products.map(product => ({
      value: product.name,
      label: product.name,
    })),
  ];

  function resetForm() {
    setEditingId(null);

    setForm({
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

    const product =
      products.find(
        p =>
          p.name ===
          productName
      );

    if (!product)
      return;

    setItems(prev =>
      prev.map((item, i) => {

        if (i !== idx)
          return item;

        return {
          ...item,
          description:
            product.name,
          unit_price:
            Number(
              product.sale_price
            ),
          total:
            Number(
              product.sale_price
            ) *
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
          <div className="grid gap-4 lg:grid-cols-3">
            <Select
              label="Cliente *"
              options={clientOptions}
              value={form.client_name}
              onChange={e => setForm({ ...form, client_name: e.target.value })}
            />
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
            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid gap-3 md:grid-cols-[1.8fr_0.8fr_0.9fr_0.9fr_auto] items-end"
              >
                <div>
                  <Select
                    label="Produto"
                    options={productOptions}
                    value={item.description}
                    onChange={e => handleProductSelect(idx, e.target.value)}
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

          <Button variant="secondary" icon={Plus} onClick={handleAddItem}>
            Adicionar item
          </Button>
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
    </div>
  );
}
