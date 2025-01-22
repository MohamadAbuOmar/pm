import { ReactNode } from 'react';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { AdminLayout } from './AdminLayout';

export default function Layout({ children }: { children: ReactNode }) {
  const messages = useMessages();
  
  return (
    <NextIntlClientProvider messages={messages}>
      <AdminLayout>{children}</AdminLayout>
    </NextIntlClientProvider>
  );
}
