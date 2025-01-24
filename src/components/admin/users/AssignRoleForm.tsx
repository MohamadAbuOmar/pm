'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { roleAssignmentSchema, type RoleAssignmentInput } from '@/lib/validations/auth';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  email: string;
}

export function AssignRoleForm() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RoleAssignmentInput>({
    resolver: zodResolver(roleAssignmentSchema)
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/roles')
        ]);

        if (!usersResponse.ok || !rolesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const usersData = await usersResponse.json();
        const rolesData = await rolesResponse.json();

        setUsers(usersData.users);
        setRoles(rolesData.roles);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to load users and roles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: RoleAssignmentInput) => {
    try {
      const response = await fetch('/api/admin/users/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign role');
      }

      setSuccess('Role assigned successfully');
      reset();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to assign role');
    }
  };

  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('admin.users');

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* User select skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-100/80 rounded-md w-16"></div>
          <div className="h-10 bg-gray-100/80 rounded-md"></div>
        </div>

        {/* Role select skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-100/80 rounded-md w-14"></div>
          <div className="h-10 bg-gray-100/80 rounded-md"></div>
        </div>

        {/* Submit button skeleton */}
        <div className="h-10 bg-gray-100/80 rounded-md"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label 
            htmlFor="userId" 
            className={cn(
              "text-sm font-medium",
              isRTL && "font-arabic"
            )}
          >
            {t('form.fields.user')}
          </Label>
          <Select
            id="userId"
            {...register('userId', { valueAsNumber: true })}
            className={cn(
              "w-full transition-colors",
              "border-input hover:border-ring",
              "focus:ring-2 focus:ring-ring focus:ring-offset-0",
              "shadow-sm",
              isRTL && "font-arabic text-right",
              errors.userId && "border-red-500 hover:border-red-500 focus:ring-red-500/20"
            )}
            aria-invalid={errors.userId ? 'true' : 'false'}
          >
            <option value="">{t('form.placeholders.selectUser')}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </Select>
          {errors.userId && (
            <p className={cn(
              "text-sm text-red-500 font-medium",
              isRTL && "font-arabic text-right"
            )}>
              {errors.userId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label 
            htmlFor="roleId"
            className={cn(
              "text-sm font-medium",
              isRTL && "font-arabic"
            )}
          >
            {t('form.fields.role')}
          </Label>
          <Select
            id="roleId"
            {...register('roleId', { valueAsNumber: true })}
            className={cn(
              "w-full transition-colors",
              "border-input hover:border-ring",
              "focus:ring-2 focus:ring-ring focus:ring-offset-0",
              "shadow-sm",
              isRTL && "font-arabic text-right",
              errors.roleId && "border-red-500 hover:border-red-500 focus:ring-red-500/20"
            )}
            aria-invalid={errors.roleId ? 'true' : 'false'}
          >
            <option value="">{t('form.placeholders.selectRole')}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
          {errors.roleId && (
            <p className={cn(
              "text-sm text-red-500 font-medium",
              isRTL && "font-arabic text-right"
            )}>
              {errors.roleId.message}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className={cn(
          "flex items-center gap-2 p-4 text-sm rounded-lg bg-red-50 text-red-500 border border-red-200",
          isRTL && "flex-row-reverse font-arabic"
        )}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className={cn(
          "flex items-center gap-2 p-4 text-sm rounded-lg bg-green-50 text-green-500 border border-green-200",
          isRTL && "flex-row-reverse font-arabic"
        )}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <Button
        type="submit"
        className={cn(
          "w-full transition-colors",
          "hover:bg-primary/90 focus:ring-2 focus:ring-primary/20",
          isSubmitting && "opacity-70 cursor-not-allowed",
          isRTL && "font-arabic"
        )}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className={cn(
            "flex items-center justify-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t('form.assigning')}</span>
          </div>
        ) : t('form.assign')}
      </Button>
    </form>
  );
}
