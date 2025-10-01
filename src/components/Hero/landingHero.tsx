"use client";

import {
  ArrowRight,
  PieChart,
  List,
  Wrench,
  BookOpen,
  ExternalLink,
  Calendar,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface INewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  estimatedReadTime: number;
  createdAt: string;
  updatedAt: string;
  scrapedContent: string;
}

interface INewsResponse {
  current_page: number;
  data: INewsArticle[];
  pages: number;
  per_page: number;
  total: number;
}

interface IFeature {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  color: string;
}

interface ITool {
  title: string;
  description: string;
  path: string;
  icon: string;
  category: string;
}

const features: IFeature[] = [
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
];

const topTools: ITool[] = [
  {
    title: "คำนวณค่าเฉลี่ยหุ้น",
    description: "คำนวณราคาเฉลี่ยของหุ้นเพื่อวางแผนการลงทุน",
    path: "tool/average-calculator",
    icon: "📊",
    category: "การวิเคราะห์",
  },
  {
    title: "แบ่งเงินลงทุนกับเงินสดเก็บออม",
    description: "จัดสรรเงินระหว่างการลงทุนและการออมอย่างสมดุล",
    path: "tool/money-allocation",
    icon: "💰",
    category: "การจัดสรร",
  },
  {
    title: "คำนวณดอกเบี้ยทบต้น",
    description: "คำนวณการเติบโตของเงินด้วยดอกเบี้ยทบต้น",
    path: "tool/compound-interest",
    icon: "📈",
    category: "การคำนวณ",
  },
];

const handleLogin = async (): Promise<void> => {
  try {
    window.location.href = "http://localhost:3001/auth/google/login";
  } catch (error) {
    console.log(error);
  }
};

const HeroSection: React.FC = () => {
  const [news, setNews] = useState<INewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNews = async (): Promise<void> => {
      try {
        const response = await fetch(
          "http://localhost:3002/news/?page=1&per_page=3"
        );
        const data: INewsResponse = await response.json();
        setNews(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleNewsClick = (url: string): void => {
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Hero Section - Full Screen */}
      <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16 flex items-center justify-center">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight">
              เริ่มศึกษาการลงทุน{" "}
              <span className="text-blue-400">เริ่มต้นที่นี่</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              แพลตฟอร์มการเรียนรู้ด้านการลงทุนและเครื่องมือที่ครบครัน
              ออกแบบมาเพื่อช่วยให้คุณวางแผนชีวิต
              ลงทุนและเติบโตทางการเงินด้วยความมั่นใจ
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {features.map((item: IFeature, index: number) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-gray-300 transition-all duration-300 hover:scale-110 hover:text-white"
                  >
                    <IconComponent className={`w-6 h-6 ${item.color}`} />
                    <span className="text-lg font-medium">{item.text}</span>
                  </div>
                );
              })}
            </div>

            <button
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 mx-auto"
              onClick={handleLogin}
            >
              เริ่มต้นเลย
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-gray-900 py-20">
        <div className="container mx-auto px-6">
          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
            {/* Top 3 Tools Section */}
            <div>
              <div className="text-center lg:text-left mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  เครื่องมือยอดนิยม
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  เครื่องมือที่ได้รับความนิยมสูงสุดจากผู้ใช้งาน
                  ช่วยให้การลงทุนของคุณง่ายและแม่นยำยิ่งขึ้น
                </p>
              </div>

              <div className="space-y-6">
                {topTools.map((tool: ITool, index: number) => (
                  <Link key={index} href={tool.path} className="group block">
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 overflow-hidden group-hover:bg-gray-800/80 transform hover:-translate-y-1 hover:shadow-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-gray-700/70 transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                          {tool.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs font-medium rounded-full">
                              {tool.category}
                            </span>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors flex-shrink-0" />
                          </div>

                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gray-100 transition-colors duration-300 leading-tight">
                            {tool.title}
                          </h3>
                          <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors duration-300">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center lg:text-left mt-8">
                <Link
                  href="/tool"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold text-lg group"
                >
                  ดูเครื่องมือทั้งหมด
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Latest News Section */}
            <div>
              <div className="text-center lg:text-left mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  ข่าวสารล่าสุด
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  ติดตามข่าวสารและความรู้ด้านการลงทุนล่าสุด
                  เพื่อให้คุณตัดสินใจได้อย่างมีข้อมูล
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {news.map((article: INewsArticle, index: number) => (
                    <div
                      key={article.id}
                      className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 overflow-hidden hover:bg-gray-800/80 transform hover:-translate-y-1 hover:shadow-xl group cursor-pointer p-6"
                      onClick={() => handleNewsClick(article.url)}
                    >
                      {/* Header with date and reading time */}
                      <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{article.estimatedReadTime} นาที</span>
                          </div>
                          <ExternalLink className="w-4 h-4 group-hover:text-gray-300 transition-colors" />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-gray-100 transition-colors duration-300 leading-tight line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors duration-300 line-clamp-2 mb-4">
                        {article.description}
                      </p>

                      {/* Footer with source */}
                      <div className="pt-4 border-t border-gray-700/50">
                        <span className="text-gray-400 text-xs font-medium">
                          แหล่งที่มา: {article.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center lg:text-left mt-8">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors font-semibold text-lg group"
                >
                  ดูข่าวสารทั้งหมด
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
