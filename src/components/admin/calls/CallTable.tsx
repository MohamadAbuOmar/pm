'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
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
import { CallForm } from './CallForm';
import { Plus, Search, Calendar } from 'lucide-react';
import { debounce } from '@/lib/utils/debounce';

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
  const locale = useLocale();
  const isRTL = locale === 'ar';
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
        
        {/* Date filters skeleton */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-6",
          isRTL && "font-arabic"
        )}>
          <div className={cn(
            "space-y-3",
            isRTL && "text-right"
          )}>
            <div className={cn(
              "h-5 bg-gray-100/80 rounded-md animate-pulse w-1/4",
              isRTL && "mr-auto"
            )}></div>
            <div className={cn(
              "flex gap-3",
              isRTL && "flex-row-reverse"
            )}>
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-gray-100/80 rounded-md animate-pulse w-1/3"></div>
                <div className="h-10 bg-gray-100/80 rounded-md animate-pulse"></div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-gray-100/80 rounded-md animate-pulse w-1/3"></div>
                <div className="h-10 bg-gray-100/80 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className={cn(
            "space-y-3",
            isRTL && "text-right"
          )}>
            <div className={cn(
              "h-5 bg-gray-100/80 rounded-md animate-pulse w-1/4",
              isRTL && "mr-auto"
            )}></div>
            <div className={cn(
              "flex gap-3",
              isRTL && "flex-row-reverse"
            )}>
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-gray-100/80 rounded-md animate-pulse w-1/3"></div>
                <div className="h-10 bg-gray-100/80 rounded-md animate-pulse"></div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-gray-100/80 rounded-md animate-pulse w-1/3"></div>
                <div className="h-10 bg-gray-100/80 rounded-md animate-pulse"></div>
              </div>
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
              "grid grid-cols-8 gap-4",
              isRTL && "text-right"
            )}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="h-6 bg-gray-100/80 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: pageSize }).map((_, idx) => (
              <div key={idx} className={cn(
                "grid grid-cols-8 gap-4",
                isRTL && "text-right"
              )}>
                {Array.from({ length: 8 }).map((_, cellIdx) => (
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
            "mb-4 border-destructive/50 text-destructive",
            isRTL && "font-arabic text-right"
          )}
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and filters */}
      <div className={cn(
        "flex flex-wrap items-center gap-4 mb-6",
        isRTL && "flex-row-reverse"
      )}>
        <div className="flex-1">
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
            <option value="name">{t('table.name')}</option>
            <option value="startDate">{t('table.startDate')}</option>
            <option value="endDate">{t('table.endDate')}</option>
            <option value="insertDate">{t('table.insertDate')}</option>
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

      {/* Date filters */}
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6",
        isRTL && "font-arabic"
      )}>
        <div className={cn(
          "space-y-3",
          isRTL && "text-right"
        )}>
          <label className={cn(
            "text-sm font-medium flex items-center gap-2 text-gray-700",
            isRTL && "flex-row-reverse justify-end"
          )}>
            <Calendar className="h-4 w-4 text-gray-500" />
            {t('filters.startDate')}
          </label>
          <div className={cn(
            "flex gap-3",
            isRTL && "flex-row-reverse"
          )}>
            <div className="flex-1 space-y-1.5">
              <label className={cn(
                "text-xs text-gray-500",
                isRTL && "block text-right"
              )}>
                {t('filters.from')}
              </label>
              <Input
                type="date"
                value={startDateFrom}
                onChange={(e) => {
                  setStartDateFrom(e.target.value);
                  setPage(1);
                }}
                className={cn(
                  "w-full transition-all duration-200 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm",
                  isRTL && "text-right",
                  "hover:border-gray-300"
                )}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className={cn(
                "text-xs text-gray-500",
                isRTL && "block text-right"
              )}>
                {t('filters.to')}
              </label>
              <Input
                type="date"
                value={startDateTo}
                onChange={(e) => {
                  setStartDateTo(e.target.value);
                  setPage(1);
                }}
                className={cn(
                  "w-full transition-all duration-200 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm",
                  isRTL && "text-right",
                  "hover:border-gray-300"
                )}
              />
            </div>
          </div>
        </div>
        <div className={cn(
          "space-y-3",
          isRTL && "text-right"
        )}>
          <label className={cn(
            "text-sm font-medium flex items-center gap-2 text-gray-700",
            isRTL && "flex-row-reverse justify-end"
          )}>
            <Calendar className="h-4 w-4 text-gray-500" />
            {t('filters.endDate')}
          </label>
          <div className={cn(
            "flex gap-3",
            isRTL && "flex-row-reverse"
          )}>
            <div className="flex-1 space-y-1.5">
              <label className={cn(
                "text-xs text-gray-500",
                isRTL && "block text-right"
              )}>
                {t('filters.from')}
              </label>
              <Input
                type="date"
                value={endDateFrom}
                onChange={(e) => {
                  setEndDateFrom(e.target.value);
                  setPage(1);
                }}
                className={cn(
                  "w-full transition-all duration-200 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm",
                  isRTL && "text-right",
                  "hover:border-gray-300"
                )}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className={cn(
                "text-xs text-gray-500",
                isRTL && "block text-right"
              )}>
                {t('filters.to')}
              </label>
              <Input
                type="date"
                value={endDateTo}
                onChange={(e) => {
                  setEndDateTo(e.target.value);
                  setPage(1);
                }}
                className={cn(
                  "w-full transition-all duration-200 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm",
                  isRTL && "text-right",
                  "hover:border-gray-300"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add new call button */}
      <div className={cn(
        "flex",
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
            "transition-all duration-200",
            isRTL && "font-arabic"
          )}>
            <DialogHeader>
              <DialogTitle className={cn(
                "text-lg font-semibold",
                isRTL && "text-right"
              )}>
                {selectedCall ? t('editCall') : t('addNewCall')}
              </DialogTitle>
            </DialogHeader>
            <CallForm
              call={selectedCall}
              onSuccess={handleFormSubmit}
              locale={locale}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Calls table */}
      <DataTable
        data={calls}
        className={cn(
          "rounded-md border shadow-sm bg-white",
          isRTL && "font-arabic"
        )}
        columns={[
          {
            key: 'id',
            header: t('table.id'),
            cell: (call) => (
              <span className={cn(
                "block font-medium tabular-nums",
                isRTL && "font-arabic text-right"
              )}>
                {call.id}
              </span>
            )
          },
          {
            key: 'name',
            header: t('table.name'),
            cell: (call) => (
              <div className={cn(
                "font-medium line-clamp-1",
                isRTL && "text-right font-arabic"
              )}>
                {call.name}
              </div>
            )
          },
          {
            key: 'focalPoint',
            header: t('table.focalPoint'),
            cell: (call) => (
              <span className={cn(
                "block text-muted-foreground",
                isRTL && "font-arabic text-right"
              )}>
                {call.focalPoint || '-'}
              </span>
            )
          },
          {
            key: 'budget',
            header: t('table.budget'),
            cell: (call) => (
              <span className={cn(
                "block font-medium tabular-nums",
                isRTL ? "font-arabic text-right" : "text-left"
              )}>
                {call.budget || '-'}
              </span>
            )
          },
          {
            key: 'currency',
            header: t('table.currency'),
            cell: (call) => (
              <span className={cn(
                "block text-muted-foreground",
                isRTL && "font-arabic text-right"
              )}>
                {call.currency}
              </span>
            )
          },
          {
            key: 'donor',
            header: t('table.donor'),
            cell: (call) => (
              <div className={cn(
                "flex flex-col gap-0.5",
                isRTL && "items-end font-arabic"
              )}>
                <span className="font-medium">
                  {isRTL ? call.donor.arabicName : call.donor.englishName || '-'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {isRTL ? call.donor.englishName : call.donor.arabicName || '-'}
                </span>
              </div>
            )
          },
          {
            key: 'startDate',
            header: t('table.startDate'),
            cell: (call) => (
              <div className={cn(
                "whitespace-nowrap text-muted-foreground",
                isRTL && "text-right font-arabic"
              )}>
                {call.startDate
                  ? new Date(call.startDate).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : '-'}
              </div>
            )
          },
          {
            key: 'endDate',
            header: t('table.endDate'),
            cell: (call) => (
              <div className={cn(
                "whitespace-nowrap text-muted-foreground",
                isRTL && "text-right font-arabic"
              )}>
                {call.endDate
                  ? new Date(call.endDate).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : '-'}
              </div>
            )
          },
          {
            key: 'actions',
            header: t('table.actions'),
            cell: (call) => (
              <div className={cn(
                "flex items-center gap-2",
                isRTL && "flex-row-reverse justify-start"
              )}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(call)}
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
                  onClick={() => handleDelete(call.id)}
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
        "flex items-center justify-between",
        isRTL && "flex-row-reverse"
      )}>
        <Button 
          variant="outline" 
          onClick={handlePrevPage} 
          disabled={page <= 1}
          className={cn(
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
            isRTL && "font-arabic"
          )}
        >
          {ct('actions.next')}
        </Button>
      </div>
    </div>
  );
}
