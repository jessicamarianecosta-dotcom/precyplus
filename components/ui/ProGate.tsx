'use client';

import { usePlan } from '@/hooks/usePlan';
import { Button } from '@/components/ui';
import { Lock, Sparkles } from 'lucide-react';

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;
}

export function ProGate({ children, feature = 'este recurso' }: ProGateProps) {
  const { isPro, loading, subscribe } = usePlan();

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
    </div>
  );

  if (isPro) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'linear-gradient(135deg, #1A1F5E, #2D3480)' }}>
        <Lock size={28} className="text-white" />
      </div>
      <h2 className="text-xl font-black mb-2" style={{ color: '#1A1F5E', fontFamily: 'Playfair Display, serif' }}>
        Recurso PRO
      </h2>
      <p className="text-gray-500 font-semibold text-sm max-w-sm mb-8 leading-relaxed">
        <strong style={{ color: '#1A1F5E' }}>{feature}</strong> está disponível no plano PRO.
        Faça upgrade para desbloquear e continuar crescendo.
      </p>

      <div className="rounded-2xl border-2 border-pink-200 p-6 max-w-xs w-full mb-6"
        style={{ background: 'linear-gradient(135deg, #1A1F5E, #2D3480)' }}>
        <p className="text-pink-200 text-xs font-bold uppercase tracking-widest mb-1">Plano PRO</p>
        <p className="text-white font-black text-4xl mb-1">R$ 37</p>
        <p className="text-pink-200 text-xs font-semibold mb-4">/mês · 7 dias grátis</p>
        <div className="space-y-2 mb-5">
          {['Financeiro completo', 'Fluxo de caixa', 'Clientes', 'Orçamentos'].map(f => (
            <div key={f} className="flex items-center gap-2 text-xs text-pink-100 font-semibold">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background: '#FF6BAD' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              {f}
            </div>
          ))}
        </div>
        <Button
          onClick={() => subscribe('pro')}
          className="w-full"
          style={{ background: 'linear-gradient(135deg, #FF6BAD, #FF8DC7)', border: 'none' }}>
          <Sparkles size={14} /> Fazer upgrade agora
        </Button>
      </div>

      <p className="text-xs text-gray-400 font-semibold">Sem contratos. Cancele quando quiser.</p>
    </div>
  );
}
