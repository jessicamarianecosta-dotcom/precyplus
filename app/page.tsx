'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setLogged(!!user);
    }

    checkUser();
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: '#FAFAFA',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <Image
        src="/logo.png"
        alt="Precy+"
        width={120}
        height={120}
        className="rounded-full mb-6"
      />

      <h1
        className="text-5xl font-black mb-4"
        style={{
          color: '#1A1F5E',
          fontFamily: 'Playfair Display, serif',
        }}
      >
        Precy+
      </h1>

      <p className="text-gray-500 text-lg mb-10 text-center max-w-xl">
        Sistema inteligente para precificação,
        estoque e gestão financeira.
      </p>

      {logged ? (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-pink-500">
            Você está logada 💗
          </p>

          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-2xl text-white font-bold transition-all hover:scale-105"
            style={{
              background:
                'linear-gradient(135deg, #FF6BAD, #FF8DC7)',
            }}
          >
            Ir para Dashboard
          </Link>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-8 py-4 rounded-2xl text-white font-bold transition-all hover:scale-105"
            style={{
              background:
                'linear-gradient(135deg, #FF6BAD, #FF8DC7)',
            }}
          >
            Entrar
          </Link>

          <Link
            href="/cadastro"
            className="px-8 py-4 rounded-2xl border-2 border-pink-300 text-pink-500 font-bold transition-all hover:bg-pink-50"
          >
            Criar conta
          </Link>
        </div>
      )}
    </main>
  );
}