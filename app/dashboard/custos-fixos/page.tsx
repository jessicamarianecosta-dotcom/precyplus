'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CustosFixosPage() {
  const supabase = createClient();

  const [loading, setLoading] =
    useState(false);

  const [values, setValues] = useState({
    rent: '',
    energy: '',
    water: '',
    internet: '',
    employees: '',
    accountant: '',
    software: '',
    taxes: '',
    marketing: '',
    fuel: '',
    maintenance: '',
    prolabore: '',
    others: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('fixed_costs')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setValues({
        rent: data.rent?.toString() || '',
        energy: data.energy?.toString() || '',
        water: data.water?.toString() || '',
        internet:
          data.internet?.toString() || '',
        employees:
          data.employees?.toString() || '',
        accountant:
          data.accountant?.toString() || '',
        software:
          data.software?.toString() || '',
        taxes:
          data.taxes?.toString() || '',
        marketing:
          data.marketing?.toString() || '',
        fuel: data.fuel?.toString() || '',
        maintenance:
          data.maintenance?.toString() || '',
        prolabore:
          data.prolabore?.toString() || '',
        others:
          data.others?.toString() || '',
      });
    }
  }

  async function save() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const payload = {
      user_id: user.id,
      rent: Number(values.rent) || 0,
      energy: Number(values.energy) || 0,
      water: Number(values.water) || 0,
      internet:
        Number(values.internet) || 0,
      employees:
        Number(values.employees) || 0,
      accountant:
        Number(values.accountant) || 0,
      software:
        Number(values.software) || 0,
      taxes:
        Number(values.taxes) || 0,
      marketing:
        Number(values.marketing) || 0,
      fuel: Number(values.fuel) || 0,
      maintenance:
        Number(values.maintenance) || 0,
      prolabore:
        Number(values.prolabore) || 0,
      others:
        Number(values.others) || 0,
    };

    await supabase
      .from('fixed_costs')
      .upsert(payload);

    alert('Custos fixos salvos 💗');

    setLoading(false);
  }

  const total =
    Object.values(values).reduce(
      (acc, value) =>
        acc + (Number(value) || 0),
      0
    );

  function renderInput(
    label: string,
    key: keyof typeof values
  ) {
    return (
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          {label}
        </label>

        <input
          type="number"
          value={values[key]}
          onChange={(e) =>
            setValues({
              ...values,
              [key]: e.target.value,
            })
          }
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 12,
            border: '1px solid #ddd',
          }}
        />
      </div>
    );
  }

  return (
    <main
      style={{
        padding: 40,
      }}
    >
      <h1
        style={{
          fontSize: 38,
          fontWeight: 800,
          marginBottom: 10,
        }}
      >
        Custos Fixos
      </h1>

      <p
        style={{
          color: '#64748B',
          marginBottom: 40,
        }}
      >
        Cadastre os custos mensais da empresa.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(260px,1fr))',
          gap: 20,
        }}
      >
        {renderInput('Aluguel', 'rent')}
        {renderInput('Energia', 'energy')}
        {renderInput('Água', 'water')}
        {renderInput('Internet', 'internet')}
        {renderInput(
          'Funcionários',
          'employees'
        )}
        {renderInput(
          'Contador',
          'accountant'
        )}
        {renderInput(
          'Softwares',
          'software'
        )}
        {renderInput('Impostos', 'taxes')}
        {renderInput(
          'Marketing',
          'marketing'
        )}
        {renderInput(
          'Combustível',
          'fuel'
        )}
        {renderInput(
          'Manutenção',
          'maintenance'
        )}
        {renderInput(
          'Pró-labore',
          'prolabore'
        )}
        {renderInput('Outros', 'others')}
      </div>

      <div
        style={{
          marginTop: 40,
          padding: 30,
          borderRadius: 24,
          background:
            'linear-gradient(135deg,#FF4FA3,#FF85C2)',
          color: 'white',
        }}
      >
        <p
          style={{
            opacity: 0.9,
            marginBottom: 10,
          }}
        >
          Total mensal
        </p>

        <h2
          style={{
            fontSize: 48,
            fontWeight: 900,
          }}
        >
          R$ {total.toFixed(2)}
        </h2>
      </div>

      <button
        onClick={save}
        disabled={loading}
        style={{
          marginTop: 30,
          padding: '16px 28px',
          borderRadius: 14,
          border: 0,
          background:
            'linear-gradient(135deg,#FF4FA3,#FF85C2)',
          color: 'white',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {loading
          ? 'Salvando...'
          : 'Salvar custos'}
      </button>
    </main>
  );
}