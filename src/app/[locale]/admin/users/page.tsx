'use client';

import { useTranslations } from 'next-intl';
import { UserRegistrationForm } from '@/components/admin/users/UserRegistrationForm';
import { AssignRoleForm } from '@/components/admin/users/AssignRoleForm';

export default function UsersPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('sidebar.users')}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">{t('forms.register_user')}</h2>
        <UserRegistrationForm />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">{t('forms.assign_role')}</h2>
        <AssignRoleForm />
      </div>
    </div>
  );
}
