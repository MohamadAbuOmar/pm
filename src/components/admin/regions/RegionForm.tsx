'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { regionSchema, type RegionInput } from '@/lib/validations/region';

interface RegionFormProps {
  region?: {
    id: number;
    name: string;
  } | null;
  onSuccess: () => void;
}

export function RegionForm({ region, onSuccess }: RegionFormProps) {
  const t = useTranslations('admin.regions.form');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegionInput>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      name: region?.name || ''
    }
  });

  const onSubmit = async (data: RegionInput) => {
    try {
      setIsSubmitting(true);
      setError('');

      const url = region
        ? `/api/admin/regions/${region.id}`
        : '/api/admin/regions';
      
      const res = await fetch(url, {
        method: region ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save region');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save region');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">{t('fields.name')}</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder={t('placeholders.name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? t('saving')
          : region
            ? t('update')
            : t('create')
        }
      </Button>
    </form>
  );
}
