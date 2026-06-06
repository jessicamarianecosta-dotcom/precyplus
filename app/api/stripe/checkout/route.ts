import { NextResponse } from 'next/server';

import Stripe from 'stripe';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: '2026-05-27.dahlia',
  }
);

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const { plan } = body;

    let priceId = '';

    if (plan === 'basic') {
      priceId =
        process.env
          .STRIPE_PRICE_BASIC!;
    }

    if (plan === 'pro') {
      priceId =
        process.env
          .STRIPE_PRICE_PRO!;
    }

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            'Plano inválido',
        },
        { status: 400 }
      );
    }

    const session =
      await stripe.checkout.sessions.create(
        {
          payment_method_types: [
            'card',
          ],

          mode: 'subscription',

          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],

          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,

          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/assinatura`,
        }
      );

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          'Erro ao criar checkout',
      },
      { status: 500 }
    );
  }
}