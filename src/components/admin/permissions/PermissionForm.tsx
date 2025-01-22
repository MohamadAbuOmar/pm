'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';

const permissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required')
    .regex(/^[a-z_]+$/, 'Permission name must contain only lowercase letters and underscores')
});

type PermissionInput = z.infer<typeof permissionSchema>;

export function PermissionForm() {
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PermissionInput>({
    resolver: zodResolver(permissionSchema)
  });

  const onSubmit = async (data: PermissionInput) => {
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create permission');
      }

      setSuccess('Permission created successfully');
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create permission');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Permission Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter permission name (e.g. manage_users)"
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
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
        {isSubmitting ? 'Creating...' : 'Create Permission'}
      </Button>
    </form>
  );
}
