import { RoleForm } from '@/components/admin/roles/RoleForm';

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Role Management</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Create New Role</h2>
        <RoleForm />
      </div>
    </div>
  );
}
