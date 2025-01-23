'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  Menu,
  X
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  active?: boolean;
}

function NavItem({ href, icon, title, description, active }: NavItemProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group',
                  active 
                    ? 'bg-accent text-accent-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                )}
              >
                <span className="flex shrink-0 items-center justify-center">
                  {icon}
                </span>
                <span className="font-medium truncate md:opacity-100 opacity-0 transition-all duration-200 group-hover:opacity-100">
                  {title}
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="md:hidden">
              {title}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="hidden md:block">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => pathname.endsWith(path);

  const locale = pathname.split('/')[1] || 'en';
  
  const navItems = [
    {
      href: `/${locale}/admin`,
      icon: <LayoutDashboard className="w-5 h-5" />,
      title: 'Dashboard',
      description: 'Overview of your admin dashboard',
      isActive: isActive('/admin')
    },
    {
      href: `/${locale}/admin/users`,
      icon: <Users className="w-5 h-5" />,
      title: 'Manage Users',
      description: 'Create and manage user accounts',
      isActive: isActive('/admin/users')
    },
    {
      href: `/${locale}/admin/roles`,
      icon: <Shield className="w-5 h-5" />,
      title: 'Manage Roles',
      description: 'Configure user roles and permissions',
      isActive: isActive('/admin/roles')
    },
    {
      href: `/${locale}/admin/permissions`,
      icon: <Key className="w-5 h-5" />,
      title: 'Manage Permissions',
      description: 'Set up system permissions',
      isActive: isActive('/admin/permissions')
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-20 hover:w-64 flex-col bg-background border-r transition-all duration-300 ease-in-out">
        <nav className="flex-1 space-y-1 p-4">
          <div className="mb-8 flex items-center justify-between overflow-hidden">
            <h2 className="text-xl font-semibold truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">Admin Dashboard</h2>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                title={item.title}
                description={item.description}
                active={item.isActive}
              />
            ))}
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <nav className="flex-1 space-y-1 p-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  active={item.isActive}
                />
              ))}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
