'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function CadastroPage() {

  const supabase =
    createClient();

  const [nome, setNome] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleRegister(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setLoading(true);

    try {

      const {
        data,
        error,
      } = await supabase.auth.signUp({

        email,
        password,

        options: {

          data: {
            display_name:
              nome,
          },

        },

      });

      if (error) {

        alert(
          error.message
        );

        setLoading(false);

        return;
      }

      if (data.user) {

        await supabase
          .from('profiles')
          .insert({

            id:
              data.user.id,

            email,

            display_name:
              nome,

          });
      }

      alert(
        'Conta criada com sucesso 💗'
      );

      window.location.href =
        '/dashboard';

    } catch (err) {

      console.error(err);

      alert(
        'Erro ao criar conta'
      );
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

        {/* NOME */}
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) =>
            setNome(
              e.target.value
            )
          }
          style={{
            width: '100%',
            padding: 14,
            marginBottom: 14,
            borderRadius: 10,
            border: '1px solid #ddd',
          }}
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={{
            width: '100%',
            padding: 14,
            marginBottom: 14,
            borderRadius: 10,
            border: '1px solid #ddd',
          }}
        />

        {/* SENHA */}
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={{
            width: '100%',
            padding: 14,
            marginBottom: 20,
            borderRadius: 10,
            border: '1px solid #ddd',
          }}
        />

        {/* BOTÃO */}
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