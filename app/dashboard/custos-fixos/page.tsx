'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Item = {
  name: string;
  value: string;
};

export default function CustosFixosPage() {
  const supabase = createClient();

  const [items, setItems] = useState<Item[]>([
    { name: 'Aluguel', value: '' },
    { name: 'Energia', value: '' },
    { name: 'Água', value: '' },
    { name: 'Internet', value: '' },
    { name: 'Funcionários', value: '' },
    { name: 'Contador', value: '' },
    { name: 'Softwares', value: '' },
    { name: 'Impostos', value: '' },
    { name: 'Marketing', value: '' },
    { name: 'Combustível', value: '' },
    { name: 'Manutenção', value: '' },
    { name: 'Depreciação', value: '' },
    { name: 'Pró-labore', value: '' },
  ]);

  const [loading, setLoading] = useState(false);

  function addItem() {
    setItems([...items, { name: '', value: '' }]);
  }

  function updateItem(index: number, field: keyof Item, value: string) {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  }

  function removeItem(index: number) {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  }

  const total = items.reduce(
    (acc, item) => acc + (Number(item.value) || 0),
    0
  );

  async function save() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from('fixed_costs').upsert({
      user_id: user.id,
      items,
      total,
      updated_at: new Date(),
    });

    alert('Custos fixos salvos com sucesso 💗');

    setLoading(false);
  }

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 36, fontWeight: 900 }}>
        💸 Custos Fixos
      </h1>

      <p style={{ color: '#666', marginBottom: 30 }}>
        Adicione todos os custos mensais da sua empresa para cálculo automático de precificação.
      </p>

      {/* LISTA DINÂMICA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <input
              placeholder="Nome do custo"
              value={item.name}
              onChange={(e) =>
                updateItem(index, 'name', e.target.value)
              }
              style={{
                flex: 1,
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 10,
              }}
            />

            <input
              placeholder="Valor"
              type="number"
              value={item.value}
              onChange={(e) =>
                updateItem(index, 'value', e.target.value)
              }
              style={{
                width: 140,
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 10,
              }}
            />

            <button
              onClick={() => removeItem(index)}
              style={{
                padding: '10px 14px',
                background: '#ffe5e5',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      {/* BOTÃO ADD */}
      <button
        onClick={addItem}
        style={{
          marginTop: 20,
          padding: '12px 18px',
          borderRadius: 12,
          border: 'none',
          background: '#FF4FA3',
          color: 'white',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        + Adicionar novo custo
      </button>

      {/* TOTAL */}
      <div
        style={{
          marginTop: 30,
          padding: 25,
          borderRadius: 16,
          background: 'linear-gradient(135deg,#FF4FA3,#FF85C2)',
          color: 'white',
        }}
      >
        <p>Total mensal</p>
        <h1 style={{ fontSize: 34, fontWeight: 900 }}>
          R$ {total.toFixed(2)}
        </h1>
      </div>

      {/* SALVAR */}
      <button
        onClick={save}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: '14px 20px',
          borderRadius: 12,
          border: 'none',
          background: '#111',
          color: 'white',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {loading ? 'Salvando...' : 'Salvar custos fixos'}
      </button>
    </main>
  );
}