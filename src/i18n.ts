import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
 
const locales = ['en', 'ar'];
 
export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: (await import(`../public/locales/${locale}/${locale}.json`)).default
  };
});
