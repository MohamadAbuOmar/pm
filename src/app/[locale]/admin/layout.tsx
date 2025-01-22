'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-50 border-r">
        <nav className="p-4 space-y-2">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
          </div>
          <div className="space-y-1">
            <Link 
              href={`/${pathname.split('/')[1]}/admin`}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                pathname.endsWith('/admin') 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href={`/${pathname.split('/')[1]}/admin/users`}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                pathname.endsWith('/admin/users')
                  ? 'bg-gray-200 text-gray-900'
                  : 'hover:bg-gray-100'
              }`}
            >
              Manage Users
            </Link>
            <Link 
              href={`/${pathname.split('/')[1]}/admin/roles`}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                pathname.endsWith('/admin/roles')
                  ? 'bg-gray-200 text-gray-900'
                  : 'hover:bg-gray-100'
              }`}
            >
              Manage Roles
            </Link>
            <Link 
              href={`/${pathname.split('/')[1]}/admin/permissions`}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                pathname.endsWith('/admin/permissions')
                  ? 'bg-gray-200 text-gray-900'
                  : 'hover:bg-gray-100'
              }`}
            >
              Manage Permissions
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
