'use client';

import { useState, useEffect } from 'react';

type Item = {
  name: string;
  value: string;
};

const STORAGE_KEY = 'precy_fixed_costs';

const DEFAULT_ITEMS: Item[] = [
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
];

export default function CustosFixosPage() {
  const [items, setItems] = useState<Item[]>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_ITEMS;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) as Item[] : DEFAULT_ITEMS;
    } catch {
      return DEFAULT_ITEMS;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem() {
    setItems([...items, { name: '', value: '' }]);
  }

  function updateItem(index: number, field: keyof Item, value: string) {
    const copy = [...items];
    copy[index][field] = value;
    setItems(copy);
  }

  function removeItem(index: number) {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  }

  const total = items.reduce(
    (acc, item) => acc + (Number(item.value) || 0),
    0
  );

  return (
    <main style={{ padding: 30, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800 }}>
        Custos Fixos
      </h1>

      <p style={{ marginBottom: 20, color: '#666' }}>
        Adicione seus custos mensais
      </p>

      {/* LISTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{ display: 'flex', gap: 10 }}
          >
            <input
              style={{ flex: 1, padding: 10, border: '1px solid #ddd' }}
              value={item.name}
              placeholder="Nome"
              onChange={(e) =>
                updateItem(index, 'name', e.target.value)
              }
            />

            <input
              style={{ width: 120, padding: 10, border: '1px solid #ddd' }}
              value={item.value}
              placeholder="Valor"
              type="number"
              onChange={(e) =>
                updateItem(index, 'value', e.target.value)
              }
            />

            <button onClick={() => removeItem(index)}>
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
          padding: 12,
          background: '#FF4FA3',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        + Adicionar custo
      </button>

      {/* TOTAL */}
      <div style={{ marginTop: 20 }}>
        <h2>Total: R$ {total.toFixed(2)}</h2>
      </div>
    </main>
  );
}