'use client'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/shared/sidebar'

export function ClientSidebar({ children, side }: { children: React.ReactNode, side: "left" | "right" }) {
    return (
        <SidebarProvider>
            <AppSidebar side={side} />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}