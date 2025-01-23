import { ibmPlexSans } from "@/styles/fonts";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={ibmPlexSans.variable}>
        {children}
      </body>
    </html>
  );
}
