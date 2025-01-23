import { useTranslations } from 'next-intl';
import { DonorTable } from '@/components/admin/donors/DonorTable';

export default function DonorsPage() {
  const t = useTranslations('admin.donors');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <DonorTable />
      </div>
    </div>
  );
}
