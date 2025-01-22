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
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: UserRegistrationInput) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
                {...register('permissions')}
                value={permission.id.toString()}
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
        <div className="text-red-500 text-sm">{error}</div>
      )}
      {success && (
        <div className="text-green-500 text-sm">{success}</div>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Registering...' : 'Register User'}
      </Button>
    </form>
  );
}
