'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  LayoutDashboard,
  Boxes,
  Package,
  Calculator,
  TrendingUp,
  Users,
  FileText,
  Settings,
  LogOut,
  Receipt,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

type MenuItem = {
  label: string;
  href: string;
  icon: any;
  pro?: boolean;
};

const menu: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Materiais',
    href: '/dashboard/materiais',
    icon: Boxes,
  },
  {
    label: 'Produtos',
    href: '/dashboard/produtos',
    icon: Package,
  },
  {
    label: 'Precificação',
    href: '/dashboard/precificacao',
    icon: Calculator,
  },
  {
    label: 'Custos Fixos',
    href: '/dashboard/custos-fixos',
    icon: Receipt,
  },

  // PRO
  {
    label: 'Financeiro',
    href: '/dashboard/financeiro',
    icon: TrendingUp,
    pro: true,
  },
  {
    label: 'Clientes',
    href: '/dashboard/clientes',
    icon: Users,
    pro: true,
  },
  {
    label: 'Orçamentos',
    href: '/dashboard/orcamentos',
    icon: FileText,
    pro: true,
  },
];

export default function Sidebar() {

  const pathname = usePathname();

  const router = useRouter();

  const supabase = createClient();

  const [userEmail, setUserEmail] =
    useState('');

  useEffect(() => {

    supabase.auth
      .getUser()
      .then(({ data }) => {

        setUserEmail(
          data.user?.email || ''
        );
      });

  }, []);

  // 🔥 SOMENTE SEU EMAIL É PRO
  const isPro =
    userEmail ===
    'jessicamarianecosta@gmail.com';

  function handleProClick() {
    router.push('/assinatura');
  }

  return (
    <aside className="w-[315px] min-h-screen bg-white border-r border-[#F6DCE7] flex flex-col">

      {/* HEADER */}
      <div className="h-24 px-6 flex items-center border-b border-[#F6DCE7]">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-full border-2 border-pink-300 flex items-center justify-center bg-white">

            <span className="text-sm font-black text-[#1A1F5E]">
              P+
            </span>

          </div>

          <h1 className="text-[22px] font-black text-[#1A1F5E]">
            Precy
            <span className="text-pink-500">
              +
            </span>
          </h1>

        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 px-5 py-7">

        <nav className="space-y-2">

          {menu.map((item) => {

            const Icon = item.icon;

            const active =
              pathname === item.href;

            // 🔥 PRO
            if (item.pro) {

              // USUÁRIO PRO
              if (isPro) {

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`
                      flex items-center justify-between
                      h-14 px-4 rounded-2xl
                      transition-all
                      ${
                        active
                          ? 'bg-pink-50'
                          : 'hover:bg-gray-50'
                      }
                    `}
                  >

                    <div className="flex items-center gap-4">

                      <Icon
                        size={21}
                        className={
                          active
                            ? 'text-pink-500'
                            : 'text-gray-400'
                        }
                      />

                      <span
                        className={`text-[16px] font-bold ${
                          active
                            ? 'text-pink-500'
                            : 'text-[#364152]'
                        }`}
                      >
                        {item.label}
                      </span>

                    </div>

                    <div className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                      PRO
                    </div>

                  </Link>
                );
              }

              // USUÁRIO BASIC
              return (
                <button
                  key={item.label}
                  onClick={handleProClick}
                  className="
                    w-full flex items-center justify-between
                    h-14 px-4 rounded-2xl
                    hover:bg-pink-50 transition-all
                  "
                >

                  <div className="flex items-center gap-4">

                    <Icon
                      size={21}
                      className="text-gray-400"
                    />

                    <span className="text-[16px] font-bold text-[#364152]">
                      {item.label}
                    </span>

                  </div>

                  <div className="px-2 py-1 rounded-lg bg-[#FFE7A3] text-[#B66A00] text-xs font-black">
                    PRO
                  </div>

                </button>
              );
            }

            // NORMAL
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  flex items-center justify-between
                  h-14 px-4 rounded-2xl
                  transition-all
                  ${
                    active
                      ? 'bg-pink-50'
                      : 'hover:bg-gray-50'
                  }
                `}
              >

                <div className="flex items-center gap-4">

                  <Icon
                    size={21}
                    className={
                      active
                        ? 'text-pink-500'
                        : 'text-gray-400'
                    }
                  />

                  <span
                    className={`text-[16px] font-bold ${
                      active
                        ? 'text-pink-500'
                        : 'text-[#364152]'
                    }`}
                  >
                    {item.label}
                  </span>

                </div>
              </Link>
            );
          })}

        </nav>
      </div>

      {/* FOOTER */}
      <div className="border-t border-[#F6DCE7] p-5 space-y-2">

        <Link
          href="/dashboard/configuracoes"
          className="h-14 px-4 rounded-2xl flex items-center gap-4 bg-pink-500 text-white font-bold"
        >

          <Settings size={20} />

          Configurações

        </Link>

        <button className="h-14 px-4 rounded-2xl flex items-center gap-4 text-gray-500 hover:bg-gray-50 font-bold w-full">

          <LogOut size={20} />

          Sair

        </button>

      </div>
    </aside>
  );
}