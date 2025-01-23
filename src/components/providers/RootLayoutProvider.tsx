'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import { Locale } from '@/i18n';

interface RootLayoutProviderProps {
  locale: string;
  children: ReactNode;
}

export function RootLayoutProvider({ locale, children }: RootLayoutProviderProps) {
  const messages = {
    common: {
      error: {
        generic: 'An error occurred',
        unauthorized: 'Unauthorized',
        forbidden: 'Forbidden',
        invalidToken: 'Invalid token',
        internalServer: 'Internal server error',
        failedToFetch: 'Failed to fetch data'
      }
    }
  };

  return (
    <div className="min-h-screen font-sans" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <NextIntlClientProvider locale={locale as Locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
