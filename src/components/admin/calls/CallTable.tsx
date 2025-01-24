'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CallForm } from './CallForm';
import { Plus } from 'lucide-react';

interface Call {
  id: number;
  name: string;
  focalPoint: string | null;
  budget: string | null;
  currency: string;
  donorContribution: string | null;
  uawcContribution: string | null;
  startDate: string | null;
  endDate: string | null;
  donor: {
    id: number;
    arabicName: string | null;
    englishName: string | null;
  };
  user: {
    id: number;
    email: string;
  };
}

export function CallTable() {
  const t = useTranslations('admin.calls');
  const ct = useTranslations('common');
  const [calls, setCalls] = useState<Call[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const fetchCalls = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/calls?page=${page}&pageSize=${pageSize}`);
      if (!res.ok) throw new Error('Failed to fetch calls');
      const data = await res.json();
      setCalls(data.calls);
      setTotalCount(data.totalCount);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to fetch calls');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void fetchCalls();
  }, [fetchCalls]);

  const handleEdit = (call: Call) => {
    setSelectedCall(call);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('confirmDelete'))) return;

    try {
      const res = await fetch(`/api/admin/calls/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete call');
      void fetchCalls();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to delete call');
    }
  };

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    setSelectedCall(null);
    void fetchCalls();
  };

  function handleNextPage() {
    if (page * pageSize < totalCount) {
      setPage(page + 1);
    }
  }

  function handlePrevPage() {
    if (page > 1) {
      setPage(page - 1);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCall ? t('editCall') : t('addNewCall')}
              </DialogTitle>
            </DialogHeader>
            <CallForm
              call={selectedCall}
              onSuccess={handleFormSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left font-medium">{t('table.id')}</th>
              <th className="p-3 text-left font-medium">{t('table.name')}</th>
              <th className="p-3 text-left font-medium">{t('table.focalPoint')}</th>
              <th className="p-3 text-left font-medium">{t('table.budget')}</th>
              <th className="p-3 text-left font-medium">{t('table.currency')}</th>
              <th className="p-3 text-left font-medium">{t('table.donor')}</th>
              <th className="p-3 text-left font-medium">{t('table.startDate')}</th>
              <th className="p-3 text-left font-medium">{t('table.endDate')}</th>
              <th className="p-3 text-left font-medium">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-b">
                <td className="p-3">{call.id}</td>
                <td className="p-3">{call.name}</td>
                <td className="p-3">{call.focalPoint || '-'}</td>
                <td className="p-3">{call.budget || '-'}</td>
                <td className="p-3">{call.currency}</td>
                <td className="p-3">
                  {call.donor.englishName || call.donor.arabicName || '-'}
                </td>
                <td className="p-3">
                  {call.startDate
                    ? new Date(call.startDate).toLocaleDateString()
                    : '-'}
                </td>
                <td className="p-3">
                  {call.endDate
                    ? new Date(call.endDate).toLocaleDateString()
                    : '-'}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(call)}
                    >
                      {ct('actions.edit')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(call.id)}
                    >
                      {ct('actions.delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button 
          variant="outline" 
          onClick={handlePrevPage} 
          disabled={page <= 1}
        >
          {ct('actions.previous')}
        </Button>
        <div className="text-sm text-gray-600">
          {ct('pagination.page')} {page} {ct('pagination.of')} {Math.ceil(totalCount / pageSize)}
        </div>
        <Button 
          variant="outline" 
          onClick={handleNextPage} 
          disabled={page * pageSize >= totalCount}
        >
          {ct('actions.next')}
        </Button>
      </div>
    </div>
  );
}
