'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Home() {
  const t = useTranslations('common');

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t('welcome.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {t('welcome.subtitle')}
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
        >
          {t('auth.signIn')}
        </Link>
      </div>
    </main>
  );
}
