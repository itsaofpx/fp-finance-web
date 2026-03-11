"use client";
import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar/page";
import Footer from "@/components/Footer/landingFooter";
import "@/styles/globals.css";
import ToolLayout from "@/components/Sidebar/toolSidebar";
import 'katex/dist/katex.min.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isToolPath = pathname.startsWith("/tool/");
  const isPricePath = pathname.startsWith("/pricing");
  const isGetStartedPath = pathname.startsWith("/get-started");
  const isPlanPath = pathname.startsWith("/plan");

  const bodyClass = "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen";

  if (isPricePath || isGetStartedPath) {
    return (
      <html lang="en">
        <body className={bodyClass}>{children}</body>
      </html>
    );
  }

  if (isPlanPath) {
    return (
      <html lang="en">
        <body className={bodyClass}>
          <NavBar />
          {children}
        </body>
      </html>
    );
  }

  if (isToolPath) {
    const toolName = pathname.replace("/tool/", "");
    return (
      <html lang="en">
        <body className={bodyClass}>
          <ToolLayout toolName={toolName}>{children}</ToolLayout>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={bodyClass}>
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
