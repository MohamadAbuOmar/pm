'use client';

import { ReactNode } from 'react';
import type { Locale } from '@/i18n';

interface Props {
  children: ReactNode;
  locale: Locale;
}

export default function ClientLayout({ children, locale }: Props) {
  return (
    <div className="min-h-screen font-sans" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {children}
    </div>
  );
}
