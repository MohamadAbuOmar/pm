'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function AdminDashboard() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('sidebar.dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">{t('sidebar.users')}</h3>
          <p className="text-gray-600 mb-4">{t('sidebar.users_desc')}</p>
          <Link 
            href={`/${locale}/admin/users`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {t('sidebar.users')} →
          </Link>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">{t('sidebar.roles')}</h3>
          <p className="text-gray-600 mb-4">{t('sidebar.roles_desc')}</p>
          <Link 
            href={`/${locale}/admin/roles`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {t('sidebar.roles')} →
          </Link>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">{t('sidebar.permissions')}</h3>
          <p className="text-gray-600 mb-4">{t('sidebar.permissions_desc')}</p>
          <Link 
            href={`/${locale}/admin/permissions`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {t('sidebar.permissions')} →
          </Link>
        </div>
      </div>
    </div>
  );
}
