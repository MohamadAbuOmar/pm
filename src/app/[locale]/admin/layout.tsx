import { AdminLayoutClient } from '@/components/admin/layouts/AdminLayoutClient';
import { ReactNode } from 'react';
import { getMessages } from 'next-intl/server';

interface Props {
  children: ReactNode;
  params: { locale: string };
}

export default async function Layout({
  children,
  params: { locale }
}: Props) {
  const messages = await getMessages(locale);

  return (
    <AdminLayoutClient locale={locale}>
      {children}
    </AdminLayoutClient>
  );
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}
