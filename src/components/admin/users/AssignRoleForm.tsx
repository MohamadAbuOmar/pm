'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
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
      } catch (err) {
        setError('Failed to load users and roles');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign role');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="userId">User</Label>
        <Select
          id="userId"
          {...register('userId', { valueAsNumber: true })}
          aria-invalid={errors.userId ? 'true' : 'false'}
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </Select>
        {errors.userId && (
          <p className="text-sm text-red-500">{errors.userId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="roleId">Role</Label>
        <Select
          id="roleId"
          {...register('roleId', { valueAsNumber: true })}
          aria-invalid={errors.roleId ? 'true' : 'false'}
        >
          <option value="">Select a role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Select>
        {errors.roleId && (
          <p className="text-sm text-red-500">{errors.roleId.message}</p>
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
        {isSubmitting ? 'Assigning...' : 'Assign Role'}
      </Button>
    </form>
  );
}
