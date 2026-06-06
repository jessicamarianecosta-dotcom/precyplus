import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import Stripe from 'stripe';

import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: '2026-05-27.dahlia',
  }
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: Request
) {
  const body = await req.text();

  const signature =
    (await headers()).get(
      'stripe-signature'
    );

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        body,
        signature!,
        process.env
          .STRIPE_WEBHOOK_SECRET!
      );
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      {
        error:
          'Webhook inválido',
      },
      { status: 400 }
    );
  }

  try {
    if (
      event.type ===
      'checkout.session.completed'
    ) {
      const session =
        event.data.object as Stripe.Checkout.Session;

      const customerEmail =
        session.customer_details
          ?.email;

      const subscriptionId =
        session.subscription as string;

      if (
        customerEmail &&
        subscriptionId
      ) {
        const subscription =
          await stripe.subscriptions.retrieve(
            subscriptionId
          );

        const priceId =
          subscription.items.data[0]
            .price.id;

        let plan = 'basic';

        if (
          priceId ===
          process.env
            .STRIPE_PRICE_PRO
        ) {
          plan = 'pro';
        }

        await supabase
          .from('profiles')
          .update({
            plan,
            subscription_status:
              'active',
          })
          .eq(
            'email',
            customerEmail
          );

        console.log(
          'Plano atualizado:',
          customerEmail,
          plan
        );
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          'Erro no webhook',
      },
      { status: 500 }
    );
  }
}