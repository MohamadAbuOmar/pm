import Link from 'next/link';
import { ReactNode } from 'react';

interface NavItemProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  active: boolean;
}

export function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-gray-200 text-gray-900 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
