import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/components/auth/login/LoginForm';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function LoginPage() {
  const t = await getTranslations('auth.login');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
