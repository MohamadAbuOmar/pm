import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales, Locale } from '@/i18n';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ibmPlexSans } from '@/styles/fonts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PM - Project Management',
  description: 'Efficient project management solution',
};

type Props = {
  children: ReactNode;
  params: { locale: string };
};

async function getLocaleMessages(locale: string) {
  try {
    if (!locales.includes(locale as Locale)) {
      notFound();
    }
    return await getMessages(locale);
  } catch (error) {
    return {};
  }
}

export default async function RootLayout({ children, params: { locale } }: Props) {
  const messages = await getLocaleMessages(locale);

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={ibmPlexSans.variable}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale })) as { locale: Locale }[];
}
