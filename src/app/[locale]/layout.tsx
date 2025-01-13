import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import "../globals.css";
import { ClientSidebarWrapper } from '@/components/shared/ClientSidebarWrapper';
import { NextIntlClientProvider } from 'next-intl';



export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = await params;
    if (!routing.locales.includes(locale as "en" | "ar")) {
        notFound();
    }
    const messages = await getMessages();
    const isRTL = locale === "ar";
    return (
        <html
            lang={locale}
            dir={isRTL ? "rtl" : "ltr"}
        >
            <body>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <ClientSidebarWrapper side={isRTL ? "right" : "left"}>
                        {children}
                    </ClientSidebarWrapper>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}