import { AdminLayoutClient } from '@/components/admin/layouts/AdminLayoutClient';
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

interface Props {
  children: ReactNode;
  params: { locale: string };
}

export default async function Layout({
  children,
  params: { locale }
}: Props) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AdminLayoutClient locale={locale}>
        {children}
      </AdminLayoutClient>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}
