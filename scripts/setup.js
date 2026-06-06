#!/usr/bin/env node
/**
 * PRECY+ — Script de configuração inicial
 * Roda UMA VEZ para:
 *  1. Criar preços recorrentes no Stripe para os produtos Basic e Pro
 *  2. Executar o schema SQL no Supabase
 *  3. Atualizar automaticamente o .env.local com os price IDs gerados
 *
 * Como usar:
 *   npm install   (se ainda não fez)
 *   node scripts/setup.js
 */

const fs   = require('fs');
const path = require('path');

// ── Carrega .env.local ────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local não encontrado. Copie .env.example e preencha.');
  process.exit(1);
}

const envRaw = fs.readFileSync(envPath, 'utf8');
const env    = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const [k, ...v] = l.split('='); return [k?.trim(), v.join('=').trim()]; })
    .filter(([k]) => k)
);

const STRIPE_KEY     = env.STRIPE_SECRET_KEY;
const SUPABASE_URL   = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY    = env.SUPABASE_SERVICE_ROLE_KEY;
const PROD_BASIC     = env.STRIPE_PRICE_BASIC;   // pode ser prod_* ou price_*
const PROD_PRO       = env.STRIPE_PRICE_PRO;

if (!STRIPE_KEY || STRIPE_KEY.includes('placeholder')) {
  console.error('❌ STRIPE_SECRET_KEY não configurada no .env.local');
  process.exit(1);
}
if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL não configurada no .env.local');
  process.exit(1);
}

// ── Stripe ────────────────────────────────────────────────────────────────────
async function stripeSetup() {
  const Stripe = require('stripe');
  const stripe = Stripe(STRIPE_KEY);

  console.log('\n🔵 Configurando Stripe...');

  async function getPriceId(productId, name, unitAmount) {
    // Se já é um price_* retorna diretamente
    if (productId?.startsWith('price_')) {
      console.log(`  ✓ ${name}: price ID já configurado (${productId})`);
      return productId;
    }

    // Verifica se produto existe
    let prodId = productId;
    if (!prodId || prodId.includes('placeholder')) {
      const prod = await stripe.products.create({ name, description: `Precy+ Plano ${name}` });
      prodId = prod.id;
      console.log(`  ✓ Produto criado: ${prodId}`);
    }

    // Cria preço recorrente mensal em BRL
    const price = await stripe.prices.create({
      product:    prodId,
      unit_amount: name === 'Basic' ? 1700 : 3700, // R$17 ou R$37 em centavos
      currency:   'brl',
      recurring:  { interval: 'month' },
      nickname:   `Precy+ ${name} Mensal`,
    });
    console.log(`  ✓ Preço criado para ${name}: ${price.id} (R$ ${price.unit_amount/100})`);
    return price.id;
  }

  const priceBasic = await getPriceId(PROD_BASIC, 'Basic', 1700);
  const pricePro   = await getPriceId(PROD_PRO,   'Pro',   3700);

  // Cria portal de billing (necessário para o portal de assinatura funcionar)
  try {
    await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Precy+ — Gerencie sua assinatura',
      },
      features: {
        subscription_cancel:  { enabled: true, mode: 'at_period_end', cancellation_reason: { enabled: true, options: ['too_expensive','missing_features','switched_service','unused','other'] } },
        subscription_update:  { enabled: true, default_allowed_updates: ['price'], proration_behavior: 'create_prorations', products: [{ product: PROD_BASIC?.startsWith('prod_') ? PROD_BASIC : priceBasic, prices: [priceBasic] }, { product: PROD_PRO?.startsWith('prod_') ? PROD_PRO : pricePro, prices: [pricePro] }] },
        invoice_history:      { enabled: true },
        payment_method_update:{ enabled: true },
      },
    });
    console.log('  ✓ Portal de billing configurado');
  } catch (e) {
    // Portal pode já existir
    console.log(`  ℹ️  Portal de billing: ${e.message}`);
  }

  return { priceBasic, pricePro };
}

// ── Supabase ──────────────────────────────────────────────────────────────────
async function supabaseSetup() {
  console.log('\n🟢 Executando schema no Supabase...');
  const { createClient } = require('@supabase/supabase-js');
  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  const schema = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'schema.sql'), 'utf8');

  // Divide em statements individuais e executa
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10 && !s.startsWith('--'));

  let ok = 0, skip = 0;
  for (const stmt of statements) {
    try {
      const { error } = await db.rpc('exec_sql', { sql: stmt + ';' });
      if (error) {
        // IF NOT EXISTS errors são esperados na re-execução
        if (error.message?.includes('already exists') || error.message?.includes('does not exist')) {
          skip++;
        } else {
          console.warn(`  ⚠️  ${error.message?.substring(0,80)}`);
        }
      } else {
        ok++;
      }
    } catch {}
  }
  console.log(`  ✓ Schema executado: ${ok} ok, ${skip} já existiam`);
}

// ── Atualiza .env.local ───────────────────────────────────────────────────────
function updateEnv(priceBasic, pricePro) {
  let content = fs.readFileSync(envPath, 'utf8');
  content = content
    .replace(/STRIPE_PRICE_BASIC=.*/,  `STRIPE_PRICE_BASIC=${priceBasic}`)
    .replace(/STRIPE_PRICE_PRO=.*/,    `STRIPE_PRICE_PRO=${pricePro}`);
  fs.writeFileSync(envPath, content);
  console.log('\n✅ .env.local atualizado com os price IDs');
}

// ── Webhook instructions ──────────────────────────────────────────────────────
function printWebhookInstructions() {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 PRÓXIMO PASSO — Configurar webhook do Stripe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para desenvolvimento local:
  1. Instale a Stripe CLI: https://stripe.com/docs/stripe-cli
  2. Faça login: stripe login
  3. Rode em outro terminal:
     stripe listen --forward-to localhost:3000/api/stripe/webhook
  4. Copie o "whsec_..." gerado e adicione no .env.local:
     STRIPE_WEBHOOK_SECRET=whsec_...

Para produção (Vercel):
  1. Acesse dashboard.stripe.com/webhooks
  2. Adicione endpoint: https://seudominio.com/api/stripe/webhook
  3. Selecione os eventos:
     • checkout.session.completed
     • customer.subscription.created
     • customer.subscription.updated
     • customer.subscription.deleted
     • invoice.payment_failed
  4. Copie o signing secret e adicione nas env vars da Vercel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Para rodar o projeto:
   npm run dev  →  http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎀 Precy+ Setup\n');

  try {
    const { priceBasic, pricePro } = await stripeSetup();
    updateEnv(priceBasic, pricePro);
  } catch (e) {
    console.error('❌ Erro no Stripe:', e.message);
    console.log('   Verifique sua STRIPE_SECRET_KEY no .env.local\n');
  }

  try {
    await supabaseSetup();
  } catch (e) {
    console.error('❌ Erro no Supabase:', e.message);
    console.log('   Execute o schema.sql manualmente no SQL Editor do Supabase\n');
    console.log('   https://supabase.com/dashboard/project/kvognxmzwqfmdmmibskh/sql\n');
  }

  printWebhookInstructions();
}

main();
