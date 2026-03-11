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
  HelpCircle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import OnboardingTutorial from "@/components/Onboarding/OnboardingTutorial";
import { parseCookies } from "nookies";
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
  const [recommendedToolOrders, setRecommendedToolOrders] = useState<number[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showRetirementInfo, setShowRetirementInfo] = useState(false);
  const [showToolsInfo, setShowToolsInfo] = useState(false);


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
    if (!accountData) {
      router.push("/");
      return
    };
    setAccount(accountData);
    setIsAuthChecking(false);

    axios.get(`http://localhost:3001/sector/${accountData.id}`).then((res) => {
      setUserSectors(res.data.map((s: any) => s.name));
    });

    if (!sessionStorage.getItem('hasSeenOnboarding')) {
      setShowOnboarding(true)
      sessionStorage.setItem('hasSeenOnboarding', 'true');
    };
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
    const fetchRecommendedTools = async () => {
      try {
        const res = await axios.get("http://localhost:3002/news/tools/recommend");
        const orders = Array.isArray(res.data?.tools)
          ? res.data.tools.filter((n: unknown) => typeof n === "number")
          : [];
        setRecommendedToolOrders(orders);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecommendedTools();
  }, []);

  const displayedTools =
    recommendedToolOrders.length === 3
      ? recommendedToolOrders
          .map((order) => tools.find((tool) => tool.order === order))
          .filter((tool): tool is (typeof tools)[number] => Boolean(tool))
      : tools.slice(0, 3);

  useEffect(() => {
    if (userSectors.length === 0) return;
    const fetchStocks = async () => {
      try {
        setLoadingStocks(true);
        const results: { [key: string]: IStock[] } = {};
        const filteredCategories = stockCategories.filter((cat) =>
          userSectors.some((s) => cat.title.includes(s)),
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

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">กำลังตรวจสอบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-300 font-sans antialiased">
      {showOnboarding && <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />}
      
      {/* Retirement Planning Info Modal */}
      {showRetirementInfo && (
        <div 
          onClick={() => setShowRetirementInfo(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300"
          >
            <button 
              onClick={() => setShowRetirementInfo(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-orange-500/10 rounded-2xl">
                  <Target className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">ทำไมต้องวางแผนเกษียณ?</h2>
              </div>
              
              <div className="space-y-6 text-slate-300">
                <div className="bg-gradient-to-r from-orange-500/10 to-transparent border-l-4 border-orange-500 p-5 rounded-r-2xl">
                  <p className="text-lg font-semibold text-orange-400 mb-2">💡 การวางแผนเกษียณคือการลงทุนในอนาคตของตัวเอง</p>
                  <p className="text-slate-400 leading-relaxed">การเตรียมตัวตั้งแต่วันนี้จะช่วยให้คุณมีชีวิตหลังเกษียณที่มีคุณภาพ โดยไม่ต้องพึ่งพาใคร</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🎯</span> เหตุผลสำคัญ 5 ข้อ
                  </h3>
                  
                  <div className="grid gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-orange-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">📈</span>
                        <div>
                          <h4 className="font-bold text-white mb-1">1. พลังของดอกเบี้ยทบต้น</h4>
                          <p className="text-sm text-slate-400">ยิ่งเริ่มเร็ว เงินของคุณจะเติบโตได้มากขึ้นจากการลงทุนระยะยาว</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-orange-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <h4 className="font-bold text-white mb-1">2. รายได้ลดลง แต่ค่าใช้จ่ายไม่หาย</h4>
                          <p className="text-sm text-slate-400">หลังเกษียณจะไม่มีเงินเดือนประจำ แต่ค่าครองชีพและค่ารักษาพยาบาลยังคงมีอยู่</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-orange-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">⏰</span>
                        <div>
                          <h4 className="font-bold text-white mb-1">3. อายุยืนขึ้น ใช้เงินนานขึ้น</h4>
                          <p className="text-sm text-slate-400">คนไทยมีอายุขัยเฉลี่ย 77+ ปี หมายความว่าต้องใช้เงินหลังเกษียญ 20-30 ปี</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-orange-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">🏥</span>
                        <div>
                          <h4 className="font-bold text-white mb-1">4. ค่ารักษาพยาบาลแพงขึ้น</h4>
                          <p className="text-sm text-slate-400">เมื่ออายุมากขึ้น โอกาสเจ็บป่วยสูงขึ้น และค่ารักษาพยาบาลก็เพิ่มขึ้นทุกปี</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-orange-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">😌</span>
                        <div>
                          <h4 className="font-bold text-white mb-1">5. ความอิสระและศักดิ์ศรี</h4>
                          <p className="text-sm text-slate-400">มีเงินออมเพียงพอจะทำให้ไม่ต้องเป็นภาระของลูกหลาน มีอิสระในการใช้ชีวิต</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">💡</span> เริ่มต้นอย่างไร?
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span><strong className="text-white">กำหนดเป้าหมาย:</strong> คำนวณว่าต้องการใช้เงินเท่าไหร่ต่อเดือนหลังเกษียญ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span><strong className="text-white">เริ่มออมเร็ว:</strong> แม้จะเป็นจำนวนเล็กน้อย แต่สม่ำเสมอ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span><strong className="text-white">ใช้เครื่องมือวางแผน:</strong> ระบบของเราช่วยคำนวณและติดตามความคืบหน้า</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span><strong className="text-white">ทบทวนแผนสม่ำเสมอ:</strong> ปรับแผนให้เหมาะสมกับสถานการณ์ชีวิต</span>
                    </li>
                  </ul>
                </div>

                <div className="text-center pt-4">
                  <button 
                    onClick={() => {
                      setShowRetirementInfo(false);
                      router.push('/plan');
                    }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/25 hover:scale-105"
                  >
                    เริ่มวางแผนเกษียญเลย 🚀
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tools Info Modal */}
      {showToolsInfo && (
        <div 
          onClick={() => setShowToolsInfo(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300"
          >
            <button 
              onClick={() => setShowToolsInfo(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-800 rounded-xl transition-colors z-10"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-purple-500/10 rounded-2xl">
                  <Wrench className="w-8 h-8 text-purple-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">ทำไมต้องใช้เครื่องมือวิเคราะห์?</h2>
              </div>
              
              <div className="space-y-6 text-slate-300">
                <div className="bg-gradient-to-r from-purple-500/10 to-transparent border-l-4 border-purple-500 p-5 rounded-r-2xl">
                  <p className="text-lg font-semibold text-purple-400 mb-2">💡 การตัดสินใจลงทุนต้องอาศัยข้อมูลที่แม่นยำ</p>
                  <p className="text-slate-400 leading-relaxed">เครื่องมือช่วยวิเคราะห์จะทำให้คุณคำนวณได้รวดเร็ว แม่นยำ และเห็นภาพรวมทางการเงินได้ชัดเจนขึ้น</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🛠️</span> เครื่องมือหลักและการใช้งาน (10 เครื่องมือ)
                  </h3>
                  
                  <div className="grid gap-4">
                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">📊</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2">1. เครื่องคิดเลขต้นทุนเฉลีย (Average Calculator)</h4>
                          <p className="text-sm text-slate-400 mb-3">คำนวณราคาเฉลี่ยเมื่อซื้อหุ้นหลายครั้งในราคาต่างกัน</p>
                          <div className="bg-slate-900/50 p-3 rounded-xl space-y-1 text-xs">
                            <p className="text-purple-400 font-semibold">✓ ใช้เมื่อไร:</p>
                            <p className="text-slate-300">• เทรดหุ้นตัวเดิมหลายครั้ง ต้องการรู้ต้นทุนจริง</p>
                            <p className="text-slate-300">• วางแผนซื้อเพิ่มหรือขายบางส่วน</p>
                            <p className="text-slate-300">• ทำ Dollar Cost Averaging (DCA)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">📈</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2">2. คำนวณดอกเบี้ยทบต้น (Compound Interest)</h4>
                          <p className="text-sm text-slate-400 mb-3">คำนวณว่าเงินของคุณจะเติบโตเป็นเท่าไหร่ในอนาคต</p>
                          <div className="bg-slate-900/50 p-3 rounded-xl space-y-1 text-xs">
                            <p className="text-purple-400 font-semibold">✓ ใช้เมื่อไร:</p>
                            <p className="text-slate-300">• วางแผนออมเงินระยะยาว</p>
                            <p className="text-slate-300">• เปรียบเทียบผลตอบแทนของการลงทุนต่างๆ</p>
                            <p className="text-slate-300">• ตั้งเป้าหมายการเงินระยะยาว (เกษียณ, ซื้อบ้าน)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">🎯</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2">3. กำหนดเป้ากำไร (Profit Target)</h4>
                          <p className="text-sm text-slate-400 mb-3">คำนวณราคาขายที่ต้องการเพื่อให้ได้กำไรตามเป้า</p>
                          <div className="bg-slate-900/50 p-3 rounded-xl space-y-1 text-xs">
                            <p className="text-purple-400 font-semibold">✓ ใช้เมื่อไร:</p>
                            <p className="text-slate-300">• ต้องการทำกำไร 10%, 20%, 50%</p>
                            <p className="text-slate-300">• วางแผนขายหุ้นเป็นขั้นบันได (Scale out)</p>
                            <p className="text-slate-300">• ตั้งราคา Take Profit ก่อนซื้อ</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">🛡️</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2">4. คำนวณ Stop Loss</h4>
                          <p className="text-sm text-slate-400 mb-3">กำหนดจุดตัดขาดทุนเพื่อป้องกันความเสี่ยง</p>
                          <div className="bg-slate-900/50 p-3 rounded-xl space-y-1 text-xs">
                            <p className="text-purple-400 font-semibold">✓ ใช้เมื่อไร:</p>
                            <p className="text-slate-300">• ต้องการควบคุมความเสี่ยงไม่เกิน 5-10%</p>
                            <p className="text-slate-300">• เทรดระยะสั้น ต้องมีวินัย</p>
                            <p className="text-slate-300">• ป้องกันขาดทุนหนัก (Risk Management)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">💰</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2">5. จัดสรรเงิน (Money Allocation)</h4>
                          <p className="text-sm text-slate-400 mb-3">แบ่งเงินตามสัดส่วนที่เหมาะสม (50/30/20 Rule)</p>
                          <div className="bg-slate-900/50 p-3 rounded-xl space-y-1 text-xs">
                            <p className="text-purple-400 font-semibold">✓ ใช้เมื่อไร:</p>
                            <p className="text-slate-300">• เริ่มต้นบริหารการเงิน</p>
                            <p className="text-slate-300">• แบ่งเงินเดือน: ค่าใช้จ่าย/ออม/ลงทุน</p>
                            <p className="text-slate-300">• ทำ Portfolio Diversification</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">🚨</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2">6. กองทุนฉุกเฉิน (Emergency Fund)</h4>
                          <p className="text-sm text-slate-400 mb-3">คำนวณเงินสำรองฉุกเฉินที่เพียงพอ</p>
                          <div className="bg-slate-900/50 p-3 rounded-xl space-y-1 text-xs">
                            <p className="text-purple-400 font-semibold">✓ ใช้เมื่อไร:</p>
                            <p className="text-slate-300">• เตรียมเงินสำรอง 6-12 เดือน</p>
                            <p className="text-slate-300">• ก่อนเริ่มลงทุน (ต้องมีเงินฉุกเฉินก่อน)</p>
                            <p className="text-slate-300">• รับมือเหตุไม่คาดฝัน: ตกงาน, ป่วย</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">🧮</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2">7. คำนวณภาษี (Tax Calculator)</h4>
                          <p className="text-sm text-slate-400 mb-3">คำนวณภาษีจากกำไรหุ้นและเงินปันผล</p>
                          <div className="bg-slate-900/50 p-3 rounded-xl space-y-1 text-xs">
                            <p className="text-purple-400 font-semibold">✓ ใช้เมื่อไร:</p>
                            <p className="text-slate-300">• คำนวณภาษีกำไรหุ้นก่อนปลายปี</p>
                            <p className="text-slate-300">• ประเมินภาษีเงินปันผล</p>
                            <p className="text-slate-300">• วางแผนการลงทุนให้คุ้มภาษี</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">💵</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2">8. คำนวณเงินปันผล (Dividend Calculator)</h4>
                          <p className="text-sm text-slate-400 mb-3">คำนวณจำนวนหุ้นที่ต้องถือเพื่อให้ได้เงินปันผลตามเป้า</p>
                          <div className="bg-slate-900/50 p-3 rounded-xl space-y-1 text-xs">
                            <p className="text-purple-400 font-semibold">✓ ใช้เมื่อไร:</p>
                            <p className="text-slate-300">• ต้องการรายได้จากเงินปันผล (Passive Income)</p>
                            <p className="text-slate-300">• วางแผนเกษียณด้วยหุ้นปันผล</p>
                            <p className="text-slate-300">• คำนวณ Dividend Yield ที่เหมาะสม</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">📋</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2">9. คำนวณต้นทุน FIFO (FIFO Calculator)</h4>
                          <p className="text-sm text-slate-400 mb-3">คำนวณต้นทุนแบบ First In First Out เมื่อซื้อ-ขายหลายครั้ง</p>
                          <div className="bg-slate-900/50 p-3 rounded-xl space-y-1 text-xs">
                            <p className="text-purple-400 font-semibold">✓ ใช้เมื่อไร:</p>
                            <p className="text-slate-300">• ซื้อหุ้นหลายครั้งในราคาต่างกัน แล้วขายบางส่วน</p>
                            <p className="text-slate-300">• คำนวณกำไร-ขาดทุนที่แท้จริง</p>
                            <p className="text-slate-300">• ทำบัญชีต้นทุนหุ้นอย่างถูกต้องตามกฎหมาย</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                      <div className="flex gap-3">
                        <span className="text-2xl">📐</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2">10. คำนวณแนวรับ 4 ไม้ (Support Levels)</h4>
                          <p className="text-sm text-slate-400 mb-3">คำนวณแนวรับ (Support) ด้วย 4 วิธี: ปกติ, Fibonacci, Golden Ratio, Shallow/Deep</p>
                          <div className="bg-slate-900/50 p-3 rounded-xl space-y-1 text-xs">
                            <p className="text-purple-400 font-semibold">✓ ใช้เมื่อไร:</p>
                            <p className="text-slate-300">• วิเคราะห์กราฟเทคนิค (Technical Analysis)</p>
                            <p className="text-slate-300">• หาจุดซื้อที่เหมาะสม (แนวรับ)</p>
                            <p className="text-slate-300">• ตั้งราคา Entry และ Stop Loss อ้างอิงแนวรับ</p>
                            <p className="text-slate-300">• เทรดระยะสั้น - กลาง ด้วย Price Action</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-purple-500/20 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">✨</span> ข้อดีของการใช้เครื่องมือ
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-sm"><strong className="text-white">รวดเร็วแม่นยำ:</strong> ไม่ต้องคำนวณเอง ลดข้อผิดพลาด</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-sm"><strong className="text-white">เห็นภาพชัด:</strong> มีกราฟและตารางประกอบ</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-sm"><strong className="text-white">ประหยัดเวลา:</strong> คำนวณได้ทันที ไม่ต้องใช้สเปรดชีต</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-sm"><strong className="text-white">ตัดสินใจดีขึ้น:</strong> มีข้อมูลรองรับทุกการตัดสินใจ</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-sm"><strong className="text-white">ลดความเสี่ยง:</strong> คำนวณ Stop Loss และบริหารเงิน</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-sm"><strong className="text-white">เข้าใจง่าย:</strong> UI สวยงาม ใช้งานได้ทันที</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 p-5 rounded-2xl">
                  <div className="flex gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-bold text-yellow-400 mb-2">เคล็ดลับ: ใช้เครื่องมือร่วมกัน</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        ลองใช้หลายเครื่องมือร่วมกัน เช่น <strong className="text-white">คำนวณดอกเบี้ยทบต้น</strong> เพื่อดูว่าเงินจะเติบโตเท่าไหร่ 
                        แล้วใช้ <strong className="text-white">จัดสรรเงิน</strong> เพื่อแบ่งเงินที่ควรลงทุน หรือใช้ <strong className="text-white">เป้ากำไร</strong> กับ <strong className="text-white">Stop Loss</strong> 
                        ร่วมกับ <strong className="text-white">แนวรับ 4 ไม้</strong> เพื่อกำหนดกลยุทธ์เทรดที่สมบูรณ์
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <button 
                    onClick={() => {
                      setShowToolsInfo(false);
                      router.push('/tool');
                    }}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-purple-500/25 hover:scale-105"
                  >
                    ดูเครื่องมือทั้งหมด 🛠️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowRetirementInfo(true)} 
                    className="text-sm font-semibold text-orange-500 flex items-center gap-1.5 hover:text-orange-400 transition-colors px-3 py-2 rounded-xl hover:bg-orange-500/10"
                  >
                    <HelpCircle className="w-4 h-4" />
                    ทำไมต้องวางแผนเกษียณ?
                  </button>
                  <button onClick={() => router.push("/plan")} className="text-sm font-bold text-orange-500 flex items-center gap-1 hover:underline">
                    ดูทั้งหมด <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-purple-500" /> เครื่องมือช่วยวิเคราะห์
                </h2>
                <button 
                  onClick={() => setShowToolsInfo(true)} 
                  className="text-xs font-semibold text-purple-500 flex items-center gap-1 hover:text-purple-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-purple-500/10"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  ทำไมต้องใช้?
                </button>
              </div>
              <div className="space-y-3">
                {displayedTools.map((tool) => (
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