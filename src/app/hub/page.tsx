"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  PiggyBank,
  Target,
  User,
  Zap,
  Cpu,
  Building2,
  Heart,
  ShoppingCart,
  Home,
  Flame,
  AlertCircle,
  ShoppingBag,
  Phone,
  Truck,
  Bolt,
  Building,
  Globe,
  Pill,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import FeaturedArticleComponent, {
  AINewsArticle,
} from "@/components/Article/featuredArticle";

const tools: ITool[] = [
  {
    title: "เครื่องคำนวณราคาเฉลี่ยหุ้น",
    description: "คำนวณราคาเฉลี่ยของหุ้นเพื่อวางแผนการลงทุนอย่างมีประสิทธิภาพ",
    icon: "📊",
    path: "/tool/average-calculator",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "เครื่องคำนวณดอกเบี้ยทบต้น",
    description: "คำนวณการเติบโตของเงินลงทุนด้วยดอกเบี้ยทบต้นในระยะยาว",
    icon: "💹",
    path: "/tool/compound-interest",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "ตัวช่วยจัดสรรเงิน",
    description: "แบ่งเงินลงทุนและเงินออมอย่างสมดุลตามหลักการเงิน",
    icon: "💰",
    path: "/tool/money-allocation",
    color: "from-purple-500 to-pink-500",
  },
];

const stockCategories: IStockCategory[] = [
  {
    title: "Technology",
    icon: <Cpu className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    tickers: ["AAPL", "MSFT", "GOOGL", "META"],
  },
  {
    title: "Finance",
    icon: <Building2 className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500",
    tickers: ["JPM", "V", "MA", "BRK.B"],
  },
  {
    title: "Healthcare",
    icon: <Heart className="w-6 h-6" />,
    color: "from-red-500 to-pink-500",
    tickers: ["JNJ", "MRK", "PFE", "ABBV"],
  },
  {
    title: "Energy",
    icon: <Bolt className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    tickers: ["XOM", "CVX", "BP", "COP"],
  },
  {
    title: "Electronic Technology",
    icon: <Zap className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    tickers: ["NVDA", "AMD", "AVGO", "AAPL"],
  },
  {
    title: "Technology Services",
    icon: <Cpu className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    tickers: ["MSFT", "GOOGL", "META", "ORCL"],
  },
  {
    title: "Health Technology",
    icon: <Heart className="w-6 h-6" />,
    color: "from-red-500 to-pink-500",
    tickers: ["LLY", "ABBV", "JNJ", "MRK"],
  },
  {
    title: "Retail Trade",
    icon: <ShoppingCart className="w-6 h-6" />,
    color: "from-indigo-500 to-purple-500",
    tickers: ["AMZN", "WMT", "COST", "HD"],
  },
  {
    title: "Consumer Goods",
    icon: <ShoppingBag className="w-6 h-6" />,
    color: "from-pink-500 to-red-500",
    tickers: ["PG", "KO", "PEP", "UL"],
  },
  {
    title: "Utilities",
    icon: <Home className="w-6 h-6" />,
    color: "from-cyan-500 to-blue-500",
    tickers: ["NEE", "DUK", "SO", "EXC"],
  },
  {
    title: "Telecommunications",
    icon: <Phone className="w-6 h-6" />,
    color: "from-purple-500 to-indigo-500",
    tickers: ["VZ", "T", "TMUS", "CHTR"],
  },
  {
    title: "Transportation",
    icon: <Truck className="w-6 h-6" />,
    color: "from-orange-500 to-yellow-500",
    tickers: ["UPS", "FDX", "DAL", "AAL"],
  },
  {
    title: "Real Estate",
    icon: <Building className="w-6 h-6" />,
    color: "from-rose-500 to-pink-500",
    tickers: ["AMT", "PLD", "SPG", "DLR"],
  },
  {
    title: "Materials",
    icon: <Globe className="w-6 h-6" />,
    color: "from-green-500 to-lime-500",
    tickers: ["LIN", "BHP", "RIO", "NEM"],
  },
  {
    title: "Aerospace & Defense",
    icon: <Bolt className="w-6 h-6" />,
    color: "from-gray-500 to-slate-500",
    tickers: ["LMT", "BA", "NOC", "RTX"],
  },
  {
    title: "Pharmaceuticals",
    icon: <Pill className="w-6 h-6" />,
    color: "from-red-500 to-rose-500",
    tickers: ["PFE", "MRK", "JNJ", "ABBV"],
  },
];

