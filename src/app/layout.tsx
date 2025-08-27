"use client";
import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar/page";
import Footer from "@/components/Footer/landingFooter";
import "@/styles/globals.css";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if the path starts with /tool/
  const isToolPath = pathname.startsWith("/tool/");

  if (isToolPath) {
    return (
      <html lang="en">
        <body>
          {children}
          <DisclaimerFooter />
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
