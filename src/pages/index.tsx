import Footer from "@/components/Footer/page";
import { CTASection, HeroSection, StatsSection } from "@/components/Hero/page";
import NavBar from "@/components/NavBar/page";

export default function Home() {
  return (
    <div className="min-h-screen">
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes countUp {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .animate-countUp {
          animation: countUp 0.8s ease-out;
        }
      `}</style>

      <NavBar />
      <HeroSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
