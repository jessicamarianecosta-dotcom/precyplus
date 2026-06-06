'use client';

import { useState } from 'react';
import {
  Save,
  Building2,
  Settings2,
  Shield,
  ExternalLink,
  Loader2,
} from 'lucide-react';

import { toast } from 'sonner';

import {
  PageHeader,
  Button,
  Input,
  Select,
} from '@/components/ui';

import { usePlan } from '@/hooks/usePlan';

const STATES = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO',
  'MA','MG','MS','MT','PA','PB','PE','PI','PR',
  'RJ','RN','RO','RR','RS','SC','SE','SP','TO'
];

const PLAN_LABELS: Record<
  string,
  string
> = {
  basic: 'Basic — R$ 17/mês',
  pro: 'Pro — R$ 37/mês',
  free: 'Gratuito',
};

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] =
    useState('empresa');

  const [saving, setSaving] =
    useState(false);

  const [portalLoading, setPortalLoading] =
    useState(false);

  const {
    plan,
    loading: planLoading,
    openPortal,
  } = usePlan();

  const [empresa, setEmpresa] =
    useState({
      name: '',
      owner: '',
      whatsapp: '',
      instagram: '',
      city: '',
      state: 'PR',
    });

  const [financeiro, setFinanceiro] =
    useState({
      work_hours_day: 8,
      work_days_month: 22,
      profit_goal: 40,
      default_margin: 40,
      default_commission: 5,
      default_waste: 5,
      hourly_rate: 15,
    });

  async function handleSave() {
    setSaving(true);

    await new Promise((r) =>
      setTimeout(r, 500)
    );

    toast.success(
      'Configurações salvas! ✅'
    );

    setSaving(false);
  }

  async function handlePortal() {
    setPortalLoading(true);

    await openPortal();

    setPortalLoading(false);
  }

  const tabs = [
    {
      id: 'empresa',
      icon: Building2,
      label: 'Empresa',
    },
    {
      id: 'financeiro',
      icon: Settings2,
      label: 'Financeiro',
    },
    {
      id: 'conta',
      icon: Shield,
      label: 'Conta & Plano',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Personalize o sistema de acordo com o seu negócio."
      />

      <div className="flex gap-1 mb-8 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
        {tabs.map(
          ({
            id,
            icon: Icon,
            label,
          }) => (
            <button
              key={id}
              onClick={() =>
                setActiveTab(id)
              }
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === id
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={
                activeTab === id
                  ? {
                      background:
                        'linear-gradient(135deg, #FF6BAD, #FF8DC7)',
                    }
                  : {}
              }
            >
              <Icon size={15} />
              {label}
            </button>
          )
        )}
      </div>

      {activeTab === 'empresa' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
          <h2 className="font-black text-gray-800 mb-5">
            Dados da empresa
          </h2>

          <div className="space-y-4">
            <Input
              label="Nome da empresa"
              value={empresa.name}
              onChange={(e) =>
                setEmpresa((f) => ({
                  ...f,
                  name:
                    e.target.value,
                }))
              }
              placeholder="Ex: Ateliê da Ana"
            />

            <Input
              label="Nome do responsável"
              value={empresa.owner}
              onChange={(e) =>
                setEmpresa((f) => ({
                  ...f,
                  owner:
                    e.target.value,
                }))
              }
              placeholder="Seu nome completo"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="WhatsApp"
                value={
                  empresa.whatsapp
                }
                onChange={(e) =>
                  setEmpresa((f) => ({
                    ...f,
                    whatsapp:
                      e.target.value,
                  }))
                }
                placeholder="41 99999-0000"
              />

              <Input
                label="Instagram"
                value={
                  empresa.instagram
                }
                onChange={(e) =>
                  setEmpresa((f) => ({
                    ...f,
                    instagram:
                      e.target.value,
                  }))
                }
                placeholder="@seuatelie"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cidade"
                value={empresa.city}
                onChange={(e) =>
                  setEmpresa((f) => ({
                    ...f,
                    city:
                      e.target.value,
                  }))
                }
                placeholder="Ex: Curitiba"
              />

              <Select
                label="Estado"
                value={empresa.state}
                onChange={(e) =>
                  setEmpresa((f) => ({
                    ...f,
                    state:
                      e.target.value,
                  }))
                }
                options={STATES.map(
                  (s) => ({
                    value: s,
                    label: s,
                  })
                )}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              icon={Save}
              onClick={handleSave}
              loading={saving}
            >
              Salvar dados da empresa
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'financeiro' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
          <h2 className="font-black text-gray-800 mb-2">
            Configurações financeiras
          </h2>

          <p className="text-sm text-gray-500 font-semibold mb-5">
            Usados automaticamente no cálculo de precificação.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Horas trabalhadas/dia"
                type="number"
                value={
                  financeiro.work_hours_day
                }
                onChange={(e) =>
                  setFinanceiro((f) => ({
                    ...f,
                    work_hours_day:
                      Number(
                        e.target.value
                      ),
                  }))
                }
              />

              <Input
                label="Dias trabalhados/mês"
                type="number"
                value={
                  financeiro.work_days_month
                }
                onChange={(e) =>
                  setFinanceiro((f) => ({
                    ...f,
                    work_days_month:
                      Number(
                        e.target.value
                      ),
                  }))
                }
              />
            </div>

            <Input
              label="Valor da sua hora (R$)"
              type="number"
              step="0.01"
              value={
                financeiro.hourly_rate
              }
              onChange={(e) =>
                setFinanceiro((f) => ({
                  ...f,
                  hourly_rate:
                    Number(
                      e.target.value
                    ),
                }))
              }
              prefix="R$"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Meta de lucro (%)"
                type="number"
                value={
                  financeiro.profit_goal
                }
                onChange={(e) =>
                  setFinanceiro((f) => ({
                    ...f,
                    profit_goal:
                      Number(
                        e.target.value
                      ),
                  }))
                }
              />

              <Input
                label="Margem padrão (%)"
                type="number"
                value={
                  financeiro.default_margin
                }
                onChange={(e) =>
                  setFinanceiro((f) => ({
                    ...f,
                    default_margin:
                      Number(
                        e.target.value
                      ),
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Comissão padrão (%)"
                type="number"
                value={
                  financeiro.default_commission
                }
                onChange={(e) =>
                  setFinanceiro((f) => ({
                    ...f,
                    default_commission:
                      Number(
                        e.target.value
                      ),
                  }))
                }
              />

              <Input
                label="Desperdício padrão (%)"
                type="number"
                value={
                  financeiro.default_waste
                }
                onChange={(e) =>
                  setFinanceiro((f) => ({
                    ...f,
                    default_waste:
                      Number(
                        e.target.value
                      ),
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              icon={Save}
              onClick={handleSave}
              loading={saving}
            >
              Salvar configurações
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'conta' && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-gray-800 mb-4">
              Plano atual
            </h2>

            {planLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Carregando...
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p
                    className="font-black text-lg"
                    style={{
                      color:
                        '#1A1F5E',
                    }}
                  >
                    {PLAN_LABELS[
                      plan
                    ] ?? plan}
                  </p>

                  <p className="text-sm text-gray-500 font-semibold mt-0.5">
                    {plan === 'pro'
                      ? 'Acesso completo a todos os recursos'
                      : 'Recursos essenciais de precificação'}
                  </p>
                </div>

                <div className="flex gap-2">
                  {plan !==
                    'pro' && (
                    <button
                      onClick={() => {
                        window.location.href =
                          '/assinatura';
                      }}
                      className="flex items-center gap-1 font-bold text-white text-sm px-4 py-2.5 rounded-xl"
                      style={{
                        background:
                          'linear-gradient(135deg,#FF6BAD,#FF8DC7)',
                      }}
                    >
                      Fazer upgrade ✨
                    </button>
                  )}

                  {plan !==
                    'free' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={
                        ExternalLink
                      }
                      onClick={
                        handlePortal
                      }
                      loading={
                        portalLoading
                      }
                    >
                      Gerenciar assinatura
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-gray-800 mb-5">
              Alterar senha
            </h2>

            <div className="space-y-4">
              <Input
                label="Senha atual"
                type="password"
                placeholder="••••••••"
              />

              <Input
                label="Nova senha"
                type="password"
                placeholder="••••••••"
              />

              <Input
                label="Confirmar nova senha"
                type="password"
                placeholder="••••••••"
              />
            </div>

            <div className="mt-5">
              <Button
                icon={Save}
                onClick={() =>
                  toast.success(
                    'Senha alterada!'
                  )
                }
              >
                Alterar senha
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
            <h2 className="font-black text-red-600 mb-2">
              Zona de perigo
            </h2>

            <p className="text-sm text-gray-500 font-semibold mb-4">
              Ações irreversíveis.
            </p>

            <Button
              variant="danger"
              onClick={() =>
                toast.error(
                  'Entre em contato com suporte@precyplus.com para excluir sua conta.'
                )
              }
            >
              Excluir minha conta
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}