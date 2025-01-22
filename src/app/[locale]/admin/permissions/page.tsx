import { PermissionForm } from '@/components/admin/permissions/PermissionForm';

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Permission Management</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Create New Permission</h2>
        <PermissionForm />
      </div>
    </div>
  );
}
