'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { Locale } from '@/i18n';

interface RootLayoutProviderProps {
  locale: string;
  children: ReactNode;
}

export function RootLayoutProvider({ locale, children }: RootLayoutProviderProps) {
  const messages = useMessages();

  return (
    <NextIntlClientProvider locale={locale as Locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
