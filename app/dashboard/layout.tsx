'use client';

import Sidebar from '@/components/layout/Sidebar';
import { MaterialsProvider } from '@/lib/materials-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MaterialsProvider>
      <div className="min-h-screen flex bg-[#FFF9FB]">

        {/* Sidebar */}
        <Sidebar />

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>

      </div>
    </MaterialsProvider>
  );
}