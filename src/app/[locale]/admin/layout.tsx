import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Sidebar } from '@/components/layout/sidebar';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function AdminLayout({ 
  children,
  params: { locale }
}: { 
  children: ReactNode;
  params: { locale: string };
}) {
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
