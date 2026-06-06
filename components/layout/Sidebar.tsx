'use client';

import Link from 'next/link';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import { useState } from 'react';

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
  Menu,
  X,
} from 'lucide-react';

import {
  useTheme,
} from '@/lib/theme-provider';

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

  const pathname =
    usePathname();

  const router =
    useRouter();

  const theme =
    useTheme();

  const [isOpen, setIsOpen] =
    useState(false);

  const isPro = true;

  function handleProClick(
    item: MenuItem
  ) {

    if (isPro) {

      router.push(
        item.href
      );

      setIsOpen(false);

      return;
    }

    router.push(
      '/assinatura'
    );
  }

  return (

    <>

      {/* MOBILE BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          md:hidden
          fixed
          top-4
          left-4
          z-50
          bg-white
          border
          border-pink-200
          shadow-lg
          rounded-xl
          p-3
        "
      >
        <Menu size={24} />
      </button>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:relative
          z-50
          top-0 left-0
          h-screen
          bg-white
          border-r border-[#F6DCE7]
          flex flex-col
          transition-all duration-300

          w-[280px] md:w-[315px]

          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'
          }
        `}
      >

        {/* HEADER */}
        <div className="h-24 px-6 flex items-center justify-between border-b border-[#F6DCE7]">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-full border-2 border-pink-300 flex items-center justify-center bg-white overflow-hidden">

              {theme?.logo ? (

                <img
                  src={theme.logo}
                  alt="Logo"
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

              ) : (

                <span
                  className="text-sm font-black"
                  style={{
                    color:
                      'var(--secondary-color)',
                  }}
                >
                  P+
                </span>

              )}

            </div>

            <h1
              className="text-[22px] font-black"
              style={{
                color:
                  'var(--secondary-color)',
              }}
            >

              Precy

              <span
                style={{
                  color:
                    'var(--primary-color)',
                }}
              >
                +
              </span>

            </h1>

          </div>

          {/* CLOSE BUTTON */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden"
          >
            <X size={28} />
          </button>

        </div>

        {/* MENU */}
        <div className="flex-1 px-5 py-7 overflow-y-auto">

          <nav className="space-y-2">

            {menu.map((item) => {

              const Icon =
                item.icon;

              const active =
                pathname === item.href;

              if (
                item.pro &&
                !isPro
              ) {

                return (

                  <button
                    key={item.label}
                    onClick={() =>
                      handleProClick(item)
                    }
                    className="
                      w-full
                      flex
                      items-center
                      justify-between
                      h-14
                      px-4
                      rounded-2xl
                      hover:bg-pink-50
                      transition-all
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

              return (

                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex
                    items-center
                    justify-between
                    h-14
                    px-4
                    rounded-2xl
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
                      style={{
                        color:
                          active
                            ? 'var(--primary-color)'
                            : '#9CA3AF',
                      }}
                    />

                    <span
                      className="
                        text-[16px]
                        font-bold
                      "
                      style={{
                        color:
                          active
                            ? 'var(--primary-color)'
                            : '#364152',
                      }}
                    >
                      {item.label}
                    </span>

                  </div>

                  {item.pro && (

                    <div
                      className="
                        px-2
                        py-1
                        rounded-lg
                        bg-emerald-100
                        text-emerald-700
                        text-xs
                        font-black
                      "
                    >
                      PRO
                    </div>

                  )}

                </Link>
              );
            })}

          </nav>

        </div>

        {/* FOOTER */}
        <div className="border-t border-[#F6DCE7] p-5 space-y-2">

          <Link
            href="/dashboard/configuracoes"
            onClick={() => setIsOpen(false)}
            className={`
              h-14
              px-4
              rounded-2xl
              flex
              items-center
              gap-4
              font-bold
              transition-all
              ${
                pathname ===
                '/dashboard/configuracoes'
                  ? 'text-white'
                  : 'text-[#364152] hover:bg-pink-50'
              }
            `}
            style={
              pathname ===
              '/dashboard/configuracoes'
                ? {
                    background:
                      'linear-gradient(135deg, #FF4FA3, #FF8DC7)',
                  }
                : {}
            }
          >

            <Settings size={20} />

            Configurações

          </Link>

          <button
            className="
              h-14
              px-4
              rounded-2xl
              flex
              items-center
              gap-4
              text-gray-500
              hover:bg-gray-50
              font-bold
              w-full
            "
          >

            <LogOut size={20} />

            Sair

          </button>

        </div>

      </aside>

      {/* OVERLAY */}
      {isOpen && (

        <div
          onClick={() => setIsOpen(false)}
          className="
            fixed
            inset-0
            bg-black/40
            z-40
            md:hidden
          "
        />

      )}

    </>

  );
}