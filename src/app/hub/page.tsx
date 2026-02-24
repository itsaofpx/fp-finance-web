"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  PiggyBank,
  Target,
  Zap,
  TrendingUp,
  Newspaper,
  Wrench,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import OnboardingTutorial from "@/components/Onboarding/OnboardingTutorial";
import { stockCategories, tools } from "./data/data";

// Interfaces
interface IStock {
  ticker: string;
  price: number;
  changePercent: number;
}
interface IRetirementPlan {
  id: string;
  name: string;
  planType: 'gb' | 'ib';
  currentAge: number;
  retirementAge: number;
  currentSavings: string;
  money: string;
}
interface IAccount {
  id: string;
  name: string;
}

const HubPage = () => {
  const router = useRouter();
  const [news, setNews] = useState<any[]>([]);
  const [stocksByCategory, setStocksByCategory] = useState<{ [key: string]: IStock[] }>({});
  const [retirementPlans, setRetirementPlans] = useState<IRetirementPlan[]>([]);
  const [account, setAccount] = useState<IAccount | null>(null);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [userSectors, setUserSectors] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // --- Utility Functions ---
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const parseAccountFromCookie = (): IAccount | null => {
    try {
      const accountCookie = getCookie("account");
      if (accountCookie) return JSON.parse(decodeURIComponent(accountCookie));
      return null;
    } catch (error) {
      return null;
    }
  };

  // --- Effects ---
  useEffect(() => {
    const accountData = parseAccountFromCookie();
    if (!accountData) return;
    setAccount(accountData);

    axios.get(`http://localhost:3001/sector/${accountData.id}`).then((res) => {
      setUserSectors(res.data.map((s: any) => s.name));
    });

    if (!sessionStorage.getItem('hasSeenOnboarding')) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoadingNews(true);
        const [aiRes, newsRes] = await Promise.all([
          axios.get("http://localhost:3002/news/prompt/latest"),
          axios.get("http://localhost:3002/news/?page=1&per_page=4"),
        ]);
        const aiArticle = { ...aiRes.data, url: `/news`, isAI: true };
        setNews([aiArticle, ...newsRes.data.data]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    if (userSectors.length === 0) return;
    const fetchStocks = async () => {
      try {
        setLoadingStocks(true);
        const results: { [key: string]: IStock[] } = {};
        const filteredCategories = stockCategories.filter((cat) =>
          userSectors.some((s) => cat.title.includes(s))
        );

        const allTickers = [...new Set(filteredCategories.flatMap((cat) => cat.tickers))];
        const stockPromises = allTickers.map(t =>
          fetch(`http://localhost:3001/stock/data?ticker=${t.toUpperCase()}`).then(r => r.json())
        );

        const stockData = (await Promise.all(stockPromises))
          .filter(r => r.success && r.data)
          .map(r => r.data);

        filteredCategories.forEach((cat) => {
          results[cat.title] = stockData.filter(s => cat.tickers.includes(s.ticker));
        });
        setStocksByCategory(results);
      } finally {
        setLoadingStocks(false);
      }
    };
    fetchStocks();
  }, [userSectors]);

  useEffect(() => {
    const fetchPlans = async () => {
      const token = getCookie("accessToken");
      if (token && account?.id) {
        try {
          const res = await fetch(`http://localhost:3001/plans/account/${account.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) setRetirementPlans(await res.json());
        } finally {
          setLoadingPlans(false);
        }
      }
    };
    fetchPlans();
  }, [account]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-300 font-sans antialiased">
      {showOnboarding && <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              ศูนย์รวมการลงทุน
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              สวัสดี วันนี้ตลาดเป็นอย่างไรบ้าง?
            </p>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
          >
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-white">แนะนำการใช้งาน</span>
          </button>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content (Left) */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Retirement Plan */}
            <section className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                    <Target className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white">เป้าหมายเกษียณ</h2>
                </div>
                <button onClick={() => router.push("/plan")} className="text-sm font-bold text-orange-500 flex items-center gap-1 hover:underline">
                  ดูทั้งหมด <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {loadingPlans ? (
                <div className="h-40 flex items-center justify-center text-slate-500 animate-pulse font-medium">กำลังเตรียมข้อมูลแผน...</div>
              ) : retirementPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {retirementPlans.map((plan) => (
                    <div key={plan.id} className="p-6 rounded-2xl bg-[#111827]/80 border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer group shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors">{plan.name}</span>
                        <div className="p-2 bg-slate-800/50 rounded-lg"><PiggyBank className="w-5 h-5 text-slate-400" /></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="space-y-1">
                          <p className="text-slate-500 font-medium">ระยะเวลาที่เหลือ</p>
                          <p className="text-white font-bold text-base">{plan.retirementAge - plan.currentAge} ปี</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-slate-500 font-medium">ออมแล้ว</p>
                          <p className="text-green-500 font-bold text-base">฿{Number(plan.currentSavings).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-800">
                  <p className="text-slate-400 font-medium mb-4">ยังไม่ได้สร้างแผนการเกษียณ</p>
                  <button onClick={() => router.push("/plan")} className="bg-orange-500 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all">เริ่มวางแผน</button>
                </div>
              )}
            </section>

            {/* Stock Market Heatmap */}
            <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">สภาวะตลาดแยกตามกลุ่มธุรกิจ</h2>
              </div>

              <div className="space-y-16">
                {Object.entries(stocksByCategory).map(([category, stocks]) => (
                  <div key={category} className="group/sector">
                    <div className="flex flex-col gap-2 mb-6">
                      <h3 className="text-lg font-bold text-white group-hover/sector:text-blue-400 transition-colors uppercase tracking-widest">
                        {category}
                      </h3>
                      <div className="h-[1px] w-full bg-gradient-to-r from-slate-700 via-slate-800 to-transparent" />
                    </div>

                    {/* Individual Stocks Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {stocks.slice(0, 4).map((stock) => {
                        const isPositive = stock.changePercent >= 0;
                        return (
                          <div
                            key={stock.ticker}
                            onClick={() => router.push(`/pricing?ticker=${stock.ticker}`)}
                            className="relative group cursor-pointer transition-all duration-500"
                          >
                            {/* Modern Financial Card */}
                            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-800/20 border border-slate-700/30 group-hover:bg-slate-800/50 group-hover:border-slate-600 transition-all">

                              {/* Top Row: Ticker & Direction Icon */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-slate-500 group-hover:text-blue-400 transition-colors tracking-wider">
                                  {stock.ticker}
                                </span>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[11px] ${isPositive
                                  ? 'text-green-400 bg-green-400/10'
                                  : 'text-red-400 bg-red-400/10'
                                  }`}>
                                  {/* Directional Icon */}
                                  {isPositive ? (
                                    <ArrowUpRight className="w-3 h-3 animate-bounce-subtle" />
                                  ) : (
                                    <ArrowDownRight className="w-3 h-3 animate-pulse-subtle" />
                                  )}
                                  {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                </div>
                              </div>

                              {/* Middle Row: Price */}
                              <div className="flex flex-col">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-2xl font-bold text-white tracking-tight">
                                    ${stock.price.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-bold">USD</span>
                                </div>
                              </div>

                              {/* Bottom Row: Status Indicator */}
                              <div className="relative h-1 w-full bg-slate-700/30 rounded-full overflow-hidden">
                                <div
                                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 w-full ${isPositive ? 'bg-green-500/40 group-hover:bg-green-500' : 'bg-red-500/40 group-hover:bg-red-500'
                                    }`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Side Content (Right) */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <section className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <Wrench className="w-5 h-5 text-purple-500" /> เครื่องมือช่วยวิเคราะห์
              </h2>
              <div className="space-y-3">
                {tools.slice(0, 3).map((tool) => (
                  <div key={tool.title} onClick={() => router.push(tool.path)} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all cursor-pointer group flex items-center gap-4">
                    <div className="text-2xl bg-slate-900 p-2 rounded-xl group-hover:scale-110 transition-transform">{tool.icon}</div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{tool.title}</h3>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">{tool.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  <Newspaper className="w-5 h-5 text-cyan-500" /> อัปเดตตลาด
                </h2>
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                {news.map((item, idx) => (
                  <div key={idx} onClick={() => item.isAI ? router.push(item.url) : window.open(item.url, '_blank')} className={`p-4 rounded-2xl cursor-pointer transition-all border ${item.isAI ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40' : 'bg-slate-800/20 border-slate-800 hover:border-slate-700'}`}>
                    {item.isAI && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-[10px] font-bold text-blue-400 mb-2 border border-blue-500/20"><Zap className="w-3 h-3" /> AI INSIGHT</span>}
                    <h3 className="text-sm font-bold text-slate-200 line-clamp-2 mb-3 leading-snug">{item.title}</h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Today'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 3 MIN</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default HubPage;