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

async function getLocaleMessages(locale: string) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  try {
    return await getMessages(locale);
  } catch {
    return {};
  }
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
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
