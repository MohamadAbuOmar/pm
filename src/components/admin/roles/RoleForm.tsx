'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type FormEvent = React.FormEvent<HTMLFormElement>;

interface Permission {
  id: number;
  name: string;
}

export function RoleForm() {
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch available permissions on component mount
  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions');
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      setPermissions(data.permissions);
    } catch (err) {
      setError('Failed to load permissions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roleName,
          permissions: selectedPermissions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create role');
      }

      setSuccess('Role created successfully');
      setRoleName('');
      setSelectedPermissions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="roleName">Role Name</Label>
        <Input
          id="roleName"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          required
          placeholder="Enter role name"
        />
      </div>

      <div className="space-y-2">
        <Label>Permissions</Label>
        <div className="space-y-2">
          {permissions.map((permission) => (
            <div key={permission.id} className="flex items-center space-x-2">
              <Checkbox
                id={`permission-${permission.id}`}
                checked={selectedPermissions.includes(permission.id)}
                onCheckedChange={(checked) => {
                  setSelectedPermissions(prev =>
                    checked
                      ? [...prev, permission.id]
                      : prev.filter(id => id !== permission.id)
                  );
                }}
              />
              <Label htmlFor={`permission-${permission.id}`}>
                {permission.name}
              </Label>
            </div>
          ))}
        </div>
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
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Role'}
      </Button>
    </form>
  );
}
