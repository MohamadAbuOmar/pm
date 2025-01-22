import { UserRegistrationForm } from '@/components/admin/users/UserRegistrationForm';
import { AssignRoleForm } from '@/components/admin/users/AssignRoleForm';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Register New User</h2>
        <UserRegistrationForm />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Assign Role to User</h2>
        <AssignRoleForm />
      </div>
    </div>
  );
}
