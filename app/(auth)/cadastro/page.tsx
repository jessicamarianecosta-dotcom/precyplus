'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function CadastroPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      // fingerprint
      const fp = await FingerprintJS.load();

      const result = await fp.get();

      const fingerprint = result.visitorId;

      // verifica se já existe trial
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('device_fingerprint', fingerprint)
        .limit(1);

      if (existing && existing.length > 0) {
        alert(
          'Você já utilizou o período gratuito neste dispositivo.'
        );

        setLoading(false);

        return;
      }

      // cria usuário
      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (error) {
        alert(error.message);

        setLoading(false);

        return;
      }

      // salva profile
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          device_fingerprint: fingerprint,
        });
      }

      alert('Conta criada com sucesso 💗');

      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);

      alert('Erro ao criar conta');
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAFAFA',
      }}
    >
      <form
        onSubmit={handleRegister}
        style={{
          background: 'white',
          padding: 40,
          borderRadius: 20,
          width: 400,
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 20,
          }}
        >
          Criar conta
        </h1>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: '100%',
            padding: 14,
            marginBottom: 14,
            borderRadius: 10,
            border: '1px solid #ddd',
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: '100%',
            padding: 14,
            marginBottom: 20,
            borderRadius: 10,
            border: '1px solid #ddd',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 12,
            border: 0,
            background:
              'linear-gradient(135deg,#FF6BAD,#FF8DC7)',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {loading
            ? 'Criando...'
            : 'Criar conta'}
        </button>

        <p
          style={{
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          Já tem conta?{' '}
          <Link href="/login">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}