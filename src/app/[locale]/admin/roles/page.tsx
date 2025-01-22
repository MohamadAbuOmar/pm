'use client';

import { useTranslations } from 'next-intl';
import { RoleForm } from '@/components/admin/roles/RoleForm';

export default function RolesPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('sidebar.roles')}</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">{t('forms.create_role')}</h2>
        <RoleForm />
      </div>
    </div>
  );
}
