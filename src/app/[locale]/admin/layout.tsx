'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Key,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent side="right">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const locale = pathname.split('/')[1];

  const isActive = (path: string) => pathname.endsWith(path);

  const navItems = [
    {
      href: `/${locale}/admin`,
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: t('sidebar.dashboard'),
      isActive: isActive('/admin')
    },
    {
      href: `/${locale}/admin/users`,
      icon: <Users className="w-5 h-5" />,
      label: t('sidebar.users'),
      isActive: isActive('/admin/users')
    },
    {
      href: `/${locale}/admin/roles`,
      icon: <Shield className="w-5 h-5" />,
      label: t('sidebar.roles'),
      isActive: isActive('/admin/roles')
    },
    {
      href: `/${locale}/admin/permissions`,
      icon: <Key className="w-5 h-5" />,
      label: t('sidebar.permissions'),
      isActive: isActive('/admin/permissions')
    }
  ];

  const t = useTranslations();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-background border-r">
          <nav className="flex-1 space-y-1 p-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('sidebar.dashboard')}</h2>
            </div>
            <div className="space-y-1">
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
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <nav className="flex-1 space-y-1 p-4">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t('sidebar.dashboard')}</h2>
              </div>
              <div className="space-y-1">
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
            </nav>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="md:hidden h-12" /> {/* Spacer for mobile menu button */}
          {children}
        </main>
      </div>
    </div>
  );
}
