'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Donor {
  id: number;
  arabicName: string | null;
  englishName: string | null;
  category?: {
    arabicName: string | null;
    englishName: string | null;
  } | null;
  email: string | null;
  phone: string | null;
  isPartner: number | null;
}

export function DonorTable() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDonors();
  }, [page]);

  async function fetchDonors() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/donors?page=${page}&pageSize=${pageSize}`);
      if (!res.ok) throw new Error('Failed to fetch donors');
      const data = await res.json();
      setDonors(data.donors);
      setTotalCount(data.totalCount);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

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
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left font-medium">ID</th>
              <th className="p-3 text-left font-medium">English Name</th>
              <th className="p-3 text-left font-medium">Arabic Name</th>
              <th className="p-3 text-left font-medium">Category</th>
              <th className="p-3 text-left font-medium">Email</th>
              <th className="p-3 text-left font-medium">Phone</th>
              <th className="p-3 text-left font-medium">Partner Status</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor) => (
              <tr key={donor.id} className="border-b">
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
                      Partner
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                      Non-Partner
                    </span>
                  )}
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
          Previous
        </Button>
        <div className="text-sm text-gray-600">
          Page {page} of {Math.ceil(totalCount / pageSize)}
        </div>
        <Button 
          variant="outline" 
          onClick={handleNextPage} 
          disabled={page * pageSize >= totalCount}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
