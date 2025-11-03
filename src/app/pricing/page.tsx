"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Building2,
  DollarSign,
  BarChart3,
  Globe,
  Info,
  AlertCircle,
  Volume2,
  Calendar,
  Activity,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles,
  Brain,
  Target,
  Shield,
  Zap,
  MessageSquare,
  TrendingUp as TrendUp,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Star,
  BookOpen,
  PieChart,
  LineChart,
  Newspaper,
  TrendingUp as AnalysisIcon,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart2,
} from "lucide-react";

interface StockData {
  ticker: string;
  name: string;
  market_cap?: number;
  price: number;
  change: number;
  changePercent: number;
  sector?: string;
  website?: string;
  description?: string;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  vwap?: number;
  employees?: number;
}

interface AIAnalysis {
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  technicalAnalysis: string;
  newsAnalysis: string;
  riskAssessment: string;
  recommendation: string;
  targetPrice?: number;
  riskLevel: "low" | "medium" | "high";
  keyPoints: string[];
  loading: boolean;
}

const StockPricingPage = () => {
  const [searchTicker, setSearchTicker] = useState("");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentTimeFrame, setCurrentTimeFrame] = useState("D");
  const [chartReady, setChartReady] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const [stockDataLoaded, setStockDataLoaded] = useState(false);
  const [aiAnalysisLoaded, setAiAnalysisLoaded] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tradingViewWidget = useRef<any>(null);
  const scriptLoaded = useRef(false);

  const DEFAULT_TICKER = "NVDA";

  const getUrlParams = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return {
        ticker: urlParams.get("ticker"),
      };
    }
    return { ticker: null };
  };

  const clearUrl = () => {
    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, window.location.pathname);

      console.log("URL cleared successfully");
    }
  };

  const formatMarketCap = (value?: number) => {
    if (!value) return "ไม่มีข้อมูล";
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)} ล้านล้าน`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)} พันล้าน`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)} ล้าน`;
    return `${value.toLocaleString()}`;
  };

  const formatVolume = (value?: number) => {
    if (!value) return "ไม่มีข้อมูล";
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)} พันล้าน`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)} ล้าน`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)} พัน`;
    return value.toLocaleString();
  };

  const translateSector = (sector?: string) => {
    const sectorMap: { [key: string]: string } = {
      Technology: "เทคโนโลยี",
      Healthcare: "สุขภาพ",
      Finance: "การเงิน",
      Energy: "พลังงาน",
      Consumer: "สินค้าอุปโภค",
      Industrial: "อุตสาหกรรม",
      Materials: "วัสดุ",
      Utilities: "สาธารณูปโภค",
      "Real Estate": "อสังหาริมทรัพย์",
      Communication: "การสื่อสาร",
    };

    if (!sector) return "เทคโนโลยี";

    for (const [eng, thai] of Object.entries(sectorMap)) {
      if (sector.toLowerCase().includes(eng.toLowerCase())) {
        return thai;
      }
    }

    return sector;
  };

  const analyzeWithAI = async (stockData: StockData) => {
    setAiAnalysis((prev) => ({ ...prev, loading: true } as AIAnalysis));
    setAiAnalysisLoaded(false);

    try {
      const response = await fetch(
        `http://localhost:3001/gemini/prompt/stock?ticker=${stockData.ticker}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setAiAnalysis({
          ...result.data,
          loading: false,
        });
        setAiAnalysisLoaded(true);
      } else {
        throw new Error(result.message || "Analysis failed");
      }
    } catch (error) {
      setAiAnalysis({
        sentiment: "neutral",
        confidence: 0,
        technicalAnalysis: "ไม่สามารถวิเคราะห์ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
        newsAnalysis: "ไม่สามารถวิเคราะห์ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
        riskAssessment: "ไม่สามารถประเมินได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
        recommendation: "กรุณาลองใหม่อีกครั้งหรือติดต่อฝ่ายสนับสนุน",
        riskLevel: "medium",
        keyPoints: [
          "ระบบ AI ไม่สามารถวิเคราะห์ได้ในขณะนี้",
          "กรุณาลองใหม่อีกครั้ง",
        ],
        loading: false,
      });
      setAiAnalysisLoaded(true);
    }
  };

  const cleanupWidget = () => {
    if (tradingViewWidget.current) {
      try {
        if (typeof tradingViewWidget.current.remove === "function") {
          tradingViewWidget.current.remove();
        } else if (typeof tradingViewWidget.current.destroy === "function") {
          tradingViewWidget.current.destroy();
        }
      } catch (error) {}
      tradingViewWidget.current = null;
    }

    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = "";
    }
    setChartReady(false);
    setChartError(null);
  };

  const loadTradingViewScript = () => {
    return new Promise((resolve, reject) => {
      if (
        window.TradingView &&
        typeof window.TradingView.widget === "function"
      ) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="tv.js"]');
      if (existingScript) {
        if (window.TradingView) {
          resolve(true);
        } else {
          existingScript.addEventListener("load", () => {
            setTimeout(() => resolve(true), 500);
          });
          existingScript.addEventListener("error", reject);
        }
        return;
      }

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        scriptLoaded.current = true;
        setTimeout(() => {
          if (window.TradingView) {
            resolve(true);
          } else {
            reject(new Error("TradingView not loaded"));
          }
        }, 1000);
      };
      script.onerror = () =>
        reject(new Error("Failed to load TradingView script"));
      document.head.appendChild(script);
    });
  };

  const createWidget = async (symbol: string) => {
    try {
      setChartError(null);
      setChartReady(false);

      await loadTradingViewScript();

      if (!chartContainerRef.current) {
        throw new Error("Chart container not found");
      }

      if (
        !window.TradingView ||
        typeof window.TradingView.widget !== "function"
      ) {
        throw new Error("TradingView not available");
      }

      cleanupWidget();
      await new Promise((resolve) => setTimeout(resolve, 300));

      const containerId = `tradingview_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      chartContainerRef.current.id = containerId;

      const symbolFormats = [
        `NASDAQ:${symbol.toUpperCase()}`,
        `NYSE:${symbol.toUpperCase()}`,
        symbol.toUpperCase(),
        `AMEX:${symbol.toUpperCase()}`,
      ];

      let widgetCreated = false;
      let lastError = null;

      for (const symbolFormat of symbolFormats) {
        try {
          const widgetConfig = {
            autosize: true,
            symbol: symbolFormat,
            interval: currentTimeFrame,
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#0f172a",
            enable_publishing: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            container_id: containerId,
            overrides: {
              "paneProperties.background": "#0f172a",
              "paneProperties.backgroundType": "solid",
            },
          };

          tradingViewWidget.current = new window.TradingView.widget(
            widgetConfig
          );

          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`Timeout loading ${symbolFormat}`));
            }, 10000);

            if (
              tradingViewWidget.current &&
              tradingViewWidget.current.onChartReady
            ) {
              tradingViewWidget.current.onChartReady(() => {
                clearTimeout(timeout);

                setChartReady(true);
                widgetCreated = true;
                resolve(true);
              });
            } else {
              setTimeout(() => {
                clearTimeout(timeout);
                setChartReady(true);
                widgetCreated = true;
                resolve(true);
              }, 3000);
            }
          });

          break;
        } catch (formatError) {
          lastError = formatError;

          if (tradingViewWidget.current) {
            try {
              tradingViewWidget.current.remove();
            } catch (e) {}
            tradingViewWidget.current = null;
          }

          continue;
        }
      }
    } catch (error) {
      setChartError(`ไม่สามารถโหลดได้..`);
      setChartReady(false);
    }
  };

  const fetchStockData = async (ticker: string) => {
    setLoading(true);
    setError(null);
    setStockData(null);
    setChartReady(false);
    setChartError(null);

    setStockDataLoaded(false);

    setAiAnalysisLoaded(false);

    try {
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
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setStockData(result.data);
        setHasSearched(true);
        setStockDataLoaded(true);

        await analyzeWithAI(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch stock data");
      }
      clearUrl();
    } catch (err: any) {
      setError(
        err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง"
      );
      setHasSearched(true);
      clearUrl();
    } finally {
      setLoading(false);
      clearUrl();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTicker.trim()) {
      fetchStockData(searchTicker.trim());
    }
  };

  useEffect(() => {
    if (stockDataLoaded && aiAnalysisLoaded && stockData && !loading) {
      const timer = setTimeout(() => {
        createWidget(stockData.ticker);
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [stockDataLoaded, aiAnalysisLoaded, stockData?.ticker, loading]);

  useEffect(() => {
    const { ticker } = getUrlParams();

    if (ticker && ticker.trim()) {
      fetchStockData(ticker.trim());
    } else {
      fetchStockData(DEFAULT_TICKER);
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupWidget();
    };
  }, []);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendUp className="w-4 h-4 text-blue-400" />;
      case "bearish":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-blue-400";
      case "high":
        return "text-red-400";
      default:
        return "text-yellow-400";
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "แนวโน้มขึ้น";
      case "bearish":
        return "แนวโน้มลง";
      default:
        return "ปานกลาง";
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case "low":
        return "ต่ำ";
      case "high":
        return "สูง";
      default:
        return "ปานกลาง";
    }
  };

  const getLoadingStatus = () => {
    if (!stockDataLoaded) return "กำลังดึงข้อมูลหุ้น...";
    if (!aiAnalysisLoaded) return "กำลังวิเคราะห์ด้วย AI...";
    if (!chartReady) return "กำลังโหลดกราฟ...";
    return "เสร็จสิ้น";
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white relative">
      {/* Subtle Background Pattern */}
      <div className="inset-0 opacity-5 fixed">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #1e40af 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #1e40af 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      {/* AI Panel Toggle */}
      {stockData && (
        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          className="fixed top-6 left-6 z-20 p-3 rounded-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700 border border-blue-500"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="text-sm font-medium">AI วิเคราะห์</span>
            {aiAnalysis && !aiAnalysis.loading && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </button>
      )}

      {/* Search Bar */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value)}
              placeholder="ค้นหาหุ้น (เช่น AAPL, MSFT, TSLA)"
              className="w-full pl-12 pr-20 py-3 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-sm shadow-2xl"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 text-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "ค้นหา"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="flex relative">
        {/* Enhanced AI Analysis Panel */}
        {stockData && (
          <div
            className={`${
              showAIPanel ? "w-96" : "w-0"
            } transition-all duration-300 overflow-hidden fixed left-0 top-0 h-full z-10`}
          >
            <div className="h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 overflow-y-auto">
              <div className="p-6 space-y-6 pt-20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">AI วิเคราะห์หุ้น</h2>
                    <p className="text-xs text-slate-400">ข่าวสารโดย AI</p>
                  </div>
                </div>

                {aiAnalysis?.loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-3"></div>
                      <p className="text-sm text-slate-400">
                        กำลังวิเคราะห์...
                      </p>
                    </div>
                  </div>
                )}

                {aiAnalysis && !aiAnalysis.loading && (
                  <div className="space-y-6">
                    {/* Sentiment Overview */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-400">ภาพรวม</span>
                        {getSentimentIcon(aiAnalysis.sentiment)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {getSentimentText(aiAnalysis.sentiment)}
                        </span>
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="h-2 bg-blue-500 rounded-full transition-all duration-1000"
                            style={{ width: `${aiAnalysis.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-400">
                          {aiAnalysis.confidence}%
                        </span>
                      </div>
                    </div>

                    {/* Technical Analysis */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart2 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">
                          1. ภาพรวมทางเทคนิค
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-300">
                        {aiAnalysis.technicalAnalysis}
                      </p>
                    </div>

                    {/* News Analysis */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Newspaper className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">
                          2. ปัจจัยจากข่าว
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-300">
                        {aiAnalysis.newsAnalysis}
                      </p>
                    </div>

                    {/* Risk Assessment */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium">
                          3. ข้อควรระวังและโอกาส
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-300">
                        {aiAnalysis.riskAssessment}
                      </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-slate-400">
                            ระดับความเสี่ยง
                          </span>
                        </div>
                        <span
                          className={`text-sm font-bold ${getRiskColor(
                            aiAnalysis.riskLevel
                          )}`}
                        >
                          {getRiskText(aiAnalysis.riskLevel)}
                        </span>
                      </div>

                      {aiAnalysis.targetPrice && (
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-400">
                              ราคาเป้าหมาย
                            </span>
                          </div>
                          <span className="text-sm font-bold text-blue-400">
                            ${aiAnalysis.targetPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Key Points */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium">จุดสำคัญ</span>
                      </div>
                      <ul className="space-y-2">
                        {(aiAnalysis.keyPoints || []).map((point, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-slate-300 leading-relaxed">
                              {point}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {(!aiAnalysis.keyPoints ||
                        aiAnalysis.keyPoints.length === 0) && (
                        <p className="text-sm text-slate-400 italic">
                          ไม่มีจุดสำคัญในขณะนี้
                        </p>
                      )}
                    </div>

                    {/* Recommendation */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">คำแนะนำ</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-300">
                        {aiAnalysis.recommendation}
                      </p>
                    </div>

                    {/* Refresh Button */}
                    <button
                      onClick={() => analyzeWithAI(stockData)}
                      disabled={aiAnalysis.loading}
                      className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          aiAnalysis.loading ? "animate-spin" : ""
                        }`}
                      />
                      วิเคราะห์ใหม่
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`flex-1 ${
            stockData && showAIPanel ? "ml-96" : "ml-0"
          } transition-all duration-300`}
        >
          {stockData && !loading ? (
            <div className="p-6 pt-20">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl">
                        <span className="text-white font-bold text-lg">
                          {stockData.ticker.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        {stockData.name}
                      </h1>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-slate-400">
                          {stockData.ticker}
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-800 rounded-full border border-slate-700">
                          {translateSector(stockData.sector)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-light mb-1 text-white">
                      ${stockData.price.toFixed(2)}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      {stockData.change >= 0 ? (
                        <ArrowUp className="w-5 h-5 text-blue-400" />
                      ) : (
                        <ArrowDown className="w-5 h-5 text-red-400" />
                      )}
                      <span
                        className={`text-lg font-medium ${
                          stockData.change >= 0
                            ? "text-blue-400"
                            : "text-red-400"
                        }`}
                      >
                        {stockData.change >= 0 ? "+" : ""}
                        {stockData.change.toFixed(2)} (
                        {stockData.changePercent >= 0 ? "+" : ""}
                        {stockData.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="mb-8">
                <div className="h-[800px] max-h-screen relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-3xl">
                  {/* ✅ ปรับปรุง Loading State ให้แสดงสถานะที่ชัดเจน */}
                  {(!stockDataLoaded ||
                    !aiAnalysisLoaded ||
                    (!chartReady && !chartError)) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-3xl z-10">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-white text-lg font-medium mb-2">
                          {getLoadingStatus()}
                        </p>
                        <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                stockDataLoaded
                                  ? "bg-green-400"
                                  : "bg-slate-600"
                              }`}
                            ></div>
                            <span>ข้อมูลหุ้น</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                aiAnalysisLoaded
                                  ? "bg-green-400"
                                  : "bg-slate-600"
                              }`}
                            ></div>
                            <span>AI วิเคราะห์</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                chartReady ? "bg-green-400" : "bg-slate-600"
                              }`}
                            ></div>
                            <span>กราฟ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {chartError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-3xl z-10">
                      <div className="text-center max-w-md mx-auto p-6">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 text-lg font-medium mb-4">
                          ไม่สามารถโหลดกราฟได้
                        </p>
                        <p className="text-slate-400 text-sm mb-6">
                          {chartError}
                        </p>
                        <div className="space-y-3">
                          <button
                            onClick={() =>
                              stockData && createWidget(stockData.ticker)
                            }
                            className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            ลองใหม่
                          </button>
                          <button
                            onClick={() => {
                              setChartError(null);
                              setChartReady(false);
                              window.location.reload();
                            }}
                            className="w-full px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                          >
                            รีเฟรชหน้า
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chart Container */}
                  <div
                    ref={chartContainerRef}
                    className="w-full h-full"
                    style={{ minHeight: "800px" }}
                  />
                </div>
              </div>

              {/* Bottom Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Trading Data */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 shadow-xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    ข้อมูลการซื้อขาย
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        label: "มูลค่าตลาด",
                        value: formatMarketCap(stockData.market_cap),
                        icon: Building2,
                      },
                      {
                        label: "ราคาเปิด",
                        value: `$${
                          stockData.open?.toFixed(2) || "ไม่มีข้อมูล"
                        }`,
                        icon: Calendar,
                      },
                      {
                        label: "ราคาสูงสุด",
                        value: `$${
                          stockData.high?.toFixed(2) || "ไม่มีข้อมูล"
                        }`,
                        icon: TrendUp,
                        color: "text-blue-400",
                      },
                      {
                        label: "ราคาต่ำสุด",
                        value: `$${stockData.low?.toFixed(2) || "ไม่มีข้อมูล"}`,
                        icon: TrendingDown,
                        color: "text-red-400",
                      },
                      {
                        label: "ปริมาณ",
                        value: formatVolume(stockData.volume),
                        icon: Volume2,
                      },
                      {
                        label: "VWAP",
                        value: `$${
                          stockData.vwap?.toFixed(2) || "ไม่มีข้อมูล"
                        }`,
                        icon: Activity,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-400">
                            {item.label}
                          </span>
                        </div>
                        <span
                          className={`font-medium ${
                            item.color || "text-white"
                          }`}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company Profile */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 shadow-xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    ข้อมูลบริษัท
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        label: "ภาคธุรกิจ",
                        value: translateSector(stockData.sector),
                        icon: PieChart,
                      },
                      {
                        label: "จำนวนพนักงาน",
                        value:
                          stockData.employees?.toLocaleString() ||
                          "ไม่มีข้อมูล",
                        icon: Users,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-400">
                            {item.label}
                          </span>
                        </div>
                        <span className="font-medium text-white text-right text-sm max-w-32">
                          {item.value}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">เว็บไซต์</span>
                      </div>
                      <a
                        href={stockData.website || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 flex items-center gap-1 font-medium text-sm max-w-32 truncate text-white"
                      >
                        {stockData.website
                          ?.replace("https://", "")
                          .replace("http://", "")
                          .substring(0, 15) || "ไม่มีข้อมูล"}
                        {stockData.website && (
                          <ExternalLink className="w-3 h-3" />
                        )}
                      </a>
                    </div>
                  </div>
                </div>

                {/* About Company */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 shadow-xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    เกี่ยวกับบริษัท
                  </h3>
                  <div className="text-sm text-slate-300 leading-relaxed">
                    {stockData.description?.substring(0, 250) ||
                      `${
                        stockData.name
                      } เป็นบริษัทชั้นนำในภาคธุรกิจ${translateSector(
                        stockData.sector
                      )} ที่ให้บริการและโซลูชันนวัตกรรมแก่ลูกค้าทั่วโลก`}
                    {stockData.description &&
                      stockData.description.length > 250 &&
                      "..."}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-slate-400 text-sm pb-8 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>กราฟมืออาชีพ TradingView</span>
                </div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <span>วิเคราะห์ด้วย AI</span>
                </div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>ข้อมูลเรียลไทม์</span>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-6"></div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  กำลังโหลดข้อมูลหุ้น...
                </h3>
                <p className="text-slate-400">
                  กำลังดึงข้อมูลเรียลไทม์และเตรียมการวิเคราะห์ AI
                </p>
              </div>
            </div>
          ) : error && hasSearched ? (
            <div className="flex justify-center items-center min-h-screen p-8">
              <div className="max-w-3xl mx-auto">
                <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-3xl p-12 text-center shadow-2xl">
                  <AlertCircle className="w-24 h-24 text-red-400 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-red-400 mb-4">
                    เกิดข้อผิดพลาด
                  </h3>
                  <p className="text-red-300 text-xl mb-6">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setHasSearched(false);
                      fetchStockData(DEFAULT_TICKER);
                    }}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg"
                  >
                    กลับไปหน้าหลัก
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-screen p-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border border-slate-800">
                  <div className="p-6 bg-blue-600 rounded-3xl inline-block mb-8 shadow-2xl">
                    <BarChart3 className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-8">
                    แพลตฟอร์มวิเคราะห์หุ้นมืออาชีพ
                  </h3>
                  <p className="text-xl text-slate-300 mb-8">
                    กำลังโหลดข้อมูล NVDA...
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                    {[
                      {
                        icon: Activity,
                        label: "กราฟเรียลไทม์",
                        color: "bg-blue-600",
                      },
                      {
                        icon: Bot,
                        label: "วิเคราะห์ด้วย AI",
                        color: "bg-purple-600",
                      },
                      {
                        icon: Volume2,
                        label: "วิเคราะห์ปริมาณ",
                        color: "bg-green-600",
                      },
                      {
                        icon: Calendar,
                        label: "หลายช่วงเวลา",
                        color: "bg-orange-600",
                      },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center gap-4 p-6 bg-slate-800/30 rounded-2xl border border-slate-700 hover:bg-slate-800/50 transition-all duration-200"
                      >
                        <div
                          className={`p-4 ${feature.color} rounded-2xl shadow-xl`}
                        >
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-slate-200 font-medium text-lg">
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    TradingView: any;
  }
}

export default StockPricingPage;
