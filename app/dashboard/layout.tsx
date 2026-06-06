'use client';

import Sidebar from '@/components/layout/Sidebar';

import { MaterialsProvider } from '@/lib/materials-store';

import {
  ThemeProvider,
} from '@/lib/theme-provider';

import { usePathname } from 'next/navigation';

const TITLES: Record<string, string> = {

  '/dashboard':
    'Dashboard',

  '/dashboard/materiais':
    'Materiais',

  '/dashboard/produtos':
    'Produtos',

  '/dashboard/precificacao':
    'Precificação',

  '/dashboard/custos-fixos':
    'Custos Fixos',

  '/dashboard/financeiro':
    'Financeiro',

  '/dashboard/clientes':
    'Clientes',

  '/dashboard/orcamentos':
    'Orçamentos',

  '/dashboard/configuracoes':
    'Configurações',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname =
    usePathname();

  const title =
    TITLES[pathname] ??
    'Precy+';

  return (

    <ThemeProvider>

      <MaterialsProvider>

        <div className="min-h-screen flex bg-[#FFF9FB] overflow-x-hidden">

          {/* SIDEBAR */}
          <Sidebar />

          {/* CONTEÚDO */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">

            {/* MOBILE HEADER */}
            <div
              className="
                md:hidden
                fixed
                top-0
                left-0
                right-0
                z-30
                h-20
                bg-[#FFF9FB]/95
                backdrop-blur
                border-b
                border-pink-100
                flex
                items-center
                justify-center
                px-6
              "
            >

              <h1
                className="text-2xl font-black"
                style={{
                  color:
                    'var(--secondary-color)',
                }}
              >
                {title}
              </h1>

            </div>

            {/* PAGE */}
            <div
              className="
                max-w-7xl
                mx-auto
                p-3
                md:p-8
                overflow-x-hidden
                pt-24
                md:pt-8
              "
            >
              {children}
            </div>

          </main>

        </div>

      </MaterialsProvider>

    </ThemeProvider>
  );
}