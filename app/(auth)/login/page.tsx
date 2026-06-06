'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          }
        );

      if (error) {
        alert(error.message);
        return;
      }

      window.location.href =
        '/dashboard';
    } catch (error) {
      console.log(error);

      alert('Erro ao entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-6xl font-black text-[#1A1F5E] leading-tight mb-6">
        Bem-vinda de volta!
      </h1>

      <p className="text-gray-500 text-2xl mb-12">
        Entre na sua conta para continuar
      </p>

      <form
        onSubmit={handleLogin}
        className="space-y-5"
      >
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
          className="w-full p-5 rounded-2xl border border-gray-200 outline-none"
        />

        <input
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          required
          className="w-full p-5 rounded-2xl border border-gray-200 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 text-white font-bold py-5 rounded-2xl"
        >
          {loading
            ? 'Entrando...'
            : 'Entrar'}
        </button>
      </form>

      <p className="text-center mt-8 text-gray-500">
        Ainda não tem conta?{' '}
        <Link
          href="/cadastro"
          className="text-pink-500 font-bold"
        >
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}