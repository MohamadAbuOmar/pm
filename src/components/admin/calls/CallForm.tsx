'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select } from '@/components/ui/select';
import { callSchema, type CallInput } from '@/lib/validations/call';

interface Donor {
  id: number;
  arabicName: string | null;
  englishName: string | null;
}

interface CallFormProps {
  call?: {
    id: number;
    name: string;
    focalPoint: string | null;
    budget: string | null;
    currency: string;
    donorContribution: string | null;
    uawcContribution: string | null;
    startDate: string | null;
    endDate: string | null;
    donorsId: number;
  } | null;
  onSuccess: () => void;
}

export function CallForm({ call, onSuccess }: CallFormProps) {
  const t = useTranslations('admin.calls.form');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donors, setDonors] = useState<Donor[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CallInput>({
    resolver: zodResolver(callSchema),
    defaultValues: {
      name: call?.name || '',
      focalPoint: call?.focalPoint || '',
      budget: call?.budget || '',
      currency: call?.currency || '',
      donorContribution: call?.donorContribution || '',
      uawcContribution: call?.uawcContribution || '',
      startDate: call?.startDate || '',
      endDate: call?.endDate || '',
      donorsId: call?.donorsId || 0
    }
  });

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await fetch('/api/admin/donors');
        if (!res.ok) throw new Error('Failed to fetch donors');
        const data = await res.json();
        setDonors(data.donors);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch donors');
      }
    };

    void fetchDonors();
  }, []);

  const onSubmit = async (data: CallInput) => {
    try {
      setIsSubmitting(true);
      setError('');

      const url = call
        ? `/api/admin/calls/${call.id}`
        : '/api/admin/calls';
      
      const res = await fetch(url, {
        method: call ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save call');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save call');
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

      <div className="space-y-2">
        <Label htmlFor="focalPoint">{t('fields.focalPoint')}</Label>
        <Input
          id="focalPoint"
          {...register('focalPoint')}
          placeholder={t('placeholders.focalPoint')}
        />
        {errors.focalPoint && (
          <p className="text-sm text-red-500">{errors.focalPoint.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">{t('fields.budget')}</Label>
          <Input
            id="budget"
            {...register('budget')}
            placeholder={t('placeholders.budget')}
          />
          {errors.budget && (
            <p className="text-sm text-red-500">{errors.budget.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">{t('fields.currency')}</Label>
          <Select
            id="currency"
            {...register('currency')}
          >
            <option value="">{t('placeholders.currency')}</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </Select>
          {errors.currency && (
            <p className="text-sm text-red-500">{errors.currency.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="donorContribution">{t('fields.donorContribution')}</Label>
          <Input
            id="donorContribution"
            {...register('donorContribution')}
            placeholder={t('placeholders.donorContribution')}
          />
          {errors.donorContribution && (
            <p className="text-sm text-red-500">{errors.donorContribution.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="uawcContribution">{t('fields.uawcContribution')}</Label>
          <Input
            id="uawcContribution"
            {...register('uawcContribution')}
            placeholder={t('placeholders.uawcContribution')}
          />
          {errors.uawcContribution && (
            <p className="text-sm text-red-500">{errors.uawcContribution.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">{t('fields.startDate')}</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">{t('fields.endDate')}</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
          />
          {errors.endDate && (
            <p className="text-sm text-red-500">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="donorsId">{t('fields.donor')}</Label>
        <Select
          id="donorsId"
          {...register('donorsId', { valueAsNumber: true })}
        >
          <option value="">{t('placeholders.donor')}</option>
          {donors.map((donor) => (
            <option key={donor.id} value={donor.id}>
              {donor.englishName || donor.arabicName}
            </option>
          ))}
        </Select>
        {errors.donorsId && (
          <p className="text-sm text-red-500">{errors.donorsId.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? t('saving')
          : call
            ? t('update')
            : t('create')
        }
      </Button>
    </form>
  );
}
