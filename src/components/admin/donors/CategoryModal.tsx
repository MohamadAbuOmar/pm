'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { donorCategorySchema, type DonorCategoryInput } from '@/lib/validations/donor';

interface CategoryModalProps {
  onSuccess: () => void;
}

export function CategoryModal({ onSuccess }: CategoryModalProps) {
  const t = useTranslations('admin.donors.form');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DonorCategoryInput>({
    resolver: zodResolver(donorCategorySchema)
  });

  const onSubmit = async (data: DonorCategoryInput) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Clean up empty strings before submission
      const cleanData = {
        arabicName: data.arabicName?.trim() || undefined,
        englishName: data.englishName?.trim() || undefined
      };

      const res = await fetch('/api/admin/donors/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || t('error.nameRequired'));
      }

      reset();
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.nameRequired'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2",
            "transition-colors hover:bg-primary/10",
            "focus:ring-2 focus:ring-primary/20",
            isRTL && "font-arabic flex-row-reverse"
          )}
        >
          <Plus className="w-4 h-4" />
          {t('form.addCategory')}
        </Button>
      </DialogTrigger>
      <DialogContent className={cn(isRTL && "font-arabic")}>
        <DialogHeader>
          <DialogTitle className={cn(isRTL && "text-right")}>
            {t('form.addNewCategory')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert 
              variant="destructive"
              className={cn(
                "border-destructive/50 text-destructive dark:border-destructive",
                "bg-destructive/5 shadow-sm",
                isRTL && "font-arabic text-right"
              )}
            >
              <AlertDescription className={cn(
                "text-sm leading-relaxed",
                isRTL && "font-arabic"
              )}>
                {error}
              </AlertDescription>
            </Alert>
          )}

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

          <Button
            type="submit"
            className={cn(
              "w-full relative",
              "transition-colors hover:bg-primary/90",
              "focus:ring-2 focus:ring-primary/20",
              "z-[60]",
              isRTL && "font-arabic"
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('saving') : t('create')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
