'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
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
        
        {/* Category and region filters skeleton */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-4",
          isRTL && "font-arabic"
        )}>
          <div className="h-10 bg-gray-100/80 rounded-md animate-pulse"></div>
          <div className="h-10 bg-gray-100/80 rounded-md animate-pulse"></div>
          <div className="h-10 bg-gray-100/80 rounded-md animate-pulse"></div>
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
              "grid grid-cols-7 gap-4",
              isRTL && "text-right"
            )}>
              {Array.from({ length: 7 }).map((_, idx) => (
                <div key={idx} className="h-6 bg-gray-100/80 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: pageSize }).map((_, idx) => (
              <div key={idx} className={cn(
                "grid grid-cols-7 gap-4",
                isRTL && "text-right"
              )}>
                {Array.from({ length: 7 }).map((_, cellIdx) => (
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
    <div className="space-y-4">
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
        "flex flex-wrap items-center gap-4",
        isRTL && "flex-row-reverse"
      )}>
        <div className="flex-1 min-w-[200px]">
          <div className="relative group">
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors group-hover:text-gray-500",
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
                "transition-all duration-200 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm",
                isRTL ? "pr-9 font-arabic text-right" : "pl-9",
                "placeholder:text-gray-400 hover:border-gray-300"
              )}
            />
          </div>
        </div>
        <div className={cn(
          "flex gap-3",
          isRTL && "flex-row-reverse"
        )}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className={cn(
              "w-44 transition-all duration-200 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm",
              isRTL && "font-arabic text-right",
              "hover:border-gray-300"
            )}
          >
            <option value="id">{t('table.id')}</option>
            <option value="englishName">{t('table.englishName')}</option>
            <option value="arabicName">{t('table.arabicName')}</option>
            <option value="createdAt">{t('table.createdAt')}</option>
          </Select>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className={cn(
              "w-44 transition-all duration-200 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm",
              isRTL && "font-arabic text-right",
              "hover:border-gray-300"
            )}
          >
            <option value="asc">{t('sort.ascending')}</option>
            <option value="desc">{t('sort.descending')}</option>
          </Select>
        </div>
      </div>

      {/* Category and region filters */}
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 mt-4",
        isRTL && "font-arabic"
      )}>
        <Select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className={cn(
            "transition-all duration-200 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm",
            isRTL && "text-right",
            "hover:border-gray-300"
          )}
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
          className={cn(
            "transition-all duration-200 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm",
            isRTL && "text-right",
            "hover:border-gray-300"
          )}
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
          className={cn(
            "transition-all duration-200 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm",
            isRTL && "text-right",
            "hover:border-gray-300"
          )}
        >
          <option value="">{t('filters.allPartnerStatus')}</option>
          <option value="1">{ct('status.partner')}</option>
          <option value="0">{ct('status.nonPartner')}</option>
        </Select>
      </div>

      {/* Add new donor button */}
      <div className={cn(
        "flex mt-6",
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
      <DataTable
        data={donors}
        className={cn(
          "rounded-md border shadow-sm bg-white mt-6",
          isRTL && "font-arabic"
        )}
        columns={[
          {
            key: 'id',
            header: t('table.id'),
            cell: (donor) => (
              <span className={cn(
                "block font-medium tabular-nums",
                isRTL && "font-arabic text-right"
              )}>
                {donor.id}
              </span>
            )
          },
          {
            key: 'englishName',
            header: t('table.englishName'),
            cell: (donor) => (
              <div className={cn(
                "font-medium line-clamp-1",
                isRTL && "text-right font-arabic"
              )}>
                {donor.englishName || '-'}
              </div>
            )
          },
          {
            key: 'arabicName',
            header: t('table.arabicName'),
            cell: (donor) => (
              <div className={cn(
                "font-medium line-clamp-1",
                isRTL && "text-right font-arabic"
              )}>
                {donor.arabicName || '-'}
              </div>
            )
          },
          {
            key: 'category',
            header: t('table.category'),
            cell: (donor) => donor.category ? (
              <div className={cn(
                "flex flex-col gap-0.5",
                isRTL && "items-end font-arabic"
              )}>
                <span className="font-medium">
                  {isRTL ? donor.category.arabicName : donor.category.englishName || '-'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {isRTL ? donor.category.englishName : donor.category.arabicName || '-'}
                </span>
              </div>
            ) : '-'
          },
          {
            key: 'email',
            header: t('table.email'),
            cell: (donor) => (
              <span className={cn(
                "block text-muted-foreground",
                isRTL && "text-right"
              )}>
                {donor.email || '-'}
              </span>
            )
          },
          {
            key: 'phone',
            header: t('table.phone'),
            cell: (donor) => (
              <span className={cn(
                "block font-medium tabular-nums",
                isRTL && "text-right"
              )}>
                {donor.phone || '-'}
              </span>
            )
          },
          {
            key: 'partnerStatus',
            header: t('table.partnerStatus'),
            cell: (donor) => (
              <div className={cn(
                "flex",
                isRTL && "justify-end"
              )}>
                {donor.isPartner ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    {ct('status.partner')}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    {ct('status.nonPartner')}
                  </span>
                )}
              </div>
            )
          },
          {
            key: 'actions',
            header: t('table.actions'),
            cell: (donor) => (
              <div className={cn(
                "flex items-center gap-2",
                isRTL && "flex-row-reverse justify-start"
              )}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(donor)}
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
                  onClick={() => handleDelete(donor.id)}
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

      {/* Pagination */}
      <div className={cn(
        "flex items-center justify-between mt-6",
        isRTL && "flex-row-reverse"
      )}>
        <Button 
          variant="outline" 
          onClick={handlePrevPage} 
          disabled={page <= 1}
          className={cn(
            "transition-colors hover:bg-primary/10",
            isRTL && "font-arabic"
          )}
        >
          {ct('actions.previous')}
        </Button>
        <div className={cn(
          "text-sm text-gray-600",
          isRTL && "font-arabic"
        )}>
          {ct('pagination.page')} {page} {ct('pagination.of')} {Math.ceil(totalCount / pageSize)}
        </div>
        <Button 
          variant="outline" 
          onClick={handleNextPage} 
          disabled={page * pageSize >= totalCount}
          className={cn(
            "transition-colors hover:bg-primary/10",
            isRTL && "font-arabic"
          )}
        >
          {ct('actions.next')}
        </Button>
      </div>
    </div>
  );
}
