'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type Plan = 'basic' | 'pro' | 'free';

export function usePlan() {
  const [plan, setPlan] = useState<Plan>('basic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await sb.from('profiles').select('plan').eq('id', user.id).single();
      setPlan((data?.plan as Plan) ?? 'basic');
      setLoading(false);
    }
    load();
  }, []);

  const isPro   = plan === 'pro';
  const isBasic = plan === 'basic' || plan === 'pro';

  async function subscribe(planKey: 'basic' | 'pro') {
    const res  = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planKey }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function openPortal() {
    const res  = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return { plan, loading, isPro, isBasic, subscribe, openPortal };
}
