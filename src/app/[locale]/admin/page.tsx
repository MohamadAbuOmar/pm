export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Access Cards */}
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <p className="text-gray-600 mb-4">Register and manage user accounts</p>
          <a 
            href="/admin/users"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Users →
          </a>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Role Management</h3>
          <p className="text-gray-600 mb-4">Create and configure user roles</p>
          <a 
            href="/admin/roles"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Roles →
          </a>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Permission Management</h3>
          <p className="text-gray-600 mb-4">Configure system permissions</p>
          <a 
            href="/admin/permissions"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Permissions →
          </a>
        </div>
      </div>
    </div>
  );
}
