import { getTranslations } from 'next-intl/server';
import { CallTable } from '@/components/admin/calls/CallTable';

export default async function CallsPage() {
  const t = await getTranslations('admin.calls');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <CallTable />
      </div>
    </div>
  );
}
