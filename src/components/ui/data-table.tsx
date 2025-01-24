'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    cell: (item: T) => React.ReactNode;
    className?: string;
  }[];
  className?: string;
}

export function DataTable<T>({ data, columns, className }: DataTableProps<T>) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className={cn('rounded-md border', className)}>
      <div className="w-full overflow-auto">
        <table className={cn(
          "w-full caption-bottom text-sm",
          isRTL && "font-arabic"
        )}>
          <thead className={cn(
            'border-b bg-gray-50/80 transition-colors',
            isRTL && '[&_tr]:flex-row-reverse'
          )}>
            <tr className={cn(
              "border-b transition-colors hover:bg-gray-50/50",
              isRTL && "flex-row-reverse"
            )}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'h-12 px-4 align-middle font-medium text-gray-500',
                    isRTL ? 'text-right' : 'text-left',
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn(
            '[&_tr:last-child]:border-0',
            isRTL && '[&_tr]:flex-row-reverse'
          )}>
            {(data || []).map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b transition-colors hover:bg-gray-50/50",
                  isRTL && "flex-row-reverse"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'p-4 align-middle',
                      isRTL ? 'text-right' : 'text-left',
                      column.className
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
