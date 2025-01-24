'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Key,
  HandHeart,
  Globe,
  PhoneCall
} from 'lucide-react';
import { NavItem } from './NavItem';

export function NavItems() {
  const pathname = usePathname();
  const t = useTranslations('admin.layout.navigation');
  const locale = pathname.split('/')[1];
  
  const isActive = (path: string) => pathname.endsWith(path);

  const navItems = [
    {
      href: `/${locale}/admin`,
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: t('dashboard'),
      isActive: isActive('/admin')
    },
    {
      href: `/${locale}/admin/users`,
      icon: <Users className="w-5 h-5" />,
      label: t('users'),
      isActive: isActive('/admin/users')
    },
    {
      href: `/${locale}/admin/roles`,
      icon: <Shield className="w-5 h-5" />,
      label: t('roles'),
      isActive: isActive('/admin/roles')
    },
    {
      href: `/${locale}/admin/permissions`,
      icon: <Key className="w-5 h-5" />,
      label: t('permissions'),
      isActive: isActive('/admin/permissions')
    },
    {
      href: `/${locale}/admin/donors`,
      icon: <HandHeart className="w-5 h-5" />,
      label: t('donors'),
      isActive: isActive('/admin/donors')
    },
    {
      href: `/${locale}/admin/regions`,
      icon: <Globe className="w-5 h-5" />,
      label: t('regions'),
      isActive: isActive('/admin/regions')
    },
    {
      href: `/${locale}/admin/calls`,
      icon: <PhoneCall className="w-5 h-5" />,
      label: t('calls'),
      isActive: isActive('/admin/calls')
    }
  ];

  return (
    <div className="space-y-1 [&>a]:w-full">
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          active={item.isActive}
        >
          {item.label}
        </NavItem>
      ))}
    </div>
  );
}
