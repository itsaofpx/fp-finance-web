"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import axios from "axios";
import {
  Plus,
  Target,
  Wallet,
  ArrowRight,
  X,
  Loader2,
  Sparkles,
  DollarSign,
  ChevronLeft,
  PiggyBank,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#818cf8" },
    background: {
      paper: "#111827",
      default: "#0f172a",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "16px",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            transition: "all 0.2s ease-in-out",
            "& fieldset": { borderColor: "rgba(255, 255, 255, 0.05)" },
            "&:hover fieldset": { borderColor: "rgba(129, 140, 248, 0.3)" },
            "&.Mui-focused fieldset": { borderColor: "#818cf8", borderWidth: "1.5px" },
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.85rem",
            color: "rgba(148, 163, 184, 0.7)",
          },
        },
      },
    },
  },
});

export default function PlanDashboard() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const [newPlan, setNewPlan] = useState({
    name: "",
    planType: "",
    currentAge: 25,
    targetAge: 60,
    money: "",
    currentSavings: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const cookies = parseCookies();
      const account = JSON.parse(cookies.account || "{}");
      if (!account.id) return;
      const res = await axios.get(`http://localhost:3001/plans/account/${account.id}`, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeCreation = async () => {
    if (!newPlan.name.trim() || !newPlan.money) return;
    setIsCreating(true);
    try {
      const cookies = parseCookies();
      const account = JSON.parse(cookies.account || "{}");
      const payload = {
        accountId: account.id,
        name: newPlan.name,
        planType: newPlan.planType,
        currentAge: Number(newPlan.currentAge),
        retirementAge: Number(newPlan.targetAge),
        money: Number(newPlan.money),
        currentSavings: Number(newPlan.currentSavings),
        expectedReturn: 7,
        inflationRate: 3,
        retirementYears: 25,
      };
      const res = await axios.post("http://localhost:3001/plans", payload, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });
      router.push(`/plan/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setNewPlan({ name: "", planType: "", currentAge: 25, targetAge: 60, money: "", currentSavings: "" });
    }, 300);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-slate-200 pt-24 pb-12 px-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] -z-10" />

        <div className="max-w-6xl mx-auto relative z-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-[0.2em]">
                <Sparkles size={16} /> Wealth Strategy
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">คลังแผนการเงิน</h1>
              <p className="text-slate-400 font-medium">จัดการและติดตามเป้าหมายทางการเงินของคุณในที่เดียว</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-white text-black hover:bg-slate-100 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              <Plus size={20} strokeWidth={3} /> สร้างแผนใหม่
            </button>
          </header>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-900/40 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-md">
              <CircularProgress size={32} thickness={5} />
            </div>
          ) : plans.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10 text-center backdrop-blur-sm">
              <div className="p-4 bg-slate-800/50 rounded-full mb-4 text-slate-500"><Target size={32} /></div>
              <p className="text-slate-400 font-medium mb-6">ยังไม่มีแผนการเงิน เริ่มสร้างแผนแรกได้เลย!</p>
              <button onClick={() => setIsModalOpen(true)} className="text-indigo-400 font-bold flex items-center gap-2 hover:gap-3 transition-all">สร้างแผน <ArrowRight size={18} /></button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan: any) => (
                <div
                  key={plan.id}
                  onClick={() => router.push(`/plan/${plan.id}`)}
                  className="group p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-all group-hover:opacity-20 ${plan.planType === 'ib' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={`p-3 rounded-2xl ${plan.planType === 'ib' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {plan.planType === 'ib' ? <Wallet size={24} /> : <Target size={24} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-white/5 px-3 py-1 rounded-lg">
                      {plan.planType === 'ib' ? 'Income' : 'Goal'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{plan.name}</h3>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300">Strategy Details</span>
                    <ArrowRight size={16} className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog
          open={isModalOpen}
          onClose={closeModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            className: "bg-[#111827] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl",
            style: { backgroundImage: "none", backgroundColor: "#111827" }
          }}
          slotProps={{ backdrop: { style: { backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' } } }}
        >
          <div className="relative p-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
              <div className={`h-full bg-indigo-500 transition-all duration-700 ease-out ${step === 1 ? 'w-1/2' : 'w-full'}`} />
            </div>

            <button onClick={closeModal} className="absolute top-8 right-8 text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all"><X size={20} /></button>

            {step === 1 ? (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="mb-10">
                  <h2 className="text-2xl font-black text-white mb-2">เลือกประเภทของแผน</h2>
                  <p className="text-slate-400 font-medium">รูปแบบการคำนวณที่เหมาะกับเป้าหมายของคุณ</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'ib', title: 'Income-Based', desc: 'เน้นค่าใช้จ่ายรายเดือนหลังเกษียณ', icon: Wallet, color: 'blue' },
                    { id: 'gb', title: 'Goal-Based', desc: 'เน้นเงินก้อนใหญ่ตามเป้าที่ตั้งไว้', icon: Target, color: 'emerald' }
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { setNewPlan({ ...newPlan, planType: item.id }); setStep(2); }}
                      className="group flex items-center gap-6 p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] cursor-pointer transition-all"
                    >
                      <div className={`p-4 rounded-2xl bg-slate-800 text-slate-400 group-hover:scale-110 transition-all`}>
                        <item.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-lg">{item.title}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">{item.desc}</p>
                      </div>
                      <ArrowRight size={20} className="text-slate-700 group-hover:text-white translate-x-0 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold mb-8 transition-colors">
                  <ChevronLeft size={14} /> ย้อนกลับ
                </button>

                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-black text-white mb-2">ระบุรายละเอียด</h2>
                  <p className="text-slate-400 font-medium">ข้อมูลเพื่อสร้างกลยุทธ์เฉพาะคุณ</p>
                </div>

                <div className="space-y-6">
                  <TextField
                    label="ชื่อแผนการเงิน"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    fullWidth
                    autoFocus
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      label="อายุปัจจุบัน"
                      type="number"
                      value={newPlan.currentAge}
                      onChange={(e) => setNewPlan({ ...newPlan, currentAge: Number(e.target.value) })}
                      InputProps={{ endAdornment: <InputAdornment position="end"><span className="text-[10px] font-bold text-slate-600">ปี</span></InputAdornment> }}
                    />
                    <TextField
                      label={newPlan.planType === 'ib' ? "อายุเกษียณ" : "เป้าหมายที่อายุ"}
                      type="number"
                      value={newPlan.targetAge}
                      onChange={(e) => setNewPlan({ ...newPlan, targetAge: Number(e.target.value) })}
                      InputProps={{ endAdornment: <InputAdornment position="end"><span className="text-[10px] font-bold text-slate-600">ปี</span></InputAdornment> }}
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <TextField
                      label={newPlan.planType === 'ib' ? "รายจ่ายรายเดือนที่ต้องการ" : "เงินก้อนเป้าหมาย"}
                      type="number"
                      value={newPlan.money}
                      onChange={(e) => setNewPlan({ ...newPlan, money: e.target.value })}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><DollarSign size={16} className="text-indigo-400" /></InputAdornment>,
                        endAdornment: <InputAdornment position="end"><span className="text-[10px] font-bold text-slate-600">บาท</span></InputAdornment>
                      }}
                    />
                  </div>

                  <TextField
                    label="เงินเก็บปัจจุบัน"
                    type="number"
                    value={newPlan.currentSavings}
                    onChange={(e) => setNewPlan({ ...newPlan, currentSavings: e.target.value })}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PiggyBank size={16} className="text-emerald-400" /></InputAdornment>,
                      endAdornment: <InputAdornment position="end"><span className="text-[10px] font-bold text-slate-600">บาท</span></InputAdornment>
                    }}
                  />
                </div>

                <button
                  disabled={!newPlan.name || !newPlan.money || isCreating}
                  onClick={handleFinalizeCreation}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-[20px] font-bold mt-10 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="animate-spin" size={20} /> : "ยืนยันและสร้างแผน"}
                </button>
              </div>
            )}
          </div>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}