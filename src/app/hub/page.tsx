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
import OnboardingTutorial from "@/components/Onboarding/OnboardingTutorial";
import { parseCookies } from "nookies";

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
    null,
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
  const [showOnboarding, setShowOnboarding] = useState(false);

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
        `http://localhost:3001/sector/${userId}`,
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

    // Show onboarding tutorial only once per session (after login)
    const hasSeenOnboardingThisSession =
      sessionStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboardingThisSession) {
      setShowOnboarding(true);
    }
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
          userSectors.some((s) => cat.title.includes(s)),
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
              `http://localhost:3001/stock/data?ticker=${ticker.toUpperCase()}`,
            );
            const result = await response.json();
            if (result.success && result.data) return result.data;
            return null;
          } catch {
            return null;
          }
        });

        const stockData = (await Promise.all(stockPromises)).filter(
          (s) => s !== null,
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
            },
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
    retirementAge: number,
  ) => {
    return retirementAge - currentAge;
  };

  const backgroundPatternStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.5,
  };

  const handleOnboardingComplete = () => {
    sessionStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const cookies = parseCookies();
      const accessToken = cookies.accessToken;

      if (!accessToken) {
        router.push("/");
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            กำลังตรวจสอบสิทธิ์...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <OnboardingTutorial onComplete={handleOnboardingComplete} />
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0" style={backgroundPatternStyle}></div>

      <div className="relative z-10 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section - Compact */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                ศูนย์รวมการลงทุน
              </h1>
              <button
                onClick={() => setShowOnboarding(true)}
                className="group relative px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 text-sm font-medium transition-all duration-300 flex items-center gap-2 border border-purple-500/30 hover:border-purple-400/50 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                title="ดูคู่มือการใช้งาน"
              >
                <span className="text-lg group-hover:animate-bounce">💡</span>
                <span>คู่มือ</span>
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shimmer pointer-events-none"></span>
              </button>
            </div>
            <p className="text-base text-slate-300">
              แพลตฟอร์มครบครันสำหรับข้อมูลตลาด ข่าวสาร และเครื่องมือการลงทุน
            </p>
          </div>

          {/* Dashboard Grid - 4 Main Sections */}
          {/* First Row - Retirement Plans & Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Retirement Plans Section */}
            <section className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🎯</span> แผนการเกษียณ
                </h2>
                <button
                  onClick={() => router.push("/plan")}
                  className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
                >
                  {retirementPlans.length === 0 ? "สร้างแผน" : "สร้างแผนใหม่"}{" "}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loadingPlans ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : retirementPlans.length > 0 ? (
                  <div className="space-y-3">
                    {retirementPlans.map((plan, index) => (
                      <div
                        key={plan.id}
                        onClick={() => {
                          switch (plan.planType) {
                            case "gb":
                              router.push(`/plan/goal-based`);
                              break;
                            case "ib":
                              router.push(`/plan/income-based`);
                          }
                        }}
                        className="cursor-pointer rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-orange-500/20">
                            <Target className="w-4 h-4 text-orange-400" />
                          </div>
                          <h3 className="text-base font-bold text-white">
                            {plan.name}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-slate-400 text-xs mb-1">
                              อายุปัจจุบัน
                            </p>
                            <p className="text-white text-sm font-semibold">
                              {plan.currentAge} ปี
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">
                              อายุเกษียณ
                            </p>
                            <p className="text-white text-sm font-semibold">
                              {plan.retirementAge} ปี
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">
                              เงินออมปัจจุบัน
                            </p>
                            <p className="text-green-400 text-sm font-semibold">
                              ฿{formatCurrency(plan.currentSavings)}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">
                              ค่าใช้จ่าย/เดือน
                            </p>
                            <p className="text-blue-400 text-sm font-semibold">
                              ฿{formatCurrency(plan.money)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-700/50">
                          <div className="flex items-center gap-1 text-slate-300 text-xs">
                            <PiggyBank className="w-3 h-3" />
                            <span>
                              เหลือ{" "}
                              {calculateYearsToRetirement(
                                plan.currentAge,
                                plan.retirementAge,
                              )}{" "}
                              ปี
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      ยังไม่มีแผนการเกษียณ
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      เริ่มวางแผนการเกษียณของคุณ
                    </p>
                    <button
                      className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-full hover:from-orange-600 hover:to-red-600 transition-all"
                      onClick={() => router.push("/plan")}
                    >
                      สร้างแผน <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Tools Section */}
            <section className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🛠️</span> เครื่องมือการลงทุน
                </h2>
                <button
                  onClick={() => router.push("/tool")}
                  className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
                >
                  ดูทั้งหมด <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                  {tools.map((tool, index) => (
                    <div
                      key={tool.title}
                      className="cursor-pointer rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.02]"
                      onClick={() => router.push(tool.path)}
                    >
                      <div
                        className={`h-1 bg-gradient-to-r ${tool.color}`}
                      ></div>
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{tool.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-white mb-1">
                              {tool.title}
                            </h3>
                            <p className="text-slate-300 text-xs line-clamp-2">
                              {tool.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
          {/* Second Row - Stocks & News */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Stock Sectors Section */}
            <section className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">📈</span> ตลาดหุ้น
                </h2>
                <button
                  onClick={() => router.push("/pricing")}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  ดูทั้งหมด <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loadingStocks ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : userSectors.length > 0 ? (
                  <div className="space-y-4">
                    {userSectors.map((sectorName, idx) => {
                      const category = stockCategories.find((c) =>
                        c.title.includes(sectorName),
                      );
                      if (!category) return null;
                      return (
                        <div
                          key={category.title}
                          className="bg-slate-800/30 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className={`p-2 rounded-lg bg-gradient-to-r ${category.color} bg-opacity-20`}
                            >
                              <div className="text-white scale-75">
                                {category.icon}
                              </div>
                            </div>
                            <h3 className="text-sm font-bold text-white">
                              {category.title}
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {stocksByCategory[category.title]
                              ?.slice(0, 4)
                              .map((stock) => (
                                <div
                                  key={stock.ticker}
                                  className="relative p-3 rounded-lg transition-all duration-300 hover:scale-105 border cursor-pointer"
                                  onClick={() =>
                                    router.push(
                                      `/pricing?ticker=${stock.ticker}`,
                                    )
                                  }
                                  style={{
                                    ...getHeatmapColor(stock.changePercent),
                                  }}
                                >
                                  <div className="text-[10px] font-bold text-white leading-tight">
                                    {stock.ticker}
                                  </div>
                                  <div className="text-xs font-semibold text-slate-200 mt-1">
                                    $
                                    {stock.price > 0
                                      ? stock.price.toFixed(2)
                                      : "N/A"}
                                  </div>
                                  <div
                                    className="text-[10px] font-bold mt-0.5"
                                    style={{
                                      color:
                                        stock.changePercent > 0
                                          ? "green"
                                          : "red",
                                    }}
                                  >
                                    {stock.changePercent >= 0 ? "+" : ""}
                                    {stock.changePercent.toFixed(2)}%
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    คุณยังไม่ได้เลือก Sector ที่สนใจ
                  </div>
                )}
              </div>
            </section>

            {/* News Section */}
            <section className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">📰</span> ข่าวตลาด
                </h2>
                <button
                  onClick={() => router.push("/news")}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  ดูทั้งหมด <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loadingNews ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {news.slice(0, 3).map((article: any, index: number) => {
                      const isAI = index === 0;
                      return (
                        <div
                          key={article.id || `news-${index}`}
                          className={`cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] border backdrop-blur-md p-4
                            ${
                              isAI
                                ? "bg-slate-900/40 border-blue-500/50"
                                : "bg-slate-800/50 border-slate-700/50"
                            }`}
                          onClick={() => {
                            article.url === "/news"
                              ? router.push("/news")
                              : window.open(article.url, "_blank");
                          }}
                        >
                          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                            {isAI ? (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <Zap className="w-3 h-3 fill-blue-400" />
                                <span className="text-[9px] font-bold uppercase">
                                  AI
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {article.publishedAt
                                    ? formatDate(article.publishedAt)
                                    : "N/A"}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{article.estimatedReadTime || 3} นาที</span>
                            </div>
                          </div>

                          <h3
                            className={`text-sm font-bold mb-2 line-clamp-2 ${isAI ? "text-blue-100" : "text-slate-100"}`}
                          >
                            {article.title}
                          </h3>

                          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                            {article.content ||
                              article.description ||
                              "ไม่มีเนื้อหาข่าว"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.7);
        }
      `}</style>
    </div>
  );
};

export default HubPage;
