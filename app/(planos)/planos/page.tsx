'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { usePlan } from '@/hooks/usePlan';
import Image from 'next/image';
import Link from 'next/link';

const BASIC_FEATURES = [
  'Precificação inteligente',
  'Produtos com materiais vinculados',
  'Materiais & estoque automático',
  'Custos fixos',
  'Dashboard com gráficos',
  'Geração de PDF',
  'Histórico de movimentações',
  'Suporte por e-mail',
];

const PRO_FEATURES = [
  'Tudo do Basic +',
  'Financeiro completo',
  'Fluxo de caixa',
  'Contas a pagar e receber',
  'Gestão de clientes',
  'Orçamentos profissionais',
  'Dashboard financeiro',
  'Duplicar precificações',
];

function PlanosInner() {
  const { plan, loading, subscribe } = usePlan();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get('canceled')) toast.error('Pagamento cancelado. Tente novamente quando quiser.');
  }, [params]);

  const isCurrent = (p: string) => plan === p;

  return (
    <div className="min-h-screen" style={{ background: '#FFF0F6', fontFamily: 'Nunito, sans-serif' }}>
      {/* Nav */}
      <div className="bg-white border-b border-pink-100 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Precy+" width={32} height={32} className="rounded-full" />
          <span className="font-black text-lg" style={{ color: '#1A1F5E' }}>Precy<span style={{ color: '#FF6BAD' }}>+</span></span>
        </Link>
        <Link href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-pink-500 transition-colors">
          ← Voltar ao dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#FF6BAD' }}>Planos</p>
          <h1 className="text-4xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1F5E' }}>
            Simples, sem pegadinha
          </h1>
          <p className="text-gray-500 font-semibold">Escolha o plano ideal para o seu negócio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BASIC */}
          <div className={`bg-white rounded-3xl p-8 border-2 shadow-sm transition-all ${isCurrent('basic') ? 'border-pink-300' : 'border-pink-100'}`}>
            {isCurrent('basic') && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-4"
                style={{ background: '#FFF0F6', color: '#FF6BAD', border: '1px solid #FFD6E7' }}>
                ✓ Seu plano atual
              </div>
            )}
            <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Basic</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-5xl font-black" style={{ color: '#1A1F5E' }}>R$ 17</span>
              <span className="text-gray-400 font-semibold mb-2">/mês</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">Para quem está começando</p>

            <div className="space-y-3 mb-8">
              {BASIC_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FFF0F6' }}>
                    <Check size={11} style={{ color: '#FF6BAD' }} />
                  </div>
                  <span className="text-sm text-gray-700 font-semibold">{f}</span>
                </div>
              ))}
            </div>

            {isCurrent('basic') ? (
              <div className="w-full text-center py-3.5 rounded-xl border-2 border-pink-200 text-pink-400 font-bold text-sm bg-pink-50">
                Plano atual
              </div>
            ) : (
              <button onClick={() => subscribe('basic')} disabled={loading}
                className="w-full py-3.5 rounded-xl border-2 border-pink-200 text-pink-500 font-bold text-sm hover:bg-pink-50 transition-colors disabled:opacity-50">
                Assinar Basic
              </button>
            )}
          </div>

          {/* PRO */}
          <div className="rounded-3xl p-8 border-2 border-pink-400 relative overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1A1F5E, #2D3480)' }}>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1"
              style={{ background: '#FF6BAD', color: 'white' }}>
              <Sparkles size={10} /> MAIS POPULAR
            </div>

            {isCurrent('pro') && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-4"
                style={{ background: 'rgba(255,179,209,0.2)', color: '#FFB3D1', border: '1px solid rgba(255,107,173,0.3)' }}>
                ✓ Seu plano atual
              </div>
            )}

            <p className="text-sm font-bold uppercase tracking-widest text-pink-300 mb-2">Pro</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-5xl font-black text-white">R$ 37</span>
              <span className="text-pink-200 font-semibold mb-2">/mês</span>
            </div>
            <p className="text-sm text-pink-200 mb-2">Para quem quer crescer de verdade</p>
            <p className="text-xs text-pink-300 font-bold mb-6 flex items-center gap-1">
              <Zap size={12} /> 7 dias grátis para experimentar
            </p>

            <div className="space-y-3 mb-8">
              {PRO_FEATURES.map((f, i) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#FF6BAD' }}>
                    <Check size={11} className="text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${i === 0 ? 'text-pink-300' : 'text-white'}`}>{f}</span>
                </div>
              ))}
            </div>

            {isCurrent('pro') ? (
              <div className="w-full text-center py-3.5 rounded-xl font-bold text-sm text-white"
                style={{ background: 'rgba(255,107,173,0.3)', border: '1px solid rgba(255,107,173,0.5)' }}>
                Plano atual ✓
              </div>
            ) : (
              <button onClick={() => subscribe('pro')} disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #FF6BAD, #FF8DC7)', boxShadow: '0 4px 20px rgba(255,107,173,0.4)' }}>
                {loading ? 'Carregando...' : 'Começar 7 dias grátis ✨'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-gray-500 font-semibold">
          Pagamento seguro via Stripe · Cancele quando quiser · Sem multas
        </p>
      </div>
    </div>
  );
}

export default function PlanosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{background:"#FFF0F6"}}><div className="w-8 h-8 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" /></div>}>
      <PlanosInner />
    </Suspense>
  );
}
