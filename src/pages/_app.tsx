import "@/styles/globals.css";
import type { AppProps } from "next/app";
import NavBar from "@/components/NavBar/page";
import Footer from "@/components/Footer/landingFooter";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen">
      <NavBar />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}
