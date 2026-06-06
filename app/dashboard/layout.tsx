'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { MaterialsProvider } from '@/lib/materials-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MaterialsProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">

        {/* SIDEBAR */}
        <Sidebar />

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)} />
        )}

        {/* CONTENT (SÓ UMA VEZ) */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </MaterialsProvider>
  );
}