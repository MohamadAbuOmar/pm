import { ReactNode } from 'react';
import { ibmPlexSans, ibmPlexSansArabic } from '@/styles/fonts';

interface RootLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default async function RootLayout({ children, params: { locale } }: RootLayoutProps) {
  const currentLocale = locale;
  
  return (
    <html lang={currentLocale} dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${ibmPlexSans.variable} ${ibmPlexSansArabic.variable}`}>
        <div className={`min-h-screen ${currentLocale === 'ar' ? 'font-arabic' : 'font-sans'}`}>
          {children}
        </div>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}
