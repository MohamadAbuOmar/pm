'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Key,
  Menu,
  X,
  Lock
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const locale = pathname.split('/')[1];

  const isActive = (path: string) => pathname.endsWith(path);

  const navItems = [
    {
      href: `/${locale}/admin`,
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      isActive: isActive('/admin')
    },
    {
      href: `/${locale}/admin/users`,
      icon: <Users className="w-5 h-5" />,
      label: 'Manage Users',
      isActive: isActive('/admin/users')
    },
    {
      href: `/${locale}/admin/roles`,
      icon: <Shield className="w-5 h-5" />,
      label: 'Manage Roles',
      isActive: isActive('/admin/roles')
    },
    {
      href: `/${locale}/admin/permissions`,
      icon: <Key className="w-5 h-5" />,
      label: 'Manage Permissions',
      isActive: isActive('/admin/permissions')
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-gray-50 border-r transform transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:shadow-none shadow-lg
        `}
      >
        <nav className="p-4 space-y-2 h-full overflow-y-auto">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          </div>
          <div className="space-y-4">
            <NavItem
              href={`/${locale}/admin`}
              icon={<LayoutDashboard className="w-5 h-5" />}
              active={isActive('/admin')}
            >
              Dashboard
            </NavItem>
            
            <Accordion type="single" collapsible className="border-none">
              <AccordionItem value="auth" className="border-none">
                <AccordionTrigger className="py-2 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5" />
                    <span className="font-medium">Authentication</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pl-8">
                    <NavItem
                      href={`/${locale}/admin/users`}
                      icon={<Users className="w-5 h-5" />}
                      active={isActive('/admin/users')}
                    >
                      Manage Users
                    </NavItem>
                    <NavItem
                      href={`/${locale}/admin/roles`}
                      icon={<Shield className="w-5 h-5" />}
                      active={isActive('/admin/roles')}
                    >
                      Manage Roles
                    </NavItem>
                    <NavItem
                      href={`/${locale}/admin/permissions`}
                      icon={<Key className="w-5 h-5" />}
                      active={isActive('/admin/permissions')}
                    >
                      Manage Permissions
                    </NavItem>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-0 ml-0">
        <div className="md:hidden h-12" /> {/* Spacer for mobile menu button */}
        {children}
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
