'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select } from '@/components/ui/select';
import { donorSchema, type DonorInput } from '@/lib/validations/donor';
import { cn } from '@/lib/utils';

interface DonorFormProps {
  donor?: {
    id: number;
    arabicName: string | null;
    englishName: string | null;
    regionId: number | null;
    categoryId: number | null;
    isPartner: number | null;
    fax: string | null;
    address: string | null;
    website: string | null;
    workField: string | null;
    gender: 'male' | 'female' | 'other' | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
  } | null;
  onSuccess: () => void;
}

export function DonorForm({ donor, onSuccess }: DonorFormProps) {
  const t = useTranslations('admin.donors.form');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Array<{
    id: number;
    arabicName: string | null;
    englishName: string | null;
  }>>([]);
  const [regions, setRegions] = useState<Array<{
    id: number;
    name: string;
  }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<DonorInput>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      arabicName: donor?.arabicName || '',
      englishName: donor?.englishName || '',
      regionId: donor?.regionId || undefined,
      categoryId: donor?.categoryId || undefined,
      isPartner: donor?.isPartner || 0,
      fax: donor?.fax || '',
      address: donor?.address || '',
      website: donor?.website || '',
      workField: donor?.workField || '',
      gender: donor?.gender || undefined,
      phone: donor?.phone || '',
      email: donor?.email || '',
      notes: donor?.notes || ''
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/donors/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data.categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      }
    };

    const fetchRegions = async () => {
      try {
        const res = await fetch('/api/admin/regions');
        if (!res.ok) throw new Error('Failed to fetch regions');
        const data = await res.json();
        setRegions(data.regions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch regions');
      }
    };

    void fetchCategories();
    void fetchRegions();
  }, []);

  const onSubmit = async (data: DonorInput) => {
    try {
      setIsSubmitting(true);
      setError('');

      const url = donor
        ? `/api/admin/donors/${donor.id}`
        : '/api/admin/donors';
      
      const res = await fetch(url, {
        method: donor ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save donor');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save donor');
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="englishName">{t('fields.englishName')}</Label>
          <Input
            id="englishName"
            {...register('englishName')}
            placeholder={t('placeholders.englishName')}
            className={cn(isRTL && "text-left")}
          />
          {errors.englishName && (
            <p className="text-sm text-red-500">{errors.englishName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="arabicName">{t('fields.arabicName')}</Label>
          <Input
            id="arabicName"
            {...register('arabicName')}
            placeholder={t('placeholders.arabicName')}
            className={cn(isRTL && "text-right font-arabic")}
          />
          {errors.arabicName && (
            <p className="text-sm text-red-500">{errors.arabicName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">{t('fields.category')}</Label>
          <Select
            id="categoryId"
            {...register('categoryId', { valueAsNumber: true })}
            className={cn(isRTL && "text-right font-arabic")}
          >
            <option value="">{t('placeholders.category')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {isRTL ? category.arabicName : category.englishName}
              </option>
            ))}
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-red-500">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="regionId">{t('fields.region')}</Label>
          <Select
            id="regionId"
            {...register('regionId', { valueAsNumber: true })}
            className={cn(isRTL && "text-right font-arabic")}
          >
            <option value="">{t('placeholders.region')}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </Select>
          {errors.regionId && (
            <p className="text-sm text-red-500">{errors.regionId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('fields.email')}</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder={t('placeholders.email')}
            className={cn(isRTL && "text-left")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t('fields.phone')}</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder={t('placeholders.phone')}
            className={cn(isRTL && "text-left")}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fax">{t('fields.fax')}</Label>
          <Input
            id="fax"
            {...register('fax')}
            placeholder={t('placeholders.fax')}
            className={cn(isRTL && "text-left")}
          />
          {errors.fax && (
            <p className="text-sm text-red-500">{errors.fax.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">{t('fields.website')}</Label>
          <Input
            id="website"
            {...register('website')}
            placeholder={t('placeholders.website')}
            className={cn(isRTL && "text-left")}
          />
          {errors.website && (
            <p className="text-sm text-red-500">{errors.website.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">{t('fields.address')}</Label>
        <Input
          id="address"
          {...register('address')}
          placeholder={t('placeholders.address')}
          className={cn(isRTL && "text-right font-arabic")}
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workField">{t('fields.workField')}</Label>
          <Input
            id="workField"
            {...register('workField')}
            placeholder={t('placeholders.workField')}
            className={cn(isRTL && "text-right font-arabic")}
          />
          {errors.workField && (
            <p className="text-sm text-red-500">{errors.workField.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">{t('fields.gender')}</Label>
          <Select
            id="gender"
            {...register('gender')}
            className={cn(isRTL && "text-right font-arabic")}
          >
            <option value="">{t('placeholders.gender')}</option>
            <option value="male">{t('gender.male')}</option>
            <option value="female">{t('gender.female')}</option>
            <option value="other">{t('gender.other')}</option>
          </Select>
          {errors.gender && (
            <p className="text-sm text-red-500">{errors.gender.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="isPartner">{t('fields.isPartner')}</Label>
        <Select
          id="isPartner"
          {...register('isPartner', { valueAsNumber: true })}
          className={cn(isRTL && "text-right font-arabic")}
        >
          <option value="0">{t('partnerStatus.no')}</option>
          <option value="1">{t('partnerStatus.yes')}</option>
        </Select>
        {errors.isPartner && (
          <p className="text-sm text-red-500">{errors.isPartner.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t('fields.notes')}</Label>
        <textarea
          id="notes"
          {...register('notes')}
          placeholder={t('placeholders.notes')}
          className={cn(
            "min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            isRTL && "text-right font-arabic"
          )}
        />
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? t('saving')
          : donor
            ? t('update')
            : t('create')
        }
      </Button>
    </form>
  );
}
