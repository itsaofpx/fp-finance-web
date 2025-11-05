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
} from "lucide-react";
import { useRouter } from "next/navigation";

interface INewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  estimatedReadTime: number;
}

interface INewsResponse {
  data: INewsArticle[];
}

interface IStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  market_cap?: number;
  sector?: string;
}

interface ITool {
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

interface IRetirementPlan {
  id: string;
  name: string;
  currentAge: number;
  retirementAge: number;
  planType: string;
  money: string;
  currentSavings: string;
  expectedReturn: string;
  inflationRate: string;
  retirementYears: number;
  accountId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface IAccount {
  email: string;
  id: string;
  googleId: string;
  givenName: string;
}

interface IStockCategory {
  title: string;
  icon: React.ReactNode;
  color: string;
  tickers: string[];
}

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
    title: "Market ETFs",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    tickers: ["SPY", "QQQ", "DIA", "IWM"],
  },
  {
    title: "Electronic Technology",
    icon: <Zap className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    tickers: ["NVDA", "AAPL", "AVGO", "AMD"],
  },
  {
    title: "Technology Services",
    icon: <Cpu className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    tickers: ["MSFT", "GOOGL", "META", "ORCL"],
  },
  {
    title: "Finance",
    icon: <Building2 className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500",
    tickers: ["BRK.B", "JPM", "V", "MA"],
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
];

const HubPage = () => {
  const router = useRouter();
  const [news, setNews] = useState<INewsArticle[]>([]);
  const [stocksByCategory, setStocksByCategory] = useState<{
    [key: string]: IStock[];
  }>({});
  const [retirementPlans, setRetirementPlans] = useState<IRetirementPlan[]>([]);
  const [account, setAccount] = useState<IAccount | null>(null);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [stockError, setStockError] = useState<string | null>(null);

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

  useEffect(() => {
    const accountData = parseAccountFromCookie();
    setAccount(accountData);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(
          "http://localhost:3002/news/?page=1&per_page=3"
        );
        const data: INewsResponse = await res.json();
        setNews(data.data);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลข่าว:", error);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const results: { [key: string]: IStock[] } = {};

        stockCategories.forEach((category) => {
          results[category.title] = [];
        });

        const allTickers = [
          ...new Set(stockCategories.flatMap((cat) => cat.tickers)),
        ];

        console.log("Fetching stocks for tickers:", allTickers);

        const stockPromises = allTickers.map(async (ticker) => {
          try {
            console.log(`Fetching data for ${ticker}...`);

            const response = await fetch(
              `http://localhost:3001/stock/data?ticker=${ticker.toUpperCase()}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(`Data received for ${ticker}:`, result);

            if (result.success && result.data) {
              const stockData = result.data;
              return {
                ticker: stockData.ticker,
                name: stockData.name || ticker,
                price: stockData.price || 0,
                change: stockData.change || 0,
                changePercent: stockData.changePercent || 0,
                open: stockData.open,
                high: stockData.high,
                low: stockData.low,
                volume: stockData.volume,
                market_cap: stockData.market_cap,
                sector: stockData.sector,
              };
            } else {
              throw new Error(result.message || `No data for ${ticker}`);
            }
          } catch (error) {
            console.error(`Error fetching ${ticker}:`, error);
            return null;
          }
        });

        const stockData = await Promise.all(stockPromises);
        console.log("All stock data:", stockData);

        const validStocks = stockData.filter(
          (stock) => stock !== null
        ) as IStock[];

        stockCategories.forEach((category) => {
          category.tickers.forEach((ticker) => {
            const stock = validStocks.find((s) => s?.ticker === ticker);
            if (stock) {
              results[category.title].push(stock);
            }
          });
        });

        console.log("Organized stock data:", results);
        setStocksByCategory(results);

        const totalStocks = Object.values(results).reduce(
          (sum, stocks) => sum + stocks.length,
          0
        );

        if (totalStocks === 0) {
          setStockError("ไม่สามารถโหลดข้อมูลหุ้นได้ กรุณาลองใหม่อีกครั้ง");
        } else {
          console.log(`Successfully loaded ${totalStocks} stocks`);
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหุ้น:", error);
        setStockError("เกิดข้อผิดพลาดในการดึงข้อมูลหุ้น");
      } finally {
        setLoadingStocks(false);
      }
    };

    fetchStocks();
  }, []);

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
      "BRK.B": "Berkshire",
      JPM: "JPMorgan",
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

  const row1 = stockCategories.slice(0, 3);
  const row2 = stockCategories.slice(3, 6);

  const renderStockRow = (categories: IStockCategory[], rowIndex: number) => (
    <div
      key={rowIndex}
      className="grid gap-8 mb-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    >
      {categories.map((category, categoryIndex) => (
        <div
          key={category.title}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300"
          style={{
            animationDelay: `${(rowIndex * 3 + categoryIndex) * 100}ms`,
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-3 rounded-full bg-gradient-to-r ${category.color} bg-opacity-20`}
            >
              <div className="text-white">{category.icon}</div>
            </div>
            <h3 className="text-xl font-bold text-white">{category.title}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stocksByCategory[category.title]?.length > 0 ? (
              stocksByCategory[category.title].map((stock, stockIndex) => {
                const heatmapStyle = getHeatmapColor(stock.changePercent);
                return (
                  <div
                    key={stock.ticker}
                    className="relative p-4 rounded-xl transition-all duration-300 hover:scale-105 border-2 min-h-24 cursor-pointer"
                    onClick={() => {
                      router.push(`/pricing?ticker=${stock.ticker}`);
                    }}
                    style={{
                      backgroundColor: heatmapStyle.backgroundColor,
                      borderColor: heatmapStyle.borderColor,
                    }}
                  >
                    {/* Top Left: Company Name & Ticker */}
                    <div className="absolute top-2 left-2">
                      <div className="font-bold text-white text-xs leading-tight">
                        {getStockName(stock)}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {stock.ticker}
                      </div>
                    </div>

                    {/* Top Right: Trend Indicator */}
                    <div className="absolute top-2 right-2">
                      {stock.changePercent > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      ) : stock.changePercent < 0 ? (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      )}
                    </div>

                    {/* Bottom Left: Current Price */}
                    <div className="absolute bottom-2 left-2">
                      <div className="text-sm font-semibold text-slate-200">
                        ${stock.price > 0 ? stock.price.toFixed(2) : "N/A"}
                      </div>
                    </div>

                    {/* Bottom Right: Change */}
                    <div className="absolute bottom-2 right-2 text-right">
                      {stock.price > 0 && (
                        <>
                          <div
                            className={`text-sm font-bold ${heatmapStyle.textColor}`}
                          >
                            {stock.changePercent >= 0 ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </div>
                          <div className={`text-xs ${heatmapStyle.textColor}`}>
                            {stock.change >= 0 ? "+" : ""}$
                            {stock.change.toFixed(2)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-8">
                {loadingStocks ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                ) : (
                  <div className="text-slate-400 text-sm">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                    ไม่มีข้อมูล
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

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

          {/* Stock Categories Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <span className="text-4xl">📈</span>
                ตลาดหุ้น
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
            </div>

            {loadingStocks ? (
              <div className="flex justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-400">กำลังโหลดข้อมูลหุ้น...</p>
                </div>
              </div>
            ) : stockError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  เกิดข้อผิดพลาด
                </h3>
                <p className="text-slate-400 mb-4">{stockError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ลองใหม่
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {renderStockRow(row1, 0)}
                {renderStockRow(row2, 1)}
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
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article, index) => (
                  <div
                    key={article.id}
                    className="group cursor-pointer rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300 hover:scale-105"
                    onClick={() => window.open(article.url, "_blank")}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between text-slate-400 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{article.estimatedReadTime} นาที</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                        {article.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          แหล่งที่มา: {article.source}
                        </span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
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
                      switch (plan.planType) {
                        case "gb":
                          router.push(`/plan/goal-based`);
                          break;
                        case "ib":
                          router.push(`/plan/income-based`);
                      }
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
