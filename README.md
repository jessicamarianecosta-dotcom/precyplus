# Precy+ 💗

> Sistema de precificação inteligente para pequenos empreendedores, artesãos e criadores.

**"Precifique com confiança."**

---

## ✨ Funcionalidades

### Plano Basic (R$ 17/mês)
- 🧮 **Precificação inteligente** — cálculo automático com custos reais
- 📦 **Materiais & Estoque** — controle automático com alertas de nível baixo
- 🛍️ **Produtos** — vincule materiais e calcule custos de produção
- 📊 **Dashboard** — visão geral do negócio com gráficos bonitos
- 🖨️ **PDF** — exporte suas precificações com a marca da sua empresa

### Plano Pro (R$ 37/mês)
Tudo do Basic, mais:
- 💰 **Financeiro** — entradas, saídas e fluxo de caixa
- 👥 **Clientes** — cadastro e gestão de relacionamento
- 📋 **Orçamentos** — crie e envie orçamentos profissionais

---

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuito)

### 1. Clone e instale

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/precyplus.git
cd precyplus

# Instale as dependências
npm install
```

### 2. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e cole todo o conteúdo de `supabase/schema.sql`
3. Execute o SQL para criar todas as tabelas
4. Em **Settings → API**, copie a **URL** e a **anon key**

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 4. Execute

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Estrutura do Projeto

```
precyplus/
├── app/
│   ├── (auth)/             # Login, Cadastro, Recuperação de senha
│   ├── dashboard/          # Todas as páginas do sistema
│   │   ├── page.tsx        # Dashboard principal
│   │   ├── materiais/      # Gestão de materiais e estoque
│   │   ├── produtos/       # Cadastro de produtos
│   │   ├── precificacao/   # Motor de precificação
│   │   ├── financeiro/     # Módulo financeiro (PRO)
│   │   ├── clientes/       # Gestão de clientes (PRO)
│   │   ├── orcamentos/     # Orçamentos (PRO)
│   │   └── configuracoes/  # Configurações da conta
│   ├── layout.tsx
│   ├── page.tsx            # Landing page
│   └── globals.css
├── components/
│   ├── layout/             # Sidebar, Header
│   └── ui/                 # Componentes reutilizáveis
├── lib/
│   ├── supabase/           # Cliente Supabase (browser + server)
│   └── utils.ts            # Helpers e formatadores
├── types/                  # TypeScript types
├── middleware.ts            # Proteção de rotas
├── supabase/
│   └── schema.sql          # Schema completo do banco de dados
└── public/
    └── logo.png
```

---

## 🗄️ Banco de Dados

Tabelas criadas pelo `schema.sql`:

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil do usuário (auto-criado no cadastro) |
| `companies` | Dados da empresa |
| `user_settings` | Configurações financeiras do usuário |
| `fixed_costs` | Custos fixos mensais |
| `materials` | Materiais com custo unitário automático |
| `stock_movements` | Histórico de entradas/saídas do estoque |
| `products` | Produtos com materiais vinculados |
| `product_materials` | Relação produto ↔ material |
| `pricings` | Precificações salvas |
| `clients` | Cadastro de clientes |
| `budgets` | Orçamentos (itens em JSONB) |
| `financial_entries` | Lançamentos financeiros |

Todas as tabelas têm **Row Level Security (RLS)** ativo — cada usuário só acessa seus próprios dados.

---

## ☁️ Deploy na Vercel

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça o deploy
vercel

# Configure as variáveis de ambiente no painel da Vercel:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Ou conecte seu repositório GitHub diretamente em [vercel.com](https://vercel.com).

---

## 🎨 Stack

| Tech | Uso |
|------|-----|
| Next.js 15 | Framework React |
| TypeScript | Tipagem |
| Tailwind CSS | Estilização |
| Supabase | Backend + Auth + DB |
| Recharts | Gráficos |
| Sonner | Toast notifications |
| jsPDF | Exportação PDF |
| Lucide React | Ícones |

---

## 📧 Suporte

suporte@precyplus.com

---

Feito com 💗 para empreendedoras brasileiras.