const HubPage = () => {
  const router = useRouter();
  const [news, setNews] = useState<INewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<AINewsArticle | null>(
    null
  );
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [stocksByCategory, setStocksByCategory] = useState<{
    [key: string]: IStock[];
  }>({});
  const [retirementPlans, setRetirementPlans] = useState<IRetirementPlan[]>([]);
  const [account, setAccount] = useState<IAccount | null>(null);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [userSectors, setUserSectors] = useState<string[]>([]);

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  };

  const parseAccountFromCookie = (): IAccount | null => {
    try {
      const accountCookie = getCookie("account");
      if (accountCookie) {
        const decodedAccount = decodeURIComponent(accountCookie);
        return JSON.parse(decodedAccount);
      }
      return null;
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแปลงข้อมูลบัญชี:", error);
      return null;
    }
  };
  const fetchAccountSectors = async (userId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/sector/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching account sectors:", error);
      return [];
    }
  };

  useEffect(() => {
    const accountData = parseAccountFromCookie();
    if (!accountData) return;

    setAccount(accountData);

    const userId = accountData.id;

    fetchAccountSectors(userId).then((sectors) => {
      const sectorNames = sectors.map((s: any) => s.name);
      setUserSectors(sectorNames);
    });
  }, []);

  useEffect(() => {
    const fetchCombinedNews = async () => {
      try {
        setLoadingNews(true);
        setFeaturedLoading(true);

        const [aiRes, newsRes] = await Promise.all([
          axios.get("http://localhost:3002/news/prompt/latest"),
          axios.get("http://localhost:3002/news/?page=1&per_page=2"),
        ]);

        let aiArticle = { ...aiRes.data, url: `/news` };

        if (aiArticle.content) {
          aiArticle.content = aiArticle.content
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .trim();
        }

        setFeaturedArticle(aiArticle);
        const generalNews = newsRes.data.data;
        setNews([aiArticle, ...generalNews]);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการรวมข้อมูลข่าว:", error);
        setFeaturedError("ไม่สามารถโหลดข้อมูลข่าวบางส่วนได้");
      } finally {
        setLoadingNews(false);
        setFeaturedLoading(false);
      }
    };

    fetchCombinedNews();
  }, []);

  useEffect(() => {
    if (userSectors.length === 0) return;

    const fetchStocks = async () => {
      try {
        const results: { [key: string]: IStock[] } = {};
        const filteredCategories = stockCategories.filter((cat) =>
          userSectors.some((s) => cat.title.includes(s))
        );

        filteredCategories.forEach((category) => {
          results[category.title] = [];
        });

        const allTickers = [
          ...new Set(filteredCategories.flatMap((cat) => cat.tickers)),
        ];

        const stockPromises = allTickers.map(async (ticker) => {
          try {
            const response = await fetch(
              `http://localhost:3001/stock/data?ticker=${ticker.toUpperCase()}`
            );
            const result = await response.json();
            if (result.success && result.data) return result.data;
            return null;
          } catch {
            return null;
          }
        });

        const stockData = (await Promise.all(stockPromises)).filter(
          (s) => s !== null
        ) as IStock[];

        filteredCategories.forEach((category) => {
          category.tickers.forEach((ticker) => {
            const stock = stockData.find((s) => s.ticker === ticker);
            if (stock) results[category.title].push(stock);
          });
        });

        setStocksByCategory(results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStocks(false);
      }
    };

    fetchStocks();
  }, [userSectors]);

  useEffect(() => {
    const fetchRetirementPlans = async () => {
      try {
        const token = getCookie("accessToken");
        const accountData = parseAccountFromCookie();

        if (token && accountData?.id) {
          const response = await fetch(
            `http://localhost:3001/plans/account/${accountData.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const plansData = await response.json();
            console.log(plansData);

            setRetirementPlans(plansData);
          } else {
            console.log("ไม่พบข้อมูลแผนการเกษียณ");
          }
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลแผนการเกษียณ:", error);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchRetirementPlans();
  }, [account]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("th-TH").format(parseFloat(amount));
  };

  const getStockName = (stock: IStock) => {
    if (stock.name && stock.name !== stock.ticker) {
      return stock.name;
    }

    const stockNames: { [key: string]: string } = {
      SPY: "S&P 500",
      QQQ: "NASDAQ 100",
      DIA: "Dow Jones",
      IWM: "Russell 2000",
      NVDA: "NVIDIA",
      AAPL: "Apple",
      AVGO: "Broadcom",
      AMD: "AMD",
      MSFT: "Microsoft",
      GOOGL: "Alphabet",
      META: "Meta",
      ORCL: "Oracle",
      BRKB: "Berkshire Hathaway",
      JPM: "JPMorgan Chase",
      V: "Visa",
      MA: "Mastercard",
      LLY: "Eli Lilly",
      ABBV: "AbbVie",
      JNJ: "Johnson & Johnson",
      MRK: "Merck",
      AMZN: "Amazon",
      WMT: "Walmart",
      COST: "Costco",
      HD: "Home Depot",
      PG: "Procter & Gamble",
      KO: "Coca-Cola",
      PEP: "PepsiCo",
      UL: "Unilever",
      NEE: "NextEra Energy",
      DUK: "Duke Energy",
      SO: "Southern Company",
      EXC: "Exelon",
      VZ: "Verizon",
      T: "AT&T",
      TMUS: "T-Mobile US",
      CHTR: "Charter Communications",
      UPS: "United Parcel Service",
      FDX: "FedEx",
      DAL: "Delta Air Lines",
      AAL: "American Airlines",
      AMT: "American Tower",
      PLD: "Prologis",
      SPG: "Simon Property Group",
      DLR: "Digital Realty",
      LIN: "Linde",
      BHP: "BHP Group",
      RIO: "Rio Tinto",
      NEM: "Newmont",
      LMT: "Lockheed Martin",
      BA: "Boeing",
      NOC: "Northrop Grumman",
      RTX: "Raytheon Technologies",
      PFE: "Pfizer",
    };

    return stockNames[stock.ticker] || stock.ticker;
  };

  const getHeatmapColor = (changePercent: number) => {
    if (changePercent > 0) {
      const intensity = Math.min(Math.abs(changePercent) / 3, 1);
      return {
        backgroundColor: `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`,
        borderColor: `rgba(34, 197, 94, ${0.4 + intensity * 0.6})`,
        textColor: intensity > 0.5 ? "text-white" : "text-green-400",
      };
    } else if (changePercent < 0) {
      const intensity = Math.min(Math.abs(changePercent) / 3, 1);
      return {
        backgroundColor: `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`,
        borderColor: `rgba(239, 68, 68, ${0.4 + intensity * 0.6})`,
        textColor: intensity > 0.5 ? "text-white" : "text-red-400",
      };
    } else {
      return {
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgba(59, 130, 246, 0.4)",
        textColor: "text-blue-400",
      };
    }
  };

  const calculateYearsToRetirement = (
    currentAge: number,
    retirementAge: number
  ) => {
    return retirementAge - currentAge;
  };

  const backgroundPatternStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.5,
  };
  return (
    <div className="min-h-screen pt-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0" style={backgroundPatternStyle}></div>

      <div className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section with Welcome Message */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6 p-2">
              ศูนย์รวมการลงทุน
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              แพลตฟอร์มครบครันสำหรับข้อมูลตลาด ข่าวสาร และเครื่องมือการลงทุน
            </p>
          </div>

          {/* Stock Sectors */}
          <section className="mb-20">
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-4xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">📈</span> ตลาดหุ้น
              </h2>
            </div>

            {loadingStocks ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : userSectors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userSectors.map((sectorName, idx) => {
                  const category = stockCategories.find((c) =>
                    c.title.includes(sectorName)
                  );
                  if (!category) return null;
                  return (
                    <div
                      key={category.title}
                      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className={`p-3 rounded-full bg-gradient-to-r ${category.color} bg-opacity-20`}
                        >
                          <div className="text-white">{category.icon}</div>
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {category.title}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {stocksByCategory[category.title]?.length ? (
                          stocksByCategory[category.title].map((stock) => (
                            <div
                              key={stock.ticker}
                              className="relative p-4 rounded-xl transition-all duration-300 hover:scale-105 border-2 min-h-24 cursor-pointer"
                              onClick={() =>
                                router.push(`/pricing?ticker=${stock.ticker}`)
                              }
                              style={{
                                ...getHeatmapColor(stock.changePercent),
                              }}
                            >
                              <div className="absolute top-2 left-2">
                                <div className="font-bold text-white text-xs leading-tight">
                                  {getStockName(stock)}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                  {stock.ticker}
                                </div>
                              </div>
                              <div className="absolute top-2 right-2">
                                {stock.changePercent > 0 ? (
                                  <TrendingUp className="w-3 h-3 text-green-400" />
                                ) : stock.changePercent < 0 ? (
                                  <TrendingDown className="w-3 h-3 text-red-400" />
                                ) : (
                                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                                )}
                              </div>
                              <div className="absolute bottom-2 left-2 text-sm font-semibold text-slate-200">
                                $
                                {stock.price > 0
                                  ? stock.price.toFixed(2)
                                  : "N/A"}
                              </div>
                              <div
                                className="absolute bottom-2 right-2 text-right text-sm font-bold"
                                style={{
                                  color:
                                    stock.changePercent > 0 ? "green" : "red",
                                }}
                              >
                                {stock.changePercent >= 0 ? "+" : ""}
                                {stock.changePercent.toFixed(2)}%
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-8 text-slate-400 text-sm">
                            ไม่มีข้อมูล
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                คุณยังไม่ได้เลือก Sector ที่สนใจ
              </div>
            )}
          </section>

          {/* News Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <span className="text-4xl">📰</span>
                ข่าวตลาดล่าสุด
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
            </div>

            {loadingNews ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article: any, index: number) => {
                  const isAI = index === 0;

                  return (
                    <div
                      key={article.id || `news-${index}`}
                      className={`group relative cursor-pointer rounded-2xl transition-all duration-500 hover:scale-[1.03] border backdrop-blur-md overflow-hidden flex flex-col
          ${
            isAI
              ? "bg-slate-900/40 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]"
              : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 shadow-lg"
          }`}
                      onClick={() => {
                        article.url === "/news"
                          ? router.push("/news")
                          : window.open(article.url, "_blank");
                      }}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* แถบสีด้านบนสำหรับการ์ด AI */}
                      {isAI && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                      )}

                      <div className="p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between text-slate-400 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            {isAI ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                                <Zap className="w-3.5 h-3.5 fill-blue-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                                  AI Insight
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-400">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs">
                                  {article.publishedAt
                                    ? formatDate(article.publishedAt)
                                    : "N/A"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs">
                              {article.estimatedReadTime || 3} นาที
                            </span>
                          </div>
                        </div>

                        <h3
                          className={`text-lg font-bold mb-3 line-clamp-2 transition-colors duration-300
              ${
                isAI
                  ? "text-blue-100 group-hover:text-blue-300"
                  : "text-slate-100 group-hover:text-blue-400"
              }`}
                        >
                          {article.title}
                        </h3>

                        <p className="text-slate-400 text-sm mb-6 line-clamp-4 leading-relaxed flex-grow">
                          {article.content ||
                            article.description ||
                            "ไม่มีเนื้อหาข่าว"}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/30">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                isAI
                                  ? "bg-blue-500 animate-pulse"
                                  : "bg-slate-600"
                              }`}
                            />
                            <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                              Source: {article.source || "AI Analysis"}
                            </span>
                          </div>
                          <div
                            className={`p-1.5 rounded-lg transition-colors ${
                              isAI
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-slate-700/30 text-slate-500"
                            }`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="text-center mt-8">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
                onClick={() => router.push("/news")}
              >
                ดูข่าวทั้งหมด
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Retirement Plans Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <span className="text-4xl">🎯</span>
                แผนการเกษียณของคุณ
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
            </div>

            {loadingPlans ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : retirementPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {retirementPlans.map((plan, index) => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      router.push(`plan/${plan.id}`);
                    }}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-orange-500/20">
                          <Target className="w-6 h-6 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {plan.name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            อายุปัจจุบัน
                          </p>
                          <p className="text-white font-semibold">
                            {plan.currentAge} ปี
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            อายุเกษียณ
                          </p>
                          <p className="text-white font-semibold">
                            {plan.retirementAge} ปี
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            เงินออมปัจจุบัน
                          </p>
                          <p className="text-green-400 font-semibold">
                            ฿{formatCurrency(plan.currentSavings)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            ค่าใช้จ่าย/เดือน
                          </p>
                          <p className="text-blue-400 font-semibold">
                            ฿{formatCurrency(plan.money)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-300">
                          <PiggyBank className="w-4 h-4" />
                          <span className="text-sm">
                            เหลือ{" "}
                            {calculateYearsToRetirement(
                              plan.currentAge,
                              plan.retirementAge
                            )}{" "}
                            ปี
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          สร้างเมื่อ {formatDate(plan.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center">
                <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    ยังไม่มีแผนการเกษียณ
                  </h3>
                  <p className="text-slate-400 mb-6">
                    เริ่มวางแผนการเกษียณของคุณเพื่ออนาคตที่มั่นคง
                  </p>
                  <button
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      router.push("/plan");
                    }}
                  >
                    สร้างแผนการเกษียณ
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Tools Section */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <span className="text-4xl">🛠️</span>
                เครื่องมือการลงทุน
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool, index) => (
                <div
                  key={tool.title}
                  className="group cursor-pointer rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300 hover:scale-105"
                  onClick={() => router.push(tool.path)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
                  <div className="p-6">
                    <div className="text-4xl mb-4">{tool.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all">
                      {tool.title}
                    </h3>
                    <p className="text-slate-300 text-sm mb-6">
                      {tool.description}
                    </p>
                    <div className="flex items-center text-blue-400 font-medium group-hover:text-cyan-400 transition-colors">
                      <span className="mr-2">เริ่มใช้งาน</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105"
                onClick={() => router.push("/tool")}
              >
                ดูเครื่องมือทั้งหมด
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HubPage;
