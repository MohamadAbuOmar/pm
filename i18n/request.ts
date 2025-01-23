import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
 
const locales = ['en', 'ar'];
 
export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();
 
  return {
    locale,
    messages: {
      ...(await import(`../public/locales/${locale}/translations.json`)).default
    },
    timeZone: 'Asia/Jerusalem'
  };
});
