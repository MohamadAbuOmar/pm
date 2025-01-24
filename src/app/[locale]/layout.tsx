import '../globals.css';
import { ibmPlexSans } from '@/styles/fonts';
import type { Metadata } from 'next';
import { locales } from '@/i18n.config';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'PM - Project Management',
  description: 'Efficient project management solution',
};

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params: { locale }
}: Props) {
  const messages = await getMessages();

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
