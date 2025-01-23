'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Locale } from '@/i18n';

interface LocaleProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: ReactNode;
}

export function LocaleProvider({ locale, messages, children }: LocaleProviderProps) {
  return (
    <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <NextIntlClientProvider locale={locale as Locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
