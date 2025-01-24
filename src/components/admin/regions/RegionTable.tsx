'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RegionForm } from './RegionForm';
import { Plus, Search } from 'lucide-react';
import { debounce } from '@/lib/utils/debounce';

interface Region {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function RegionTable() {
  const t = useTranslations('admin.regions');
  const ct = useTranslations('common');
  const locale = useLocale();
  const isRTL = locale === 'ar';
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
      <div className="space-y-6">
        {/* Search and filters skeleton */}
        <div className={cn(
          "flex flex-wrap items-center gap-4",
          isRTL && "flex-row-reverse"
        )}>
          <div className="flex-1 min-w-[200px]">
            <div className="h-10 bg-gray-100/80 rounded-md animate-pulse"></div>
          </div>
          <div className={cn(
            "flex gap-3",
            isRTL && "flex-row-reverse"
          )}>
            <div className="w-44">
              <div className="h-10 bg-gray-100/80 rounded-md animate-pulse"></div>
            </div>
            <div className="w-44">
              <div className="h-10 bg-gray-100/80 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Add button skeleton */}
        <div className={cn(
          "flex",
          isRTL && "justify-end"
        )}>
          <div className="h-10 w-32 bg-gray-100/80 rounded-md animate-pulse"></div>
        </div>
        
        {/* Table skeleton */}
        <div className={cn(
          "rounded-md border shadow-sm bg-white overflow-hidden",
          isRTL && "font-arabic"
        )}>
          <div className="border-b bg-gray-50/50 p-4">
            <div className={cn(
              "grid grid-cols-4 gap-4",
              isRTL && "text-right"
            )}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-6 bg-gray-100/80 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: pageSize }).map((_, idx) => (
              <div key={idx} className={cn(
                "grid grid-cols-4 gap-4",
                isRTL && "text-right"
              )}>
                {Array.from({ length: 4 }).map((_, cellIdx) => (
                  <div key={cellIdx} className="h-6 bg-gray-100/80 rounded-md animate-pulse"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Pagination skeleton */}
        <div className={cn(
          "flex items-center justify-between mt-6",
          isRTL && "flex-row-reverse"
        )}>
          <div className="h-10 bg-gray-100/80 rounded-md animate-pulse w-24"></div>
          <div className={cn(
            "h-6 bg-gray-100/80 rounded-md animate-pulse w-32",
            isRTL && "font-arabic"
          )}></div>
          <div className="h-10 bg-gray-100/80 rounded-md animate-pulse w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert 
          variant="destructive"
          className={cn(
            "border-destructive/50 text-destructive dark:border-destructive mb-6",
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

      {/* Search and filters */}
      <div className={cn(
        "flex flex-wrap items-center gap-4 mb-6",
        isRTL && "flex-row-reverse"
      )}>
        <div className="flex-1 min-w-[200px]">
          <div className="relative group">
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors group-hover:text-foreground",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className={cn(
                "transition-all duration-200",
                "border-input hover:border-ring",
                "focus:ring-2 focus:ring-ring focus:ring-offset-0",
                "shadow-sm placeholder:text-muted-foreground",
                isRTL ? "pr-9 font-arabic text-right" : "pl-9"
              )}
            />
          </div>
        </div>
        <div className={cn(
          "flex gap-3 flex-wrap",
          isRTL && "flex-row-reverse"
        )}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className={cn(
              "w-44 transition-all duration-200",
              "border-input hover:border-ring",
              "focus:ring-2 focus:ring-ring focus:ring-offset-0",
              "shadow-sm",
              isRTL && "font-arabic text-right"
            )}
          >
            <option value="id">{t('table.id')}</option>
            <option value="name">{t('table.name')}</option>
            <option value="createdAt">{t('table.createdAt')}</option>
          </Select>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className={cn(
              "w-44 transition-all duration-200",
              "border-input hover:border-ring",
              "focus:ring-2 focus:ring-ring focus:ring-offset-0",
              "shadow-sm",
              isRTL && "font-arabic text-right"
            )}
          >
            <option value="asc">{t('sort.ascending')}</option>
            <option value="desc">{t('sort.descending')}</option>
          </Select>
        </div>
      </div>

      {/* Add new region button */}
      <div className={cn(
        "flex mb-6",
        isRTL && "justify-end"
      )}>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className={cn(
                "flex items-center gap-2 transition-colors hover:bg-primary/90",
                isRTL && "font-arabic flex-row-reverse"
              )}>
              <Plus className="w-4 h-4" />
              {t('addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className={cn(
            isRTL && "font-arabic"
          )}>
            <DialogHeader>
              <DialogTitle className={cn(
                isRTL && "text-right"
              )}>
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

      <DataTable
        data={regions}
        className={cn(
          "rounded-md border shadow-sm bg-white",
          isRTL && "font-arabic"
        )}
        columns={[
          {
            key: 'id',
            header: t('table.id'),
            cell: (region) => (
              <span className={cn(
                "block font-medium tabular-nums",
                isRTL && "font-arabic text-right"
              )}>
                {region.id}
              </span>
            )
          },
          {
            key: 'name',
            header: t('table.name'),
            cell: (region) => (
              <div className={cn(
                "font-medium line-clamp-1",
                isRTL && "text-right font-arabic"
              )}>
                {region.name}
              </div>
            )
          },
          {
            key: 'createdAt',
            header: t('table.createdAt'),
            cell: (region) => (
              <div className={cn(
                "whitespace-nowrap text-muted-foreground",
                isRTL && "text-right font-arabic"
              )}>
                {new Date(region.createdAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )
          },
          {
            key: 'actions',
            header: t('table.actions'),
            cell: (region) => (
              <div className={cn(
                "flex items-center gap-2",
                isRTL && "flex-row-reverse justify-start"
              )}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(region)}
                  className={cn(
                    "transition-colors hover:bg-primary/10 focus:ring-2 focus:ring-primary/20",
                    isRTL && "font-arabic"
                  )}
                >
                  {ct('actions.edit')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(region.id)}
                  className={cn(
                    "transition-colors hover:bg-destructive/90 focus:ring-2 focus:ring-destructive/20",
                    isRTL && "font-arabic"
                  )}
                >
                  {ct('actions.delete')}
                </Button>
              </div>
            )
          }
        ]}
      />

      <div className={cn(
        "flex items-center justify-between mt-6 pb-4",
        isRTL && "flex-row-reverse"
      )}>
        <Button 
          variant="outline" 
          onClick={handlePrevPage} 
          disabled={page <= 1}
          className={cn(
            "transition-colors hover:bg-primary/10 focus:ring-2 focus:ring-primary/20",
            isRTL && "font-arabic"
          )}
        >
          {ct('actions.previous')}
        </Button>
        <div className={cn(
          "text-sm text-muted-foreground",
          isRTL && "font-arabic"
        )}>
          <span className="font-medium text-foreground">{page}</span>
          {' '}{ct('pagination.of')}{' '}
          <span className="font-medium text-foreground">
            {Math.ceil(totalCount / pageSize)}
          </span>
        </div>
        <Button 
          variant="outline" 
          onClick={handleNextPage} 
          disabled={page * pageSize >= totalCount}
          className={cn(
            "transition-colors hover:bg-primary/10 focus:ring-2 focus:ring-primary/20",
            isRTL && "font-arabic"
          )}
        >
          {ct('actions.next')}
        </Button>
      </div>
    </div>
  );
}
