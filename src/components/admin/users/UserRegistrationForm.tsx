'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { userRegistrationSchema, type UserRegistrationInput } from '@/lib/validations/auth';

interface Role {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
}

export function UserRegistrationForm() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<UserRegistrationInput>({
    resolver: zodResolver(userRegistrationSchema)
  });

  React.useEffect(() => {
    // Fetch roles and permissions on component mount
    const fetchData = async () => {
      try {
        const [rolesResponse, permissionsResponse] = await Promise.all([
          fetch('/api/admin/roles'),
          fetch('/api/admin/permissions')
        ]);

        if (!rolesResponse.ok || !permissionsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const rolesData = await rolesResponse.json();
        const permissionsData = await permissionsResponse.json();

        setRoles(rolesData.roles);
        setPermissions(permissionsData.permissions);
      } catch (err) {
        setError('Failed to load roles and permissions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const currentPermissions = watch('permissions') || [];
    const newPermissions = checked
      ? [...currentPermissions, permissionId]
      : currentPermissions.filter(id => id !== permissionId);
    setValue('permissions', newPermissions, { shouldValidate: true });
  };

  const onSubmit = async (data: UserRegistrationInput) => {
    try {
      // Transform form data to match API expectations
      const formData = {
        ...data,
        roleId: parseInt(data.roleId),
        permissions: (data.permissions || []).map(p => parseInt(p))
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      setSuccess('User registered successfully');
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="Enter user email"
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          placeholder="Enter user password"
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          id="role"
          {...register('roleId')}
          aria-invalid={errors.roleId ? 'true' : 'false'}
        >
          <option value="">Select a role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id.toString()}>
              {role.name}
            </option>
          ))}
        </Select>
        {errors.roleId && (
          <p className="text-sm text-red-500">{errors.roleId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Additional Permissions</Label>
        <div className="space-y-2">
          {permissions.map((permission) => (
            <div key={permission.id} className="flex items-center space-x-2">
              <Checkbox
                id={`permission-${permission.id}`}
                checked={watch('permissions')?.includes(permission.id.toString())}
                onCheckedChange={(checked) => {
                  handlePermissionChange(permission.id.toString(), checked as boolean);
                }}
              />
              <Label htmlFor={`permission-${permission.id}`}>
                {permission.name}
              </Label>
            </div>
          ))}
        </div>
        {errors.permissions && (
          <p className="text-sm text-red-500">{errors.permissions.message}</p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm rounded bg-red-50 text-red-500 border border-red-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 text-sm rounded bg-green-50 text-green-500 border border-green-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Registering...
          </div>
        ) : 'Register User'}
      </Button>
    </form>
  );
}
