import { getTranslations } from 'next-intl/server';
import { AdminLayoutClient } from '@/components/admin/layouts/AdminLayoutClient';
import { Metadata } from 'next';
import { ReactNode } from 'react';
import { Locale } from '@/i18n.config';

export const metadata: Metadata = {
  title: 'Admin Dashboard - PM',
  description: 'Admin dashboard for project management system'
};

interface LayoutProps {
  children?: ReactNode;
  params: { locale: Locale };
}

export default async function AdminLayout({
  children,
  params
}: LayoutProps) {
  const t = await getTranslations('admin.layout');
  const { locale } = params;

  return (
    <AdminLayoutClient title={t('title')} locale={locale}>
      {children}
    </AdminLayoutClient>
  );
}
