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

  if (isPricePath || isGetStartedPath) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  if (isPlanPath) {
    return (
      <html lang="en">
        <body>
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
        <body>
          <ToolLayout toolName={toolName}>{children}</ToolLayout>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
