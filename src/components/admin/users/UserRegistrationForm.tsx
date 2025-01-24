'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
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
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to load roles and permissions');
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
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6">
          {/* Email field skeleton */}
          <div className="space-y-2">
            <div className="h-5 bg-gray-100/80 rounded-md w-16"></div>
            <div className="h-10 bg-gray-100/80 rounded-md"></div>
          </div>

          {/* Password field skeleton */}
          <div className="space-y-2">
            <div className="h-5 bg-gray-100/80 rounded-md w-20"></div>
            <div className="h-10 bg-gray-100/80 rounded-md"></div>
          </div>

          {/* Role field skeleton */}
          <div className="space-y-2">
            <div className="h-5 bg-gray-100/80 rounded-md w-14"></div>
            <div className="h-10 bg-gray-100/80 rounded-md"></div>
          </div>

          {/* Permissions skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-100/80 rounded-md w-40"></div>
            <div className="p-4 border rounded-lg bg-gray-50/50 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-100/80 rounded"></div>
                  <div className="h-4 bg-gray-100/80 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
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
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Enter user email"
            className={cn(
              "w-full transition-colors",
              "border-input hover:border-ring",
              "focus:ring-2 focus:ring-ring focus:ring-offset-0",
              "shadow-sm",
              errors.email && "border-red-500 hover:border-red-500 focus:ring-red-500/20"
            )}
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email && (
            <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="Enter user password"
            className={cn(
              "w-full transition-colors",
              "border-input hover:border-ring",
              "focus:ring-2 focus:ring-ring focus:ring-offset-0",
              "shadow-sm",
              errors.password && "border-red-500 hover:border-red-500 focus:ring-red-500/20"
            )}
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          {errors.password && (
            <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium">Role</Label>
          <Select
            id="role"
            {...register('roleId')}
            className={cn(
              "w-full transition-colors",
              "border-input hover:border-ring",
              "focus:ring-2 focus:ring-ring focus:ring-offset-0",
              "shadow-sm",
              errors.roleId && "border-red-500 hover:border-red-500 focus:ring-red-500/20"
            )}
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
            <p className="text-sm text-red-500 font-medium">{errors.roleId.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Additional Permissions</Label>
          <div className="grid gap-3 p-4 border rounded-lg bg-gray-50/50">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center gap-3">
                <Checkbox
                  id={`permission-${permission.id}`}
                  checked={watch('permissions')?.includes(permission.id.toString())}
                  onCheckedChange={(checked) => {
                    handlePermissionChange(permission.id.toString(), checked as boolean);
                  }}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label 
                  htmlFor={`permission-${permission.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {permission.name}
                </Label>
              </div>
            ))}
          </div>
          {errors.permissions && (
            <p className="text-sm text-red-500 font-medium">{errors.permissions.message}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm rounded-lg bg-red-50 text-red-500 border border-red-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 text-sm rounded-lg bg-green-50 text-green-500 border border-green-200">
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
          isSubmitting && "opacity-70 cursor-not-allowed"
        )}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Registering...</span>
          </div>
        ) : 'Register User'}
      </Button>
    </form>
  );
}
