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
import { DonorForm } from './DonorForm';
import { Plus, Search } from 'lucide-react';
import { debounce } from 'lodash';

interface Donor {
  id: number;
  arabicName: string | null;
  englishName: string | null;
  category?: {
    id: number;
    arabicName: string | null;
    englishName: string | null;
  } | null;
  region?: {
    id: number;
    name: string;
  } | null;
  email: string | null;
  phone: string | null;
  isPartner: number | null;
}

export function DonorTable() {
  const t = useTranslations('admin.donors');
  const ct = useTranslations('common');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'englishName' | 'arabicName' | 'createdAt'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [regionId, setRegionId] = useState<string>('');
  const [isPartner, setIsPartner] = useState<string>('');
  const [debouncedSearch] = useState(() => 
    debounce((query: string) => {
      setPage(1);
      void fetchDonors(1, pageSize, query, sortBy, sortOrder);
    }, 300)
  );

  const fetchDonors = useCallback(async (
    currentPage: number,
    currentPageSize: number,
    search?: string,
    currentSortBy: 'id' | 'englishName' | 'arabicName' | 'createdAt' = 'id',
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
      
      if (categoryId) {
        queryParams.append('categoryId', categoryId);
      }
      
      if (regionId) {
        queryParams.append('regionId', regionId);
      }
      
      if (isPartner) {
        queryParams.append('isPartner', isPartner);
      }

      const res = await fetch(`/api/admin/donors?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch donors');
      
      const data = await res.json();
      setDonors(data.donors);
      setTotalCount(data.totalCount);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to fetch donors');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, regionId, isPartner]);

  useEffect(() => {
    void fetchDonors(page, pageSize, searchQuery, sortBy, sortOrder);
  }, [fetchDonors, page, pageSize, searchQuery, sortBy, sortOrder]);

  const handleEdit = (donor: Donor) => {
    setSelectedDonor(donor);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('confirmDelete'))) return;

    try {
      const res = await fetch(`/api/admin/donors/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete donor');
      void fetchDonors(page, pageSize, searchQuery, sortBy, sortOrder);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to delete donor');
    }
  };

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    setSelectedDonor(null);
    void fetchDonors(page, pageSize, searchQuery, sortBy, sortOrder);
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
        
        {/* Category and region filters skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Table skeleton */}
        <div className="rounded-md border">
          <div className="border-b bg-gray-50 p-3">
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div key={idx} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-3 p-3">
            {Array.from({ length: pageSize }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, cellIdx) => (
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
          <option value="englishName">{t('table.englishName')}</option>
          <option value="arabicName">{t('table.arabicName')}</option>
          <option value="createdAt">{t('table.createdAt')}</option>
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

      {/* Category and region filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t('filters.allCategories')}</option>
          {/* Add category options here */}
        </Select>
        <Select
          value={regionId}
          onChange={(e) => {
            setRegionId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t('filters.allRegions')}</option>
          {/* Add region options here */}
        </Select>
        <Select
          value={isPartner}
          onChange={(e) => {
            setIsPartner(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t('filters.allPartnerStatus')}</option>
          <option value="1">{ct('status.partner')}</option>
          <option value="0">{ct('status.nonPartner')}</option>
        </Select>
      </div>

      {/* Add new donor button */}
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
                {selectedDonor ? t('editDonor') : t('addNewDonor')}
              </DialogTitle>
            </DialogHeader>
            <DonorForm
              donor={selectedDonor}
              onSuccess={handleFormSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Donors table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left font-medium">{t('table.id')}</th>
              <th className="p-3 text-left font-medium">{t('table.englishName')}</th>
              <th className="p-3 text-left font-medium">{t('table.arabicName')}</th>
              <th className="p-3 text-left font-medium">{t('table.category')}</th>
              <th className="p-3 text-left font-medium">{t('table.email')}</th>
              <th className="p-3 text-left font-medium">{t('table.phone')}</th>
              <th className="p-3 text-left font-medium">{t('table.partnerStatus')}</th>
              <th className="p-3 text-left font-medium">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor) => (
              <tr key={donor.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{donor.id}</td>
                <td className="p-3">{donor.englishName || '-'}</td>
                <td className="p-3">{donor.arabicName || '-'}</td>
                <td className="p-3">
                  {donor.category ? (
                    <div>
                      <div>{donor.category.englishName || '-'}</div>
                      <div className="text-sm text-gray-500">{donor.category.arabicName || '-'}</div>
                    </div>
                  ) : '-'}
                </td>
                <td className="p-3">{donor.email || '-'}</td>
                <td className="p-3">{donor.phone || '-'}</td>
                <td className="p-3">
                  {donor.isPartner ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {ct('status.partner')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                      {ct('status.nonPartner')}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(donor)}
                    >
                      {ct('actions.edit')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(donor.id)}
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
