'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  email: string;
  roles: Array<{
    role: {
      name: string;
      permissions: Array<{
        permission: {
          name: string;
        };
      }>;
    };
  }>;
}

export default function ProfilePage() {
  const t = useTranslations();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-500 border border-red-200">
        {error}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get unique permissions across all roles
  const allPermissions = new Set(
    user.roles.flatMap(roleData => 
      roleData.role.permissions.map(p => p.permission.name)
    )
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
      
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1">{user.email}</p>
          </div>
          
          {/* Roles */}
          <div>
            <label className="text-sm font-medium text-gray-500">
              {t('profile.roles')}
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {user.roles.map((roleData, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {roleData.role.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="text-sm font-medium text-gray-500">
              {t('profile.permissions')}
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from(allPermissions).map((permission) => (
                <Badge 
                  key={permission}
                  variant="outline"
                  className="px-3 py-1"
                >
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
