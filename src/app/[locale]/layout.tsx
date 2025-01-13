import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/sidebar';
import "../globals.css";
import Header from '@/components/shared/header';
import dynamic from 'next/dynamic';
const ClientSidebar = dynamic(() => import('@/components/shared/clientSideBar').then(mod => mod.ClientSidebar), {
    ssr: false
});


export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = await params;
    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    const isRTL = locale === "ar";


    return (
        <html
            lang={locale}
            dir={isRTL ? "rtl" : "ltr"}
        >
            <body>
                <ClientSidebar side={isRTL ? "right" : "left"}>
                    {children}
                </ClientSidebar>
            </body>
        </html>
    );
}