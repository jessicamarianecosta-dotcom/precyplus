'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Calculator,
  TrendingUp,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  DollarSign
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const NAV = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/dashboard/materiais',
    icon: Package,
    label: 'Materiais',
  },
  {
    href: '/dashboard/produtos',
    icon: ShoppingBag,
    label: 'Produtos',
  },
  {
    href: '/dashboard/precificacao',
    icon: Calculator,
    label: 'Precificação',
  },

  // 👇 NOVO MÓDULO ADICIONADO AQUI
  {
    href: '/dashboard/custos-fixos',
    icon: DollarSign,
    label: 'Custos Fixos',
  },

  {
    href: '/dashboard/financeiro',
    icon: TrendingUp,
    label: 'Financeiro',
    pro: true,
  },
  {
    href: '/dashboard/clientes',
    icon: Users,
    label: 'Clientes',
    pro: true,
  },
  {
    href: '/dashboard/orcamentos',
    icon: FileText,
    label: 'Orçamentos',
    pro: true,
  },
];

interface SidebarProps {
  onClose?: () => void;
  mobile?: boolean;
}

export default function Sidebar({ onClose, mobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Até logo! 💗');
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="w-64 h-full flex flex-col bg-white border-r border-pink-100">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between border-b border-pink-50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Precy+"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="font-black text-xl" style={{ color: '#1A1F5E' }}>
            Precy<span style={{ color: '#FF6BAD' }}>+</span>
          </span>
        </Link>

        {mobile && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label, pro }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group',
                active
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
              )}
              style={
                active
                  ? {
                      background:
                        'linear-gradient(135deg, #FF6BAD, #FF8DC7)',
                    }
                  : {}
              }
            >
              <Icon
                size={18}
                className={
                  active
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-pink-500'
                }
              />

              <span className="flex-1">{label}</span>

              {pro && !active && (
                <span
                  className="text-xs font-black px-1.5 py-0.5 rounded-md"
                  style={{ background: '#FFF3B0', color: '#B45309' }}
                >
                  PRO
                </span>
              )}

              {active && (
                <ChevronRight size={14} className="text-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-pink-50 space-y-1">
        <Link
          href="/dashboard/configuracoes"
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group',
            pathname === '/dashboard/configuracoes'
              ? 'text-white'
              : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
          )}
          style={
            pathname === '/dashboard/configuracoes'
              ? {
                  background:
                    'linear-gradient(135deg, #FF6BAD, #FF8DC7)',
                }
              : {}
          }
          onClick={onClose}
        >
          <Settings size={18} />
          Configurações
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}