import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Separator } from '../ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb'

export default function Header() {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className='flex justify-between'>
            </div>
        </header>
    )
}