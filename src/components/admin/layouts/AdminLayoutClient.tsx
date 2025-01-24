'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NavItems } from '@/components/admin/navigation/NavItems';
import { useTranslations } from 'next-intl';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  locale: string;
}

export function AdminLayoutClient({ children, locale }: AdminLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('admin.layout');

  const isRTL = locale === 'ar';

  return (
    <div 
      className={`min-h-screen flex ${isRTL ? 'font-arabic' : 'font-sans'}`} 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`fixed top-4 ${isRTL ? 'right-4' : 'left-4'} z-50 md:hidden`}
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
          fixed md:static inset-y-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} z-40
          w-64 bg-gray-50 transform transition-all duration-300 ease-in-out
          ${isMobileMenuOpen 
            ? 'translate-x-0' 
            : `${isRTL ? 'translate-x-full' : '-translate-x-full'} md:translate-x-0`
          }
          md:shadow-none shadow-lg
        `}
      >
        <nav className="p-4 space-y-2 h-full overflow-y-auto">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">{t('title')}</h2>
            <LanguageSwitcher />
          </div>
          <NavItems />
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1 p-4 md:p-8
        ${isRTL ? 'md:mr-0 mr-0' : 'md:ml-0 ml-0'}
      `}>
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
