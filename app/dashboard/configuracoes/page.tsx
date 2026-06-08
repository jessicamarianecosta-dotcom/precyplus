'use client';

import { useEffect, useMemo, useState } from 'react';

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

import { createClient } from '@/lib/supabase/client';
import { applyTheme } from '@/lib/theme-provider';
import { usePlan } from '@/hooks/usePlan';

const STATES = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO',
  'MA','MG','MS','MT','PA','PB','PE','PI','PR',
  'RJ','RN','RO','RR','RS','SC','SE','SP','TO'
];

const PLAN_LABELS: Record<string, string> = {
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

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [empresa, setEmpresa] =
    useState({
      name: '',
      owner: '',
      whatsapp: '',
      instagram: '',
      city: '',
      state: 'PR',
      logo_url: '',
      primary_color: '#FF4FA3',
      secondary_color: '#1A1F5E',
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

    try {
      const theme = {
        primary: empresa.primary_color,
        secondary: empresa.secondary_color,
        logo: empresa.logo_url,
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'precy_theme',
          JSON.stringify(theme)
        );
        applyTheme(theme);
      }

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        toast.error('Erro ao obter usuário.');
        return;
      }

      const user = authData?.user;

      if (!user) {
        toast.error('Usuário não autenticado.');
        return;
      }

      const companyPayload = {
        user_id: user.id,
        name: empresa.name,
        owner_name: empresa.owner,
        whatsapp: empresa.whatsapp,
        instagram: empresa.instagram,
        city: empresa.city,
        state: empresa.state,
        logo_url: empresa.logo_url,
      };

      const {
        error: companyError,
      } = await supabase
        .from('companies')
        .upsert(companyPayload, {
          onConflict: 'user_id',
        });

      if (companyError) {
        toast.error('Não foi possível salvar os dados da empresa.');
        return;
      }

      const settingsPayload = {
        user_id: user.id,
        work_hours_day: financeiro.work_hours_day,
        work_days_month: financeiro.work_days_month,
        profit_goal: financeiro.profit_goal,
        default_margin: financeiro.default_margin,
        default_commission: financeiro.default_commission,
        default_waste: financeiro.default_waste,
        hourly_rate: financeiro.hourly_rate,
      };

      const {
        error: settingsError,
      } = await supabase
        .from('user_settings')
        .upsert(settingsPayload, {
          onConflict: 'user_id',
        });

      if (settingsError) {
        toast.error('Não foi possível salvar as configurações financeiras.');
        return;
      }

      toast.success('Configurações salvas! ✅');
    } catch (error) {
      toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);

    try {
      await openPortal();
    } catch (error) {
      toast.error('Erro ao abrir o portal de assinaturas.');
    } finally {
      setPortalLoading(false);
    }
  }

  useEffect(() => {
    async function loadSettings() {
      try {
        const {
          data: authData,
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          toast.error('Erro ao carregar o usuário.');
          return;
        }

        const user = authData?.user;

        if (!user) {
          return;
        }

        const {
          data: company,
          error: companyError,
        } = await supabase
          .from('companies')
          .select(
            'name, owner_name, whatsapp, instagram, city, state, logo_url'
          )
          .eq('user_id', user.id)
          .maybeSingle();

        if (companyError) {
          toast.error('Não foi possível carregar os dados da empresa.');
        } else if (company) {
          setEmpresa((f) => ({
            ...f,
            name: company.name || '',
            owner: company.owner_name || '',
            whatsapp: company.whatsapp || '',
            instagram: company.instagram || '',
            city: company.city || '',
            state: company.state || 'PR',
            logo_url: company.logo_url || '',
          }));
        }

        const {
          data: settings,
          error: settingsError,
        } = await supabase
          .from('user_settings')
          .select(
            'work_hours_day, work_days_month, profit_goal, default_margin, default_commission, default_waste, hourly_rate'
          )
          .eq('user_id', user.id)
          .maybeSingle();

        if (settingsError) {
          toast.error('Não foi possível carregar as configurações financeiras.');
        } else if (settings) {
          setFinanceiro({
            work_hours_day:
              Number(settings.work_hours_day) || 8,
            work_days_month:
              Number(settings.work_days_month) || 22,
            profit_goal:
              Number(settings.profit_goal) || 40,
            default_margin:
              Number(settings.default_margin) || 40,
            default_commission:
              Number(settings.default_commission) || 5,
            default_waste:
              Number(settings.default_waste) || 5,
            hourly_rate:
              Number(settings.hourly_rate) || 15,
          });
        }
      } catch (error) {
        toast.error('Erro ao carregar configurações.');
      }
    }

    loadSettings();
  }, [supabase]);

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
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
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
        ))}
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
                  name: e.target.value,
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
                  owner: e.target.value,
                }))
              }
              placeholder="Seu nome completo"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="WhatsApp"
                value={empresa.whatsapp}
                onChange={(e) =>
                  setEmpresa((f) => ({
                    ...f,
                    whatsapp: e.target.value,
                  }))
                }
                placeholder="41 99999-0000"
              />

              <Input
                label="Instagram"
                value={empresa.instagram}
                onChange={(e) =>
                  setEmpresa((f) => ({
                    ...f,
                    instagram: e.target.value,
                  }))
                }
                placeholder="@seuatelie"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cidade"
                value={empresa.city}
                onChange={(e) =>
                  setEmpresa((f) => ({
                    ...f,
                    city: e.target.value,
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
                    state: e.target.value,
                  }))
                }
                options={STATES.map((s) => ({
                  value: s,
                  label: s,
                }))}
              />
            </div>
          </div>

          <div className="mt-10 border-t pt-8">
            <h2 className="text-2xl font-black text-[#1A1F5E] mb-6">
              Personalização PRO
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-bold text-[#1A1F5E] mb-2">
                Logo da empresa
              </label>

              <input
                type="file"
                accept="image/*"
                className="
                  w-full
                  border
                  border-pink-100
                  rounded-2xl
                  p-4
                  bg-white
                "
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-[#1A1F5E] mb-2">
                  Cor principal
                </label>

                <input
                  type="color"
                  value={empresa.primary_color}
                  onChange={(e) =>
                    setEmpresa((f) => ({
                      ...f,
                      primary_color: e.target.value,
                    }))
                  }
                  className="
                    w-full
                    h-14
                    border
                    border-pink-100
                    rounded-2xl
                    bg-white
                    cursor-pointer
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1F5E] mb-2">
                  Cor secundária
                </label>

                <input
                  type="color"
                  value={empresa.secondary_color}
                  onChange={(e) =>
                    setEmpresa((f) => ({
                      ...f,
                      secondary_color: e.target.value,
                    }))
                  }
                  className="
                    w-full
                    h-14
                    border
                    border-pink-100
                    rounded-2xl
                    bg-white
                    cursor-pointer
                  "
                />
              </div>
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-4xl">
          <h2 className="font-black text-gray-800 mb-5">
            Configurações financeiras
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Horas trabalhadas por dia"
              type="number"
              value={String(financeiro.work_hours_day)}
              onChange={(e) =>
                setFinanceiro((f) => ({
                  ...f,
                  work_hours_day: Number(e.target.value),
                }))
              }
            />

            <Input
              label="Dias trabalhados por mês"
              type="number"
              value={String(financeiro.work_days_month)}
              onChange={(e) =>
                setFinanceiro((f) => ({
                  ...f,
                  work_days_month: Number(e.target.value),
                }))
              }
            />

            <Input
              label="Meta de lucro (%)"
              type="number"
              value={String(financeiro.profit_goal)}
              onChange={(e) =>
                setFinanceiro((f) => ({
                  ...f,
                  profit_goal: Number(e.target.value),
                }))
              }
            />

            <Input
              label="Margem padrão (%)"
              type="number"
              value={String(financeiro.default_margin)}
              onChange={(e) =>
                setFinanceiro((f) => ({
                  ...f,
                  default_margin: Number(e.target.value),
                }))
              }
            />

            <Input
              label="Comissão padrão (%)"
              type="number"
              value={String(financeiro.default_commission)}
              onChange={(e) =>
                setFinanceiro((f) => ({
                  ...f,
                  default_commission: Number(e.target.value),
                }))
              }
            />

            <Input
              label="Desperdício padrão (%)"
              type="number"
              value={String(financeiro.default_waste)}
              onChange={(e) =>
                setFinanceiro((f) => ({
                  ...f,
                  default_waste: Number(e.target.value),
                }))
              }
            />
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
          <h2 className="font-black text-gray-800 mb-5">
            Conta & Plano
          </h2>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-pink-50 border border-pink-100">
              <p className="text-sm text-gray-500 font-semibold mb-1">
                Seu plano atual
              </p>
              <h3 className="text-2xl font-black text-[#1A1F5E]">
                {PLAN_LABELS[plan]}
              </h3>
            </div>

            <Button
              icon={portalLoading ? Loader2 : ExternalLink}
              onClick={handlePortal}
              loading={portalLoading}
            >
              Gerenciar assinatura
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
