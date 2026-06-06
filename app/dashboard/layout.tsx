'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { MaterialsProvider } from '@/lib/materials-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MaterialsProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50" style={{ fontFamily: 'Nunito, sans-serif' }}>
        {/* Desktop sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
            <div className="relative z-50 h-full">
              <Sidebar mobile onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile topbar */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-pink-100">
            <button onClick={() => setMobileOpen(true)} className="text-gray-600">
              <Menu size={22} />
            </button>
            <span className="font-black text-lg" style={{ color: '#1A1F5E' }}>
              Precy<span style={{ color: '#FF6BAD' }}>+</span>
            </span>
          </div>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </MaterialsProvider>
  );
}
