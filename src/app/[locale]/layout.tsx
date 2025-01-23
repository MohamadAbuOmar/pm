import '../globals.css';
import { ibmPlexSans } from '@/styles/fonts';
import type { Metadata } from 'next';
import { Locale, locales } from '@/i18n.config';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'PM - Project Management',
  description: 'Efficient project management solution',
};

interface Props {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function RootLayout({
  children,
  params
}: Props) {
  const { locale } = params;
  const messages = await getMessages(locale);

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={`${ibmPlexSans.variable} antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale} timeZone="Asia/Jerusalem">
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
