import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function LoginPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('forms');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t('login')}</h1>
          <p className="text-gray-500">{t('login_desc')}</p>
        </div>
        <LoginForm locale={locale} />
      </div>
    </div>
  );
}
