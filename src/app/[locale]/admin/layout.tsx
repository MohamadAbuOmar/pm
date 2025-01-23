import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NavItems } from '@/components/admin/navigation/NavItems';
import { AdminLayoutClient } from '@/components/admin/layouts/AdminLayoutClient';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('admin.layout');
  
  const sidebar = (
    <nav className="p-4 space-y-2 h-full overflow-y-auto">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <LanguageSwitcher />
      </div>
      <NavItems />
    </nav>
  );

  return (
    <AdminLayoutClient sidebar={sidebar}>
      {children}
    </AdminLayoutClient>
  );
}
