import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'ar'] as const;
export type Locale = typeof locales[number];
export const defaultLocale = 'en';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  try {
    return {
      messages: (await import(`@/messages/${locale}.json`)).default,
      timeZone: 'Asia/Jerusalem',
      defaultTranslationValues: {
        strong: (chunks) => chunks,
        p: (chunks) => <p className="mt-2">{chunks}</p>,
        br: () => <br />,
      },
      onError: (error) => {
        console.error('i18n error:', error);
      },
      getMessageFallback: ({ key, namespace }) => {
        return `${namespace}.${key}`;
      }
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    return {
      messages: {},
      timeZone: 'Asia/Jerusalem',
      defaultTranslationValues: {
        strong: (chunks) => chunks,
        p: (chunks) => <p className="mt-2">{chunks}</p>,
        br: () => <br />,
      },
      onError: (error) => {
        console.error('i18n error:', error);
      },
      getMessageFallback: ({ key, namespace }) => {
        return `${namespace}.${key}`;
      }
    };
  }
});
