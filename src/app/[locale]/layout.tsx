import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales, Locale } from '@/i18n';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import { getMessages } from 'next-intl/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PM - Project Management',
  description: 'Efficient project management solution',
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}): Promise<JSX.Element> {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body>
        <LocaleProvider locale={locale} messages={messages}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale })) as { locale: Locale }[];
}
