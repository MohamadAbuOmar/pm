'use client'

import { BookCheck, Calendar, BarChartIcon as ChartSpline, ChevronLeft, ChevronRight, HandCoins, LayoutDashboard, LeafyGreen, Newspaper, ShoppingBasket, Users } from 'lucide-react'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { useTranslations } from "next-intl"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

export function AppSidebar({ side }: { side: "left" | "right" }) {
    const t = useTranslations("sidebar")
    const items = [
        {
            title: t("dashboard"),
            url: "#",
            icon: LayoutDashboard,
        },
        {
            title: t("fundraising"),
            url: "#",
            icon: HandCoins,
            subItem: [
                {
                    title: t("donors"),
                    url: "#"
                },
                {
                    title: t("calls"),
                    url: "#"
                },
                {
                    title: t("proposals"),
                    url: "#"
                },
                {
                    title: t("opportunities"),
                    url: "#"
                }
            ]
        },
        {
            title: t("projects"),
            url: "#",
            icon: BookCheck,
            subItem: [
                {
                    title: t("myProjects"),
                    url: "#"
                },
                {
                    title: t("activities"),
                    url: "#"
                },
            ],
        },
        {
            title: t("procurements"),
            url: "#",
            icon: ShoppingBasket,
            subItem: [
                {
                    title: t("suppliers"),
                    url: "#"
                },
                {
                    title: t("tenders"),
                    url: "#"
                },
                {
                    title: t("blackList"),
                    url: "#"
                },
                {
                    title: t("committees"),
                    url: "#"
                }
            ]
        },
        {
            title: t("mediaReports"),
            url: "#",
            icon: ChartSpline,
        },
        {
            title: t("reports"),
            url: "#",
            icon: Newspaper,
        },
        {
            title: t("myFollowUp"),
            url: "#",
            icon: Users,
        },
        {
            title: t("myCalender"),
            url: "#",
            icon: Calendar,
        },
    ]
    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-gPrimary-900 text-gPrimary-50 sidebar" side={side} >
            <SidebarHeader>
                <SidebarMenuButton
                    size="lg"
                    className="hover:bg-gPrimary-200 hover:text-gPrimary-400"
                >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <LeafyGreen className="size-4" />
                    </div>
                    <div className={`grid flex-1 text-sm leading-tight ${side == "right" ? "text-right" : "text-left"}`}>
                        <span className="truncate font-semibold">
                            Ahmed Acn
                        </span>
                        <span className="truncate text-xs">Enterprise</span>
                    </div>
                </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {items.map((item) => (
                        item.subItem ?
                            <Collapsible
                                key={item.title}
                                asChild
                                className="group/collapsible"
                            >
                                <SidebarMenuItem className="p-2">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="hover:text-gPrimary-400" tooltip={item.title}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            {
                                                side === "left" ?
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" /> :
                                                    <ChevronLeft className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-90" />
                                            }
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.subItem.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title} >
                                                    <SidebarMenuSubButton asChild className="hover:text-gPrimary-400">
                                                        <a href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </a>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                            :
                            <SidebarMenuItem key={item.title} className="p-2" >
                                <SidebarMenuButton asChild className="hover:text-gPrimary-400">
                                    <a href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

