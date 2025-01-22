'use client';

import { useTranslations } from 'next-intl';
import { PermissionForm } from '@/components/admin/permissions/PermissionForm';

export default function PermissionsPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('sidebar.permissions')}</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">{t('forms.create_permission')}</h2>
        <PermissionForm />
      </div>
    </div>
  );
}
