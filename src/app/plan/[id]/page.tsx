"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { BlockMath } from 'react-katex';
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Label,
} from "recharts";
import {
  ChevronLeft,
  TrendingUp,
  Target as TargetIcon,
  Calendar,
  DollarSign,
  Settings,
  PieChart,
  Save,
  Trash2,
  Loader2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
  Bot,
  Sparkles,
} from "lucide-react";
import {
  TextField,
  InputAdornment,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#818cf8" },
    background: { paper: "#1f2937" },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "16px",
            backgroundColor: "rgba(31, 41, 55, 0.4)",
            "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
            "&:hover fieldset": { borderColor: "rgba(129, 140, 248, 0.5)" },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "32px",
          backgroundColor: "#111827",
          backgroundImage: "linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(255,255,255,0))",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          padding: "8px",
        },
      },
    },
  },
});

type PlanAnalysisData = {
  planName: string;
  executiveSummary: string;
  strategyAnalysis: {
    investmentMix: string;
    riskManagement: string;
  };
  actionPlan: string[];
};

export default function PlanWorkspace() {
  const { id } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [tempName, setTempName] = useState("");
  const [statusModal, setStatusModal] = useState({ open: false, title: "", message: "", type: "success" });
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [planAnalysis, setPlanAnalysis] = useState<PlanAnalysisData | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const cookies = parseCookies();
        const res = await axios.get(`http://localhost:3001/plans/${id}`, {
          headers: { Authorization: `Bearer ${cookies.accessToken}` },
        });
        const data = res.data;
        if (data.planType === "ib") data.monthlyExpenses = data.money;
        else data.targetLumpSum = data.money;
        setPlan(data);
      } catch (err) {
        router.push("/plan");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id, router]);

  const handleLocalUpdate = (field: string, value: string) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    setPlan((prev: any) => ({ ...prev, [field]: numValue }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const cookies = parseCookies();
      const moneyValue = plan.planType === "ib" ? plan.monthlyExpenses : plan.targetLumpSum;
      const payload = {
        name: plan.name,
        currentAge: Number(plan.currentAge),
        retirementAge: Number(plan.retirementAge),
        money: Number(moneyValue),
        currentSavings: Number(plan.currentSavings),
        expectedReturn: Number(plan.expectedReturn),
        inflationRate: Number(plan.inflationRate),
        retirementYears: Number(plan.retirementYears),
      };
      await axios.patch(`http://localhost:3001/plans/${id}`, payload, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });
      setStatusModal({ open: true, title: "สำเร็จ", message: "บันทึกการเปลี่ยนแปลงของคุณเรียบร้อยแล้ว", type: "success" });
    } catch (err) {
      setStatusModal({ open: true, title: "เกิดข้อผิดพลาด", message: "ไม่สามารถบันทึกข้อมูลได้", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const calculateFV = (pv: number, pmt: number, annualRate: number, years: number) => {
    const r = annualRate / 100;
    const months = years * 12;
    if (r === 0) return pv + pmt * months;
    const monthlyRate = r / 12;
    const fvLumpSum = pv * Math.pow(1 + monthlyRate, months);
    const fvAnnuity = pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return fvLumpSum + fvAnnuity;
  };

  const results = useMemo(() => {
    if (!plan) return null;
    const currentAge = Number(plan.currentAge) || 0;
    const retirementAge = Number(plan.retirementAge) || 60;
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    const annualReturn = Number(plan.expectedReturn) || 0;
    const currentSavings = Number(plan.currentSavings) || 0;

    if (plan.planType === "gb") {
      const targetLumpSum = Number(plan.targetLumpSum) || 0;
      const fvCurrent = calculateFV(currentSavings, 0, annualReturn, yearsToRetirement);
      const needed = Math.max(0, targetLumpSum - fvCurrent);
      const r = annualReturn / 100;
      const monthlyRate = r / 12;
      const months = yearsToRetirement * 12;
      let monthly = 0;
      if (months > 0) {
        monthly = monthlyRate === 0 ? needed / months : (needed * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
      }
      return { monthly, fvCurrent, needed, yearsToRetirement, target: targetLumpSum };
    } else {
      const inflation = (Number(plan.inflationRate) || 0) / 100;
      const monthlyExpenses = Number(plan.monthlyExpenses) || 0;
      const retirementYears = Number(plan.retirementYears) || 0;
      const futureExpensesMonthly = monthlyExpenses * Math.pow(1 + inflation, yearsToRetirement);
      const futureExpensesYearly = futureExpensesMonthly * 12;
      const realReturn = (1 + 0) / (1 + inflation) - 1;
      let totalNeeds = Math.abs(realReturn) < 0.00001 ? futureExpensesYearly * retirementYears : (futureExpensesYearly * (1 - Math.pow(1 + realReturn, -retirementYears))) / realReturn;
      const fvCurrent = calculateFV(currentSavings, 0, annualReturn, yearsToRetirement);
      const needed = Math.max(0, totalNeeds - fvCurrent);
      const monthlyRate = annualReturn / 100 / 12;
      const months = yearsToRetirement * 12;
      const monthly = months > 0 ? (monthlyRate === 0 ? needed / months : (needed * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1)) : 0;
      return { monthly, fvCurrent, needed, yearsToRetirement, target: totalNeeds, futureExpenses: futureExpensesMonthly };
    }
  }, [plan]);

  const chartData = useMemo(() => {
    if (!results || !plan) return [];
    const data = [];
    const startAge = Number(plan.currentAge);
    const retireAge = Number(plan.retirementAge);
    for (let age = startAge; age <= retireAge; age++) {
      const yearsPassed = age - startAge;
      data.push({
        age,
        เงินต้น: Math.round(Number(plan.currentSavings) + (results.monthly * 12 * yearsPassed)),
        มูลค่าพอร์ต: Math.round(calculateFV(Number(plan.currentSavings), results.monthly, Number(plan.expectedReturn), yearsPassed)),
      });
    }
    return data;
  }, [results, plan]);

  const fetchPlanAnalysis = async () => {
    if (!plan || !results || (plan.planType !== "ib" && plan.planType !== "gb")) return;

    setAiLoading(true);
    setAiError("");

    try {
      const basePayload = {
        planName: plan.name,
        age: Number(plan.currentAge),
        retirementAge: Number(plan.retirementAge),
        saving: Number(plan.currentSavings),
        returns: Number(plan.expectedReturn),
        inflation: Number(plan.inflationRate),
        totalTarget: Number(results.target || 0),
        monthlyInvestment: Number(results.monthly || 0),
      };

      const endpoint = plan.planType === "ib"
        ? "http://localhost:3001/gemini/prompt/incomePlan"
        : "http://localhost:3001/gemini/prompt/goalStrategyPlan";

      const payload = plan.planType === "ib"
        ? {
            ...basePayload,
            income: Number(plan.monthlyExpenses ?? plan.money ?? 0),
          }
        : basePayload;

      const response = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data?.success && response.data?.data) {
        setPlanAnalysis(response.data.data as PlanAnalysisData);
        return;
      }

      setAiError("ไม่พบข้อมูลวิเคราะห์จาก AI");
    } catch {
      setAiError("ไม่สามารถโหลดการวิเคราะห์แผนได้");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <LinearProgress sx={{ width: 200 }} color="primary" />
    </div>
  );

  const finalAmount = chartData[chartData.length - 1]?.มูลค่าพอร์ต || 0;

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 flex flex-col lg:flex-row overflow-hidden">

        {/* SIDEBAR */}
        <aside className="w-full lg:w-[420px] bg-[#0f1218]/80 backdrop-blur-md border-r border-white/5 p-6 overflow-y-auto flex flex-col z-10">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => router.push("/plan")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft size={18} /> <span>กลับ</span>
            </button>
            <button onClick={() => setStatusModal({ open: true, title: "ยืนยันการลบ", message: "", type: "delete" })} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
              <Trash2 size={18} />
            </button>
          </div>

          <div className="mb-8">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border ${plan.planType === "ib" ? "text-blue-400 border-blue-400/30" : "text-emerald-400 border-emerald-400/30"}`}>
              {plan.planType === "ib" ? "Income Strategy" : "Goal Strategy"}
            </div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3 cursor-pointer" onClick={() => { setTempName(plan.name); setIsRenameOpen(true); }}>
              {plan.name} <Edit2 size={16} className="text-gray-500" />
            </h1>
          </div>

          <div className="space-y-6 flex-1">
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="อายุปัจจุบัน" type="number" value={plan.currentAge || ""} onChange={(e) => handleLocalUpdate("currentAge", e.target.value)} fullWidth />
                <TextField label="อายุเกษียณ" type="number" value={plan.retirementAge || ""} onChange={(e) => handleLocalUpdate("retirementAge", e.target.value)} fullWidth />
              </div> </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={14} /> Finance</h3>
              <div className="space-y-4">
                <TextField
                  label={plan.planType === "ib" ? "รายจ่าย/เดือน" : "เงินก้อนเป้าหมาย"}
                  type="number"
                  value={(plan.planType === "ib" ? plan.monthlyExpenses : plan.targetLumpSum) || ""}
                  onChange={(e) => handleLocalUpdate(plan.planType === "ib" ? "monthlyExpenses" : "targetLumpSum", e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }} fullWidth
                />
                <TextField label="เงินออมที่มีอยู่" type="number" value={plan.currentSavings || ""} onChange={(e) => handleLocalUpdate("currentSavings", e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }} fullWidth />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Settings size={14} /> Assumption</h3>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="ผลตอบแทน (%)" type="number" value={plan.expectedReturn || ""} onChange={(e) => handleLocalUpdate("expectedReturn", e.target.value)} fullWidth />
                <TextField label="เงินเฟ้อ (%)" type="number" value={plan.inflationRate || ""} onChange={(e) => handleLocalUpdate("inflationRate", e.target.value)} fullWidth />
              </div>
            </section>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 sticky bottom-0 bg-[#0f1218] py-4">
            <button onClick={handleSaveChanges} disabled={isSaving} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50">
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} บันทึกการแก้ไข
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-10 pb-20 pt-16">

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ปรับสีจาก indigo-600 เป็น indigo-900/40 และเพิ่ม border */}
              <div className="md:col-span-2 bg-indigo-900/40 backdrop-blur-xl p-8 rounded-[32px] text-white border border-indigo-500/20 shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-indigo-300 text-sm font-medium mb-1">ต้องออมเพิ่มต่อเดือน</p>
                  <h2 className="text-5xl font-black mb-4 tracking-tighter text-indigo-50">
                    ฿{new Intl.NumberFormat().format(Math.round(results?.monthly || 0))}
                  </h2>
                  <div className="inline-flex items-center gap-2 bg-indigo-500/20 px-3 py-1 rounded-lg text-xs font-bold text-indigo-300 border border-indigo-500/30">
                    <TrendingUp size={14} /> คาดการณ์ผลตอบแทน {plan.expectedReturn}%
                  </div>
                </div>
                {/* ปรับสี Icon พื้นหลังให้กลืนไปกับ Card */}
                <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.05] text-indigo-300 group-hover:scale-110 transition-transform">
                  <PieChart size={200} />
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-md p-8 rounded-[32px] border border-white/5 flex flex-col justify-center text-center">
                <p className="text-gray-400 text-sm mb-1">เวลาออมที่เหลือ</p>
                <h3 className="text-5xl font-black text-white">{results?.yearsToRetirement} <span className="text-xl text-gray-500">ปี</span></h3>
              </div>
            </div>

            {/* CHART AREA */}
            <div className="bg-gray-800/20 p-8 rounded-[40px] border border-white/5 relative">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">เส้นทางการเติบโตของเงินทุน</h3>
                <p className="text-gray-500 text-sm">เปรียบเทียบระหว่างเงินต้นสะสม และผลตอบแทนจากการลงทุน</p>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 40, right: 40, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fill: "#6b7280" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280" }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}
                      formatter={(value: any) => [`฿${new Intl.NumberFormat().format(Number(value))}`, ""]}
                    />

                    {/* ปรับ Legend: เพิ่ม wrapperStyle เพื่อยกตำแหน่งขึ้น และเพิ่ม padding */}
                    <Legend
                      iconType="circle"
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingTop: "-20px", paddingBottom: "20px" }}
                    />

                    <ReferenceLine x={plan.retirementAge} stroke="#818cf8" strokeDasharray="5 5">
                      {/* ปรับ Label ให้เยื้องไปทางซ้ายเล็กน้อยเพื่อไม่ให้ตกขอบขวา */}
                      <Label
                        value={finalAmount > 1000000 ? `เป้าหมาย: ฿${(finalAmount / 1000000).toFixed(2)}M` : `เป้าหมาย: ฿${(finalAmount / 1000).toFixed(0)}K`}
                        position="top"
                        offset={5}
                        dx={1}
                        fill="#818cf8"
                        style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textAnchor: 'end'
                        }}
                      />
                    </ReferenceLine>

                    <Line type="monotone" dataKey="เงินต้น" stroke="#4b5563" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="มูลค่าพอร์ต" stroke={plan.planType === "ib" ? "#60a5fa" : "#34d399"} strokeWidth={4} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-400">
                  <Info size={20} />
                </div>
                <p className="text-sm text-indigo-200/70">
                  เมื่อคุณอายุครบ <strong>{plan.retirementAge} ปี</strong> คุณจะมีเงินรวมทั้งหมด <strong>฿{new Intl.NumberFormat().format(finalAmount)}</strong> ตามแผนการนี้
                </p>
              </div>
            </div>

            {/* FORMULA SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2"><Settings size={18} className="text-indigo-400" /> สูตรคำนวณที่ใช้</h4>
                <div className="p-6 bg-gray-800/30 rounded-3xl border border-white/5 space-y-4">
                  <div>
                    <p className="text-xs text-indigo-400 font-bold uppercase mb-2">1. การหาเงินต้นในอนาคต (FV)</p>
                    <Typography component="div" className="text-sm text-gray-300 font-mono">
                      <BlockMath math="FV = PV(1 + r)^n + PMT[( (1 + r)^n - 1 ) / r]" />
                    </Typography>
                    <p className="text-[11px] text-gray-500 mt-2">คำนวณมูลค่าเงินออมปัจจุบันบวกกับเงินออมเพิ่มรายเดือน</p>
                  </div>
                  <div className="h-px bg-white/5 w-full" />
                  <div>
                    <p className="text-xs text-emerald-400 font-bold uppercase mb-2">2. การหาเงินออมรายเดือน (PMT)</p>
                    <Typography component="div" className="text-sm text-gray-300 font-mono">
                      <BlockMath math="PMT = \frac{Target - FV_{current}}{\frac{(1 + r)^n - 1}{r}}" />
                    </Typography>
                    <p className="text-[11px] text-gray-500 mt-2">หาจำนวนเงินที่ต้องเก็บเพิ่มในแต่ละเดือนเพื่อให้ถึงเป้าหมาย</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-[32px] border border-white/5">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">สรุปเป้าหมาย</h4>
                <ul className="space-y-4 text-sm">
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400 text-xs">เงินที่ต้องใช้รวม</span>
                    <span className="text-white font-bold">฿{new Intl.NumberFormat().format(Math.round(results?.target || 0))}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400 text-xs">เงินเติบโตจากก้อนเดิม</span>
                    <span className="text-emerald-400 font-bold">฿{new Intl.NumberFormat().format(Math.round(results?.fvCurrent || 0))}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-2 text-rose-400">
                    <span className="text-gray-400 text-xs">ส่วนต่างที่ยังขาด</span>
                    <span className="font-bold">฿{new Intl.NumberFormat().format(Math.round(results?.needed || 0))}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        {/* AI ANALYSIS SIDEBAR (Income + Goal plan) */}
        {(plan.planType === "ib" || plan.planType === "gb") && (
          <>
            <button
              onClick={async () => {
                setIsAiSidebarOpen((prev) => !prev);
                if (!planAnalysis && !aiLoading) {
                  await fetchPlanAnalysis();
                }
              }}
              className="fixed right-6 top-24 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg"
            >
              <Bot size={18} /> AI วิเคราะห์แผน
            </button>

            <aside
              className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#0b1220]/95 backdrop-blur-md border-l border-white/10 z-20 p-6 pt-20 overflow-y-auto transition-transform duration-300 ${isAiSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
            >
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-indigo-300 font-bold mb-2">
                    {plan.planType === "ib" ? "AI Income Plan" : "AI Goal Plan"}
                  </p>
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-300" />
                    {plan.planType === "ib" ? "วิเคราะห์แผนรายได้" : "วิเคราะห์แผนเป้าหมาย"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAiSidebarOpen(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ปิด
                </button>
              </div>

              <div className="mb-5">
                <button
                  onClick={fetchPlanAnalysis}
                  disabled={aiLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl px-4 py-3 font-bold"
                >
                  {aiLoading ? "กำลังวิเคราะห์..." : "วิเคราะห์ใหม่"}
                </button>
              </div>

              {aiError && (
                <div className="mb-4 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm">
                  {aiError}
                </div>
              )}

              {!aiLoading && planAnalysis && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xs text-indigo-300 font-bold mb-2">Executive Summary</p>
                    <p className="text-sm text-gray-200 leading-relaxed">{planAnalysis.executiveSummary}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <p className="text-xs text-indigo-300 font-bold">Strategy Analysis</p>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase">Investment Mix</p>
                      <p className="text-sm text-gray-200 leading-relaxed">{planAnalysis.strategyAnalysis?.investmentMix}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase">Risk Management</p>
                      <p className="text-sm text-gray-200 leading-relaxed">{planAnalysis.strategyAnalysis?.riskManagement}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xs text-indigo-300 font-bold mb-2">Action Plan</p>
                    <ul className="space-y-2">
                      {(planAnalysis.actionPlan || []).map((item, index) => (
                        <li key={`${item}-${index}`} className="text-sm text-gray-200 flex items-start gap-2">
                          <ArrowRight size={14} className="mt-1 text-indigo-300 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-xs text-amber-100 leading-relaxed">
                    ข้อสงวนสิทธิ์: ข้อมูลนี้สร้างโดย AI เพื่อประกอบการตัดสินใจเบื้องต้น ไม่ใช่คำแนะนำการลงทุนแบบเฉพาะบุคคล
                  </div>
                </div>
              )}
            </aside>
          </>
        )}
      </div>

      {/* RENAME DIALOG */}
      <Dialog open={isRenameOpen} onClose={() => setIsRenameOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="text-white font-bold text-2xl pt-8 px-8">แก้ไขชื่อแผนงาน</DialogTitle>
        <DialogContent className="px-8 py-4">
          <TextField autoFocus label="ชื่อแผนใหม่" fullWidth value={tempName} onChange={(e) => setTempName(e.target.value)} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions className="px-8 pb-8 pt-4">
          <Button onClick={() => setIsRenameOpen(false)} sx={{ color: "gray" }}>ยกเลิก</Button>
          <Button onClick={() => { setPlan((prev: any) => ({ ...prev, name: tempName })); setIsRenameOpen(false); }} variant="contained" className="bg-indigo-600 px-6 py-2 rounded-xl font-bold">บันทึก</Button>
        </DialogActions>
      </Dialog>

      {/* STATUS & CONFIRMATION DIALOG */}
      <Dialog open={statusModal.open} onClose={() => setStatusModal({ ...statusModal, open: false })} maxWidth="xs" fullWidth>
        <DialogContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            {statusModal.type === "success" && <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500"><CheckCircle2 size={48} /></div>}
            {statusModal.type === "error" && <div className="p-4 bg-rose-500/10 rounded-full text-rose-500"><AlertCircle size={48} /></div>}
            {statusModal.type === "delete" && <div className="p-4 bg-amber-500/10 rounded-full text-amber-500"><AlertCircle size={48} /></div>}
          </div>
          <Typography variant="h5" className="font-bold text-white mb-2">{statusModal.title}</Typography>
          <Typography className="text-gray-400">{statusModal.message}</Typography>
        </DialogContent>
        <DialogActions className="px-8 pb-8 flex flex-col gap-2">
          {statusModal.type === "delete" ? (
            <div className="flex w-full gap-3">
              <Button fullWidth onClick={() => setStatusModal({ ...statusModal, open: false })} className="bg-gray-800 text-white py-3 rounded-xl">ยกเลิก</Button>
              <Button
                fullWidth
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    const cookies = parseCookies();
                    await axios.delete(`http://localhost:3001/plans/${id}`, { headers: { Authorization: `Bearer ${cookies.accessToken}` } });
                    router.push("/plan");
                  } catch (err) { setStatusModal({ open: true, title: "ผิดพลาด", message: "ลองใหม่อีกครั้ง", type: "error" }); }
                  finally { setIsDeleting(false); }
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold"
              >
                {isDeleting ? "กำลังลบ..." : "ลบข้อมูล"}
              </Button>
            </div>
          ) : (
            <Button fullWidth onClick={() => setStatusModal({ ...statusModal, open: false })} variant="contained" className="bg-indigo-600 py-3 rounded-xl font-bold">ตกลง</Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}