'use client';

import { NextIntlClientProvider } from 'next-intl';

interface NextIntlProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
}

export function NextIntlProvider({ locale, messages, children }: NextIntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
