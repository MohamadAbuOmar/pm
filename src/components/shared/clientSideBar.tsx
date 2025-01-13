'use client'

import { AppSidebar } from '@/components/shared/sidebar'

export function ClientSidebar({ side }: { side: "left" | "right" }) {
    return <AppSidebar side={side} />
}

