import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBillingPortalSession } from '@/lib/stripe';
import { createClient as adminSB } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    // Busca customer_id do perfil
    const db = adminSB(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: profile } = await db.from('profiles').select('stripe_customer_id').eq('id', user.id).single();
    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'Sem assinatura ativa' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const session = await createBillingPortalSession(profile.stripe_customer_id, `${baseUrl}/dashboard/configuracoes`);
    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('[portal]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
