import React, { useState, useEffect, useRef } from "react";
import { Github, Linkedin, Twitter } from "lucide-react";

// Hook for intersection observer - แก้ไข TypeScript errors
const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsInView(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.1, ...options }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasAnimated, options]);

  return [ref, isInView] as const;
};

const Footer = () => {
  const [footerRef, footerInView] = useInView();

  return (
    <footer ref={footerRef} className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div
          className={`grid grid-cols-1 md:grid-cols-4 gap-8 transition-all duration-1000 ${
            footerInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="text-2xl font-bold text-white mb-6 animate-fadeIn">
              Finance Pro
            </div>
            <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
              พาร์ทเนอร์ที่เชื่อถือได้ในการเติบโตทางการเงินและการบริหารความมั่งคั่งของคุณ
            </p>
          </div>

          {/* Product Links */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              footerInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-white font-semibold mb-6 text-lg">ผลิตภัณฑ์</h3>
            <div className="space-y-3">
              {[
                "ระบบวางแผนชีวิต",
                "รายชื่อหุ้น",
                "เครื่องมือลงทุน",
                "บทความหุ้น",
              ].map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className="block text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div
            className={`transition-all duration-1000 delay-500 ${
              footerInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-white font-semibold mb-6 text-lg">
              ข้อมูลทางกฎหมาย
            </h3>
            <div className="space-y-3">
              {["ข้อกำหนดการใช้งาน", "นโยบายความเป็นส่วนตัว", "ติดต่อเรา"].map(
                (item, index) => (
                  <a
                    key={index}
                    href="#"
                    className="block text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2"
                  >
                    {item}
                  </a>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className={`border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center transition-all duration-1000 delay-700 ${
            footerInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Finance Pro. สงวนลิขสิทธิ์.
          </div>

          {/* Social Links */}
          <div className="flex space-x-6">
            {[
              { Icon: Github, href: "#" },
              { Icon: Twitter, href: "#" },
              { Icon: Linkedin, href: "#" },
            ].map(({ Icon, href }, index) => (
              <a
                key={index}
                href={href}
                className="text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-125 hover:rotate-12"
              >
                <Icon className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </footer>
  );
};

export default Footer;