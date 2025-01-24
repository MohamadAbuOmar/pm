'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CallForm } from './CallForm';
import { Plus, Search, Calendar } from 'lucide-react';
import { debounce } from 'lodash';

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
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'startDate' | 'endDate' | 'insertDate'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDateFrom, setStartDateFrom] = useState('');
  const [startDateTo, setStartDateTo] = useState('');
  const [endDateFrom, setEndDateFrom] = useState('');
  const [endDateTo, setEndDateTo] = useState('');
  const [debouncedSearch] = useState(() => 
    debounce((query: string) => {
      setPage(1);
      void fetchCalls(1, pageSize, query, sortBy, sortOrder);
    }, 300)
  );

  const fetchCalls = useCallback(async (
    currentPage: number,
    currentPageSize: number,
    search?: string,
    currentSortBy: 'id' | 'name' | 'startDate' | 'endDate' | 'insertDate' = 'id',
    currentSortOrder: 'asc' | 'desc' = 'desc'
  ) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: currentPageSize.toString(),
        sortBy: currentSortBy,
        sortOrder: currentSortOrder
      });
      
      if (search) {
        queryParams.append('search', search);
      }
      
      if (startDateFrom) {
        queryParams.append('startDateFrom', startDateFrom);
      }
      
      if (startDateTo) {
        queryParams.append('startDateTo', startDateTo);
      }
      
      if (endDateFrom) {
        queryParams.append('endDateFrom', endDateFrom);
      }
      
      if (endDateTo) {
        queryParams.append('endDateTo', endDateTo);
      }

      const res = await fetch(`/api/admin/calls?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch calls');
      
      const data = await res.json();
      setCalls(data.calls);
      setTotalCount(data.totalCount);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to fetch calls');
    } finally {
      setIsLoading(false);
    }
  }, [startDateFrom, startDateTo, endDateFrom, endDateTo]);

  useEffect(() => {
    void fetchCalls(page, pageSize, searchQuery, sortBy, sortOrder);
  }, [fetchCalls, page, pageSize, searchQuery, sortBy, sortOrder]);

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
      void fetchCalls(page, pageSize, searchQuery, sortBy, sortOrder);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to delete call');
    }
  };

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    setSelectedCall(null);
    void fetchCalls(page, pageSize, searchQuery, sortBy, sortOrder);
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
        {/* Search and filters skeleton */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-40">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-40">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Date filters skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
            </div>
          </div>
        </div>
        
        {/* Table skeleton */}
        <div className="rounded-md border">
          <div className="border-b bg-gray-50 p-3">
            <div className="grid grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-3 p-3">
            {Array.from({ length: pageSize }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-8 gap-4">
                {Array.from({ length: 8 }).map((_, cellIdx) => (
                  <div key={cellIdx} className="h-6 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Pagination skeleton */}
        <div className="flex items-center justify-between mt-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className="pl-9"
            />
          </div>
        </div>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="w-40"
        >
          <option value="id">{t('table.id')}</option>
          <option value="name">{t('table.name')}</option>
          <option value="startDate">{t('table.startDate')}</option>
          <option value="endDate">{t('table.endDate')}</option>
          <option value="insertDate">{t('table.insertDate')}</option>
        </Select>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
          className="w-40"
        >
          <option value="asc">{t('sort.ascending')}</option>
          <option value="desc">{t('sort.descending')}</option>
        </Select>
      </div>

      {/* Date filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('filters.startDate')}
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDateFrom}
              onChange={(e) => {
                setStartDateFrom(e.target.value);
                setPage(1);
              }}
              className="flex-1"
            />
            <Input
              type="date"
              value={startDateTo}
              onChange={(e) => {
                setStartDateTo(e.target.value);
                setPage(1);
              }}
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('filters.endDate')}
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={endDateFrom}
              onChange={(e) => {
                setEndDateFrom(e.target.value);
                setPage(1);
              }}
              className="flex-1"
            />
            <Input
              type="date"
              value={endDateTo}
              onChange={(e) => {
                setEndDateTo(e.target.value);
                setPage(1);
              }}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Add new call button */}
      <div>
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

      {/* Calls table */}
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
              <tr key={call.id} className="border-b hover:bg-gray-50">
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
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
