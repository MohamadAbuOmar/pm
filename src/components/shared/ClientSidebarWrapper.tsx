'use client'

import dynamic from 'next/dynamic';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

const ClientSidebar = dynamic(() => import('@/components/shared/clientSideBar').then(mod => mod.ClientSidebar), {
    ssr: false
});

export function ClientSidebarWrapper({ children, side }: { children: React.ReactNode, side: "left" | "right" }) {
    return (
        <SidebarProvider>
            <ClientSidebar side={side} />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}

