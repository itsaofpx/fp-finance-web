import Footer from "@/components/Footer/page";
import HeroSection from "@/components/Hero/page";
import NavBar from "@/components/NavBar/page";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <HeroSection />
      <Footer />
    </div>
  );
}
