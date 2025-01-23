import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'ar'];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: (await import(`./src/messages/${locale}.json`)).default,
    timeZone: 'Asia/Jerusalem',
    defaultTranslationValues: {
      strong: (chunks) => chunks
    }
  };
});
