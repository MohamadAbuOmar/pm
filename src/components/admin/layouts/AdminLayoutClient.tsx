'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NavItems } from '@/components/admin/navigation/NavItems';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  title: string;
  locale: string;
}

export function AdminLayoutClient({ children, title, locale }: AdminLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-gray-50 border-r transform transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:shadow-none shadow-lg
        `}
      >
        <nav className="p-4 space-y-2 h-full overflow-y-auto">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{title}</h2>
            <LanguageSwitcher />
          </div>
          <NavItems />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-0 ml-0">
        <div className="md:hidden h-12" /> {/* Spacer for mobile menu button */}
        {children}
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
