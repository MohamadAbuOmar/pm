import '../globals.css';
import { ibmPlexSans, ibmPlexSansArabic } from '@/styles/fonts';
import { cn } from '@/lib/utils';
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
  const messages = await getMessages(locale);

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body 
        className={cn(
          ibmPlexSans.variable,
          ibmPlexSansArabic.variable,
          "antialiased min-h-screen",
          locale === 'ar' ? 'font-arabic' : 'font-sans'
        )}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages} locale={locale} timeZone="UTC">
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
