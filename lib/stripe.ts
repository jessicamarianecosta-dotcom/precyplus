import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});

// Os IDs podem ser price_* ou prod_* — o checkout usa price_*
// Se for prod_*, o setup.js cria o preço e atualiza o .env
export const PLANS = {
  basic: {
    name:    'Basic',
    price:   1700,
    priceId: process.env.STRIPE_PRICE_BASIC!,
    label:   'R$ 17/mês',
  },
  pro: {
    name:    'Pro',
    price:   3700,
    priceId: process.env.STRIPE_PRICE_PRO!,
    label:   'R$ 37/mês',
    trial:   7,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export async function createCheckoutSession({
  planKey,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  planKey: PlanKey;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const plan = PLANS[planKey];

  // Garante que temos um price_* — se for prod_* busca o primeiro preço ativo
  let priceId = plan.priceId;
  if (priceId?.startsWith('prod_')) {
    const prices = await stripe.prices.list({ product: priceId, active: true, limit: 1 });
    if (prices.data.length === 0) {
      // Cria o preço automaticamente se não existir
      const created = await stripe.prices.create({
        product:    priceId,
        unit_amount: plan.price,
        currency:   'brl',
        recurring:  { interval: 'month' },
        nickname:   `Precy+ ${plan.name} Mensal`,
      });
      priceId = created.id;
    } else {
      priceId = prices.data[0].id;
    }
  }

  return stripe.checkout.sessions.create({
    mode:                 'subscription',
    payment_method_types: ['card'],
    customer_email:       userEmail,
    line_items:           [{ price: priceId, quantity: 1 }],
    metadata:             { userId, planKey },
    success_url:          successUrl,
    cancel_url:           cancelUrl,
    subscription_data: {
      metadata:            { userId, planKey },
      trial_period_days:   planKey === 'pro' ? PLANS.pro.trial : undefined,
    },
    locale: 'pt-BR',
  });
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer:   customerId,
    return_url: returnUrl,
  });
}
