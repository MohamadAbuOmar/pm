import { getTranslations } from 'next-intl/server';
import { RegionTable } from '@/components/admin/regions/RegionTable';

export default async function RegionsPage() {
  const t = await getTranslations('admin.regions');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <RegionTable />
      </div>
    </div>
  );
}
