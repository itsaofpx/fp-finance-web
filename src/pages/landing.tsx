import Footer from "@/components/Footer/landingFooter";
import HeroSection from "@/components/Hero/landingHero";
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