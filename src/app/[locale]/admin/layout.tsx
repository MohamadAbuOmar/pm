import { getTranslations } from 'next-intl/server';
import { AdminLayoutClient } from '@/components/admin/layouts/AdminLayoutClient';
import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin Dashboard - PM',
  description: 'Admin dashboard for project management system'
};

interface LayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default async function AdminLayout({
  children,
  params: { locale }
}: LayoutProps) {
  const t = await getTranslations('admin.layout');

  return (
    <AdminLayoutClient title={t('title')} locale={locale}>
      {children}
    </AdminLayoutClient>
  );
}
