"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { parseCookies } from "nookies";
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
            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
              {
                "-webkit-appearance": "none",
                margin: 0,
              },
            "& input[type=number]": {
              "-moz-appearance": "textfield",
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "32px",
          backgroundColor: "#111827",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        },
      },
    },
  },
});

export default function PlanWorkspace() {
  const { id } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [tempName, setTempName] = useState("");

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
  }, [id]);

  const handleLocalUpdate = (field: string, value: string) => {
    // ป้องกัน NaN: ถ้าค่าว่างให้เป็น 0
    const numValue = value === "" ? 0 : parseFloat(value);
    setPlan((prev: any) => ({ ...prev, [field]: numValue }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const cookies = parseCookies();
      const moneyValue =
        plan.planType === "ib" ? plan.monthlyExpenses : plan.targetLumpSum;
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
      alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบแผนนี้?")) return;
    setIsDeleting(true);
    try {
      const cookies = parseCookies();
      await axios.delete(`http://localhost:3001/plans/${id}`, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });
      router.push("/plan");
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const openRenameModal = () => {
    setTempName(plan.name);
    setIsRenameOpen(true);
  };

  const handleRenameSave = () => {
    if (tempName.trim()) {
      setPlan((prev: any) => ({ ...prev, name: tempName }));
      setIsRenameOpen(false);
    }
  };

  // --- HELPER: Future Value Formula (Monthly Compounding) ---
  const calculateFV = (
    pv: number,
    pmt: number,
    annualRate: number,
    years: number
  ) => {
    const r = annualRate / 100;
    const months = years * 12;

    if (r === 0) {
      return pv + pmt * months;
    }

    const monthlyRate = r / 12;
    // FV = PV * (1+i)^n + PMT * [ ((1+i)^n - 1) / i ]
    const fvLumpSum = pv * Math.pow(1 + monthlyRate, months);
    const fvAnnuity =
      pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    return fvLumpSum + fvAnnuity;
  };

  // --- 1. CORE CALCULATION LOGIC ---
  const results = useMemo(() => {
    if (!plan) return null;

    const currentAge = Number(plan.currentAge) || 0;
    const retirementAge = Number(plan.retirementAge) || 60;
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    const annualReturn = Number(plan.expectedReturn) || 0;
    const currentSavings = Number(plan.currentSavings) || 0;

    if (plan.planType === "gb") {
      // Goal Based
      const targetLumpSum = Number(plan.targetLumpSum) || 0;

      // Calculate FV using helper for consistency
      const fvCurrent = calculateFV(
        currentSavings,
        0,
        annualReturn,
        yearsToRetirement
      );
      const needed = Math.max(0, targetLumpSum - fvCurrent);

      // Calculate Monthly Payment using PMT Formula
      // PMT = FV * i / ((1+i)^n - 1)
      const r = annualReturn / 100;
      const monthlyRate = r / 12;
      const months = yearsToRetirement * 12;

      let monthly = 0;
      if (months > 0) {
        if (monthlyRate === 0) {
          monthly = needed / months;
        } else {
          monthly =
            (needed * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
        }
      }

      return {
        monthly,
        fvCurrent,
        needed,
        yearsToRetirement,
        target: targetLumpSum,
        endAge: retirementAge,
      };
    } else {
      // Income Based
      const inflation = (Number(plan.inflationRate) || 0) / 100;
      const monthlyExpenses = Number(plan.monthlyExpenses) || 0;
      const retirementYears = Number(plan.retirementYears) || 0;

      // Expense at Retirement Day (Monthly)
      const futureExpensesMonthly =
        monthlyExpenses * Math.pow(1 + inflation, yearsToRetirement);
      const futureExpensesYearly = futureExpensesMonthly * 12;

      // Total Pot Needed at 60
      const r = annualReturn / 100;
      // Real Return = (1+r)/(1+i) - 1 (Assuming 0% growth AFTER retirement as per previous logic request, or keeping expected return?
      // Usually post-retirement is conservative. Let's assume standard Real Return formula for safety)
      const nominalReturnPostRetirement = 0; // As per discussion "เงินลดลงเรื่อยๆ" implies no investment return, just raw usage vs inflation
      const realReturn =
        (1 + nominalReturnPostRetirement) / (1 + inflation) - 1;

      let totalNeeds = 0;
      if (Math.abs(realReturn) < 0.00001) {
        totalNeeds = futureExpensesYearly * retirementYears;
      } else {
        totalNeeds =
          (futureExpensesYearly *
            (1 - Math.pow(1 + realReturn, -retirementYears))) /
          realReturn;
      }

      // FV of Current Savings
      const fvCurrent = calculateFV(
        currentSavings,
        0,
        annualReturn,
        yearsToRetirement
      );
      const needed = Math.max(0, totalNeeds - fvCurrent);

      // Monthly Savings
      const monthlyRate = annualReturn / 100 / 12;
      const months = yearsToRetirement * 12;
      let monthly = 0;

      if (months > 0) {
        if (monthlyRate === 0) {
          monthly = needed / months;
        } else {
          monthly =
            (needed * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
        }
      }

      return {
        monthly,
        fvCurrent,
        needed,
        yearsToRetirement,
        target: totalNeeds,
        futureExpenses: futureExpensesMonthly,
        futureExpensesYearly,
        endAge: retirementAge + retirementYears,
      };
    }
  }, [plan]);

  // --- 2. CHART SIMULATION LOGIC ---
  const chartData = useMemo(() => {
    if (!results || !plan) return [];

    const data = [];
    const startAge = Number(plan.currentAge);
    const retireAge = Number(plan.retirementAge);
    const endAge = results.endAge;

    const monthlyContrib = results.monthly;
    const annualReturn = Number(plan.expectedReturn) || 0;
    const inflation = (Number(plan.inflationRate) || 0) / 100;
    const currentSavings = Number(plan.currentSavings) || 0;

    // Simulation State
    let portfolioBalance = currentSavings; // Tracks total value

    // Create data points
    for (let age = startAge; age <= endAge; age++) {
      const yearsPassed = age - startAge;
      const isRetired = age >= retireAge;

      // 1. Calculate values for this age
      let currentVal = 0;
      let principalVal = 0;

      if (age <= retireAge) {
        // --- ACCUMULATION PHASE ---
        // Use EXACT Formula for Accumulation to match Summary Cards
        currentVal = calculateFV(
          currentSavings,
          monthlyContrib,
          annualReturn,
          yearsPassed
        );
        principalVal = currentSavings + monthlyContrib * 12 * yearsPassed;

        // Store balance for transition to retirement
        portfolioBalance = currentVal;
      } else {
        // --- DECUMULATION PHASE (Post-Retirement) ---
        // Iterative approach from last known balance (at retirement)
        // Get previous balance
        const prevData = data[data.length - 1];
        let prevBalance = prevData ? prevData["มูลค่าพอร์ต"] : portfolioBalance;

        // Growth (0% nominal as requested for "spending down")
        // If you want low risk return, change 0 to something else.
        // Assuming 0% nominal return on remaining pot:
        prevBalance = prevBalance * (1 + 0);

        // Withdrawal
        const yearsInRetirement = age - retireAge - 1; // -1 because we are at end of year
        // Expense grows by inflation
        const yearlyWithdrawal =
          results.futureExpensesYearly *
          Math.pow(1 + inflation, yearsInRetirement);

        currentVal = Math.max(0, prevBalance - yearlyWithdrawal);

        // Principal stays constant after retirement (no new money added)
        principalVal = data[data.length - 1]["เงินต้น"];
      }

      data.push({
        age,
        เงินต้น: Math.round(principalVal),
        มูลค่าพอร์ต: Math.round(currentVal),
      });
    }

    return data;
  }, [results, plan]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <LinearProgress
            sx={{ width: 200, borderRadius: 2 }}
            color="primary"
          />
          <p className="mt-4 text-gray-400">กำลังโหลดข้อมูลแผนงาน...</p>
        </div>
      </div>
    );

  const accentColor = plan.planType === "ib" ? "#60a5fa" : "#34d399";

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 flex flex-col lg:flex-row font-sans pt-16 lg:pt-16">
        {/* LEFT: Sticky Sidebar */}
        <aside className="w-full lg:w-[420px] bg-[#0f1218]/80 backdrop-blur-md border-r border-white/5 p-6 overflow-y-auto custom-scrollbar shadow-2xl z-10 lg:h-[calc(100vh-64px)] lg:sticky lg:top-16 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.push("/plan")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                <ChevronLeft size={18} />
              </div>
              <span className="font-medium">กลับหน้าหลัก</span>
            </button>
            <button
              onClick={handleDeletePlan}
              disabled={isDeleting}
              className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
            >
              {isDeleting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          </div>

          <div className="mb-8">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider mb-3 border ${
                plan.planType === "ib"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              {plan.planType === "ib" ? (
                <TrendingUp size={12} />
              ) : (
                <TargetIcon size={12} />
              )}
              {plan.planType === "ib" ? "Income Strategy" : "Goal Strategy"}
            </div>

            <div
              className="flex items-start gap-2 group cursor-pointer"
              onClick={openRenameModal}
            >
              <h1 className="text-3xl font-black text-white leading-tight break-words flex-1 hover:text-indigo-300 transition-colors">
                {plan.name}
              </h1>
              <div className="mt-1 text-gray-500 group-hover:text-indigo-400 transition-colors">
                <Edit2 size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-8 pb-4 flex-1">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-400 uppercase tracking-widest">
                <Calendar size={16} /> ช่วงเวลา (Timeline)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="อายุปัจจุบัน"
                  type="number"
                  value={plan.currentAge === 0 ? "" : plan.currentAge}
                  onChange={(e) =>
                    handleLocalUpdate("currentAge", e.target.value)
                  }
                  fullWidth
                />
                <TextField
                  label={
                    plan.planType === "ib" ? "เกษียณอายุ" : "อายุเมื่อถึงเป้า"
                  }
                  type="number"
                  value={plan.retirementAge === 0 ? "" : plan.retirementAge}
                  onChange={(e) =>
                    handleLocalUpdate("retirementAge", e.target.value)
                  }
                  fullWidth
                />
              </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-400 uppercase tracking-widest">
                <DollarSign size={16} /> เป้าหมายการเงิน
              </h3>
              <div className="space-y-4">
                <TextField
                  label={
                    plan.planType === "ib"
                      ? "รายจ่ายที่ต้องการ/เดือน"
                      : "เงินก้อนเป้าหมาย"
                  }
                  type="number"
                  value={
                    plan.planType === "ib"
                      ? plan.monthlyExpenses === 0
                        ? ""
                        : plan.monthlyExpenses
                      : plan.targetLumpSum === 0
                      ? ""
                      : plan.targetLumpSum
                  }
                  onChange={(e) =>
                    handleLocalUpdate(
                      plan.planType === "ib"
                        ? "monthlyExpenses"
                        : "targetLumpSum",
                      e.target.value
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="text-gray-400">฿</span>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
                <TextField
                  label="เงินออมปัจจุบัน"
                  type="number"
                  value={plan.currentSavings === 0 ? "" : plan.currentSavings}
                  onChange={(e) =>
                    handleLocalUpdate("currentSavings", e.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="text-gray-400">฿</span>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
                {plan.planType === "ib" && (
                  <TextField
                    label="ใช้เงินหลังเกษียณ (ปี)"
                    type="number"
                    value={
                      plan.retirementYears === 0 ? "" : plan.retirementYears
                    }
                    onChange={(e) =>
                      handleLocalUpdate("retirementYears", e.target.value)
                    }
                    helperText={`แผนสิ้นสุดอายุ ${
                      Number(plan.retirementAge) + Number(plan.retirementYears)
                    } ปี`}
                    fullWidth
                  />
                )}
              </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-400 uppercase tracking-widest">
                <Settings size={16} /> ตัวแปรสมมติฐาน
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="ผลตอบแทน (%)"
                  type="number"
                  value={plan.expectedReturn === 0 ? "" : plan.expectedReturn}
                  onChange={(e) =>
                    handleLocalUpdate("expectedReturn", e.target.value)
                  }
                  fullWidth
                />
                <TextField
                  label="เงินเฟ้อ (%)"
                  type="number"
                  value={plan.inflationRate === 0 ? "" : plan.inflationRate}
                  onChange={(e) =>
                    handleLocalUpdate("inflationRate", e.target.value)
                  }
                  fullWidth
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 sticky bottom-0 bg-[#0f1218] pb-2 z-20">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </aside>

        {/* RIGHT: Visual Workspace */}
        <main className="flex-1 p-4 lg:p-10 lg:ml-0 overflow-y-auto custom-scrollbar h-auto lg:h-[calc(100vh-64px)]">
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 bg-gradient-to-r from-indigo-900/40 to-indigo-800/40 backdrop-blur-xl p-8 rounded-[32px] border border-indigo-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={120} />
                </div>
                <div className="relative z-10">
                  <div className="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <PieChart size={16} /> สิ่งที่คุณต้องทำ
                  </div>
                  <div className="text-gray-400 text-sm mb-1">
                    ต้องออมเพิ่มต่อเดือน (Monthly Savings)
                  </div>
                  <div className="text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4">
                    ฿
                    {new Intl.NumberFormat().format(
                      Math.round(results?.monthly || 0)
                    )}
                  </div>
                  <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-200">
                    <TrendingUp size={14} /> คำนวณที่ผลตอบแทน{" "}
                    {plan.expectedReturn}% ต่อปี
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 shadow-lg flex flex-col justify-center">
                <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
                  เวลาที่เหลือ (Time Horizon)
                </div>
                <div className="text-5xl font-black text-white tracking-tight">
                  {results?.yearsToRetirement}{" "}
                  <span className="text-xl font-bold text-gray-500">ปี</span>
                </div>
                <div className="mt-4 w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (plan.currentAge / plan.retirementAge) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-right">
                  อายุ {plan.currentAge} / {plan.retirementAge}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="md:col-span-1 bg-gray-800/40 backdrop-blur-xl p-6 rounded-[24px] border border-white/5">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">
                  เป้าหมายสูงสุด (FV)
                </div>
                <div className="text-xl font-bold text-white">
                  ฿
                  {new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Math.round(results?.target || 0))}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  มูลค่า ณ วันที่เกษียณ
                </div>
              </div>
              <div className="md:col-span-1 bg-gray-800/40 backdrop-blur-xl p-6 rounded-[24px] border border-white/5">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">
                  เงินต้นโตไปเป็น
                </div>
                <div className="text-xl font-bold text-emerald-400">
                  ฿
                  {new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Math.round(results?.fvCurrent || 0))}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  ถ้าไม่ออมเพิ่มเลย
                </div>
              </div>
              <div className="md:col-span-1 bg-gray-800/40 backdrop-blur-xl p-6 rounded-[24px] border border-white/5">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">
                  ส่วนต่างที่ขาด (Gap)
                </div>
                <div className="text-xl font-bold text-rose-400">
                  ฿
                  {new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Math.round(results?.needed || 0))}
                </div>
                <div className="text-xs text-gray-600 mt-1">ต้องหามาเติม</div>
              </div>
              {plan.planType === "ib" && (
                <div className="md:col-span-1 bg-gray-800/40 backdrop-blur-xl p-6 rounded-[24px] border border-white/5">
                  <div className="text-gray-500 text-xs font-bold uppercase mb-1">
                    ค่าใช้จ่ายอนาคต/เดือน
                  </div>
                  <div className="text-xl font-bold text-blue-400">
                    ฿
                    {new Intl.NumberFormat().format(
                      Math.round(results?.futureExpenses || 0)
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    ปรับเงินเฟ้อ {plan.inflationRate}%
                  </div>
                </div>
              )}
            </div>

            {/* Line Chart Area */}
            <div className="bg-gray-800/30 backdrop-blur-sm p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    เส้นทางความมั่งคั่ง (Wealth Path)
                  </h3>
                  <p className="text-sm text-gray-500">
                    เปรียบเทียบ "เงินต้นที่จ่ายจริง" กับ "มูลค่าพอร์ตที่เติบโต"
                    จนถึงวันสิ้นสุดแผน
                  </p>
                </div>
              </div>
              <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="age"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      dy={10}
                      label={{
                        value: "อายุ (ปี)",
                        position: "insideBottom",
                        offset: -5,
                        fill: "#4b5563",
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff", paddingTop: "4px" }}
                      formatter={(value: number) => [
                        `฿${new Intl.NumberFormat().format(value)}`,
                        "",
                      ]}
                      labelFormatter={(label) => `อายุ ${label} ปี`}
                    />
                    <Legend
                      iconType="circle"
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: "20px" }}
                    />

                    <ReferenceLine
                      x={plan.retirementAge}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      label={{
                        position: "top",
                        value: "เกษียณ",
                        fill: "#ef4444",
                        fontSize: 12,
                      }}
                    />

                    {/* Line 1: Principal */}
                    <Line
                      type="monotone"
                      dataKey="เงินต้น"
                      stroke="#9ca3af" // Grey
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 6 }}
                    />

                    {/* Line 2: Portfolio Value */}
                    <Line
                      type="monotone"
                      dataKey="มูลค่าพอร์ต"
                      stroke={accentColor}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog
        open={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="text-white font-bold text-3xl pt-8 px-8 pb-2">
          แก้ไขชื่อแผน
        </DialogTitle>
        <DialogContent className="px-8">
          <div className="py-6">
            <TextField
              autoFocus
              label="ชื่อแผนใหม่"
              type="text"
              fullWidth
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              variant="outlined"
              InputProps={{ style: { fontSize: "1.2rem" } }}
            />
          </div>
        </DialogContent>
        <DialogActions className="px-8 pb-8 pt-2 gap-2">
          <Button
            onClick={() => setIsRenameOpen(false)}
            className="text-gray-400 hover:text-white px-6 py-3 rounded-xl text-lg"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleRenameSave}
            variant="contained"
            color="primary"
            className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-8 py-3 text-lg font-bold shadow-lg shadow-indigo-600/20"
          >
            บันทึกชื่อใหม่
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
