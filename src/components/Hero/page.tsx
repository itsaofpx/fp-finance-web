import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, PieChart, List, Wrench, BookOpen } from "lucide-react";

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

export const HeroSection = () => {
  const [heroRef, heroInView] = useInView();

  return (
    <section
      ref={heroRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16 relative overflow-hidden"
    >
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 animate-pulse"></div>

      <div className="container mx-auto px-4 py-56 relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Main Heading */}
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white transition-all duration-1000 ${
              heroInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            เริ่มศึกษาการลงทุนของ{" "}
            <span className="text-blue-400 animate-pulse">เริ่มต้นที่นี่</span>{" "}
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl transition-all duration-1000 delay-300 ${
              heroInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            แพลตฟอร์มการเรียนรู้ด้านการลงทุนและเครื่องมือที่ครบครัน
            ออกแบบมาเพื่อช่วยให้คุณวางแผนชีวิต
            ลงทุนและเติบโตทางการเงินด้วยความมั่นใจ
          </p>

          {/* Feature Icons */}
          <div
            className={`flex flex-wrap justify-center gap-6 mb-10 transition-all duration-1000 delay-500 ${
              heroInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {[
              {
                icon: PieChart,
                text: "ระบบวางแผนชีวิต",
                color: "text-green-400",
              },
              { icon: List, text: "รายชื่อหุ้น", color: "text-blue-400" },
              {
                icon: Wrench,
                text: "เครื่องมือในการลงทุน",
                color: "text-purple-400",
              },
              {
                icon: BookOpen,
                text: "บทความสำหรับหุ้น",
                color: "text-orange-400",
              },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-sm text-gray-300 transform transition-all duration-500 hover:scale-110 ${
                    heroInView ? "animate-fadeInUp" : ""
                  }`}
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <IconComponent className={`w-5 h-5 ${item.color}`} />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <button
            className={`group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105 transform ${
              heroInView
                ? "opacity-100 translate-y-0 animate-bounce"
                : "opacity-0 translate-y-10"
            }`}
          >
            เริ่มต้นเลย
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
          </button>
        </div>
      </div>

      <style jsx>{`
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
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out both;
        }
      `}</style>
    </section>
  );
};

export const StatsSection = () => {
  const [statsRef, statsInView] = useInView();

  return (
    <section ref={statsRef} className="bg-gray-800 py-20">
      <div className="container mx-auto px-4">
        <div
          className={`bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden transform transition-all duration-1000 ${
            statsInView
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-20 scale-95"
          }`}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 animate-shimmer"></div>
          <div className="p-8">
            {/* Header */}
            <div
              className={`text-center mb-12 transition-all duration-1000 delay-300 ${
                statsInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                พฤติกรรมการออมและการลงทุนของคนไทย
              </h2>
              <p className="text-gray-400 text-lg">
                ข้อมูลจากการสำรวจพฤติกรรมการออมของครัวเรือนไทย
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  title: 'คนไทยที่ "ออมด้วยการลงทุน"',
                  value: "2.7%",
                  subtitle: "จากครัวเรือนทั้งหมด",
                  color: "text-green-400",
                  bgColor: "from-green-400/20 to-green-600/20",
                  borderColor: "border-green-400/30",
                },
                {
                  title: "เก็บเงินสด",
                  value: "75.4%",
                  subtitle: "วิธีการออมยอดนิยม",
                  color: "text-yellow-400",
                  bgColor: "from-yellow-400/20 to-yellow-600/20",
                  borderColor: "border-yellow-400/30",
                },
                {
                  title: "บัญชีออมทรัพย์",
                  value: "53.3%",
                  subtitle: "การออมแบบดั้งเดิม",
                  color: "text-blue-400",
                  bgColor: "from-blue-400/20 to-blue-600/20",
                  borderColor: "border-blue-400/30",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${stat.bgColor} border ${
                    stat.borderColor
                  } p-8 rounded-2xl transform transition-all duration-700 hover:scale-105 hover:shadow-xl ${
                    statsInView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${500 + index * 200}ms` }}
                >
                  <h3 className="text-sm font-medium text-gray-300 mb-4">
                    {stat.title}
                  </h3>
                  <p
                    className={`text-5xl font-bold ${stat.color} mb-2 animate-countUp`}
                  >
                    {stat.value}
                  </p>
                  <p className={`text-sm ${stat.color} opacity-80`}>
                    {stat.subtitle}
                  </p>
                </div>
              ))}
            </div>

            {/* Detailed Breakdown */}
            <div
              className={`bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-2xl p-8 border border-gray-600 transition-all duration-1000 delay-700 ${
                statsInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <h3 className="text-2xl font-semibold text-white mb-8 text-center">
                การแบ่งประเภทการออมของคนไทย
              </h3>

              <div className="space-y-6">
                {[
                  {
                    label: "ออมด้วยการลงทุน",
                    value: "2.7%",
                    color: "bg-green-400",
                    textColor: "text-green-400",
                  },
                  {
                    label: "เก็บเงินสด",
                    value: "75.4%",
                    color: "bg-yellow-400",
                    textColor: "text-yellow-400",
                  },
                  {
                    label: "บัญชีออมทรัพย์",
                    value: "53.3%",
                    color: "bg-blue-400",
                    textColor: "text-blue-400",
                  },
                  {
                    label: "การออมแบบดั้งเดิม (ไม่ก่อผลตอบแทน)",
                    value: "97.3%",
                    color: "bg-red-400",
                    textColor: "text-red-400",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`bg-gray-600/50 p-6 rounded-xl border border-gray-500/30 transform transition-all duration-700 hover:scale-[1.02] ${
                      statsInView
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-10"
                    }`}
                    style={{ transitionDelay: `${900 + index * 150}ms` }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span
                        className={`${item.textColor} font-semibold text-lg`}
                      >
                        {item.label}
                      </span>
                      <span className="text-white font-bold text-xl">
                        {item.value}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className={`${item.color} h-4 rounded-full transition-all duration-2000 ease-out`}
                        style={{
                          width: statsInView ? item.value : "0%",
                          transitionDelay: `${1200 + index * 200}ms`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Insights */}
              <div
                className={`mt-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 rounded-xl p-6 transform transition-all duration-1000 delay-1200 ${
                  statsInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-orange-400 font-semibold text-lg">
                    ข้อมูลเด่น
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  คนไทยส่วนใหญ่ยังคงเลือกวิธีการออมที่ไม่ก่อให้เกิดผลตอบแทน
                  โดยมีเพียง{" "}
                  <span className="text-green-400 font-bold text-xl">2.7%</span>{" "}
                  เท่านั้น ที่เลือกออมด้วยการลงทุน
                  ซึ่งแสดงให้เห็นถึงโอกาสในการพัฒนาความรู้ด้านการลงทุน
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
    </section>
  );
};

export const CTASection = () => {
  const [ctaRef, ctaInView] = useInView();

  return (
    <section
      ref={ctaRef}
      className="bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 py-20"
    >
      <div className="container mx-auto px-4">
        <div
          className={`text-center max-w-4xl mx-auto transform transition-all duration-1000 ${
            ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
          }`}
        >
          <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50 rounded-3xl p-12 backdrop-blur-sm">
            <h3
              className={`text-4xl font-bold text-white mb-6 transition-all duration-1000 delay-300 ${
                ctaInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              เป็นส่วนหนึ่งของ{" "}
              <span className="text-green-400 animate-pulse">2.7%</span>{" "}
              ที่ออมอย่างฉลาด
            </h3>
            <p
              className={`text-xl text-gray-300 mb-8 leading-relaxed transition-all duration-1000 delay-500 ${
                ctaInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              เริ่มศึกษาการลงทุนที่เหมาะสมกับคุณ เพื่ออนาคตทางการเงินที่มั่นคง
            </p>
            <button
              className={`bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-12 py-4 rounded-full text-xl font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-2xl ${
                ctaInView
                  ? "opacity-100 translate-y-0 animate-bounce"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ animationDelay: "700ms" }}
            >
              🚀 เริ่มศึกษาการลงทุนวันนี้
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
