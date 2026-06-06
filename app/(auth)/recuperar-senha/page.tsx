'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, Check, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { toast.error('Digite seu e-mail'); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/configuracoes`,
    });
    if (error) toast.error(error.message);
    else setSent(true);
    setLoading(false);
  }

  if (sent) return (
    <div className="text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: 'linear-gradient(135deg, #FF6BAD, #FF8DC7)' }}>
        <Check size={36} className="text-white" />
      </div>
      <h2 className="text-2xl font-black mb-3" style={{ color: '#1A1F5E', fontFamily: 'Playfair Display, serif' }}>E-mail enviado!</h2>
      <p className="text-gray-500 font-semibold mb-6">Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
      <Link href="/login" className="inline-flex items-center gap-2 font-bold" style={{ color: '#FF6BAD' }}>
        <ArrowLeft size={16} /> Voltar ao login
      </Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <Link href="/login" className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-pink-500 mb-8">
        <ArrowLeft size={14} /> Voltar
      </Link>
      <h1 className="text-3xl font-black mb-1" style={{ color: '#1A1F5E', fontFamily: 'Playfair Display, serif' }}>Esqueceu a senha?</h1>
      <p className="text-gray-500 mb-8 font-semibold">Digite seu e-mail e enviaremos um link para recuperação.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-100 outline-none text-sm font-semibold focus:border-pink-300"
              style={{ fontFamily: 'Nunito, sans-serif' }} />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 font-bold text-white py-4 rounded-xl hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF6BAD, #FF8DC7)' }}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Enviar link <ArrowRight size={16} /></>}
        </button>
      </form>
    </div>
  );
}
