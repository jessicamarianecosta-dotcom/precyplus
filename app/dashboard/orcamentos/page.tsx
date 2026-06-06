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
    useState<any[]>([]);

  const [products, setProducts] =
    useState<any[]>([]);

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
}