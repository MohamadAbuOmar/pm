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
import { RegionForm } from './RegionForm';
import { Plus } from 'lucide-react';

interface Region {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function RegionTable() {
  const t = useTranslations('admin.regions');
  const ct = useTranslations('common');
  const [regions, setRegions] = useState<Region[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const [sortBy, setSortBy] = useState<'id' | 'name' | 'createdAt'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useState(() => 
    debounce((query: string) => {
      setPage(1);
      void fetchRegions(1, pageSize, query, sortBy, sortOrder);
    }, 300)
  );

  const fetchRegions = useCallback(async (
    currentPage: number,
    currentPageSize: number,
    search?: string,
    currentSortBy: 'id' | 'name' | 'createdAt' = 'id',
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

      const res = await fetch(`/api/admin/regions?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch regions');
      
      const data = await res.json();
      setRegions(data.regions);
      setTotalCount(data.totalCount);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to fetch regions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRegions();
  }, [fetchRegions]);

  const handleEdit = (region: Region) => {
    setSelectedRegion(region);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('confirmDelete'))) return;

    try {
      const res = await fetch(`/api/admin/regions/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete region');
      void fetchRegions();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to delete region');
    }
  };

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    setSelectedRegion(null);
    void fetchRegions();
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
        {/* Search and Add button skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
        
        {/* Table skeleton */}
        <div className="rounded-md border">
          <div className="border-b bg-gray-50 p-3">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-3 p-3">
            {Array.from({ length: pageSize }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, cellIdx) => (
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
                {selectedRegion ? t('editRegion') : t('addNewRegion')}
              </DialogTitle>
            </DialogHeader>
            <RegionForm
              region={selectedRegion}
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
              <th className="p-3 text-left font-medium">{t('table.createdAt')}</th>
              <th className="p-3 text-left font-medium">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr key={region.id} className="border-b">
                <td className="p-3">{region.id}</td>
                <td className="p-3">{region.name}</td>
                <td className="p-3">
                  {new Date(region.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(region)}
                    >
                      {ct('actions.edit')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(region.id)}
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
