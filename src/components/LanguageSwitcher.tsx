'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  
  const toggleLocale = currentLocale === 'en' ? 'ar' : 'en';
  const newPath = pathname.replace(`/${currentLocale}`, `/${toggleLocale}`);
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-2"
      asChild
    >
      <Link href={newPath}>
        <Languages className="h-4 w-4" />
        <span>{toggleLocale === 'ar' ? 'العربية' : 'English'}</span>
      </Link>
    </Button>
  );
}
