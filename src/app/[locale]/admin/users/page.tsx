import { UserRegistrationForm } from '@/components/admin/users/UserRegistrationForm';
import { AssignRoleForm } from '@/components/admin/users/AssignRoleForm';
import { useTranslations } from 'next-intl';

export default function UsersPage() {
  const t = useTranslations('admin.users');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">{t('registerUser')}</h2>
        <UserRegistrationForm />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">{t('assignRole')}</h2>
        <AssignRoleForm />
      </div>
    </div>
  );
}
