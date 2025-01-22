'use client';

import { ReactNode } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8">
          <div className="md:hidden h-12" /> {/* Spacer for mobile menu button */}
          {children}
        </main>
      </div>
    </div>
  );
}
