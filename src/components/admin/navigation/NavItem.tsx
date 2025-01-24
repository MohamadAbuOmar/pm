import Link from 'next/link';
import { ReactNode } from 'react';

interface NavItemProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  active: boolean;
}

export function NavItem({ href, icon, children, active }: NavItemProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <Link 
      href={href}
      className={`
        group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
        ${active 
          ? 'bg-gray-200 text-gray-900 shadow-sm font-medium' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
        ${isRTL ? 'flex-row-reverse' : ''}
      `}
    >
      <span className={`flex min-w-[24px] items-center justify-center ${
        isRTL ? 'rotate-0' : ''
      }`}>
        {icon}
      </span>
      <span className={`${isRTL ? 'font-arabic' : 'font-sans'} text-sm`}>
        {children}
      </span>
    </Link>
  );
}
