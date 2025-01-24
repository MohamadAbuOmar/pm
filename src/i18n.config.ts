import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'ar'] as const;
export type Locale = typeof locales[number];
export const defaultLocale = 'en';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  try {
    return {
      locale,
      messages: (await import(`@/messages/${locale}.json`)).default,
      timeZone: 'UTC',
      defaultTranslationValues: {
        strong: (chunks: string) => chunks,
        p: (chunks: string) => chunks,
        br: () => '',
      },
      onError: (error) => {
        console.error('i18n error:', error);
      },
      getMessageFallback: ({ key, namespace }: { key: string, namespace?: string }) => {
        return namespace ? `${namespace}.${key}` : key;
      }
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    return {
      locale,
      messages: {},
      timeZone: 'UTC',
      defaultTranslationValues: {
        strong: (chunks: string) => chunks,
        p: (chunks: string) => chunks,
        br: () => '',
      },
      onError: (error) => {
        console.error('i18n error:', error);
      },
      getMessageFallback: ({ key, namespace }: { key: string, namespace?: string }) => {
        return namespace ? `${namespace}.${key}` : key;
      }
    };
  }
});
