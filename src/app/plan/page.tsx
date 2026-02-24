"use client";
import { useState, useEffect } from "react";
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
  Calendar,
  DollarSign,
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
    background: { paper: "#1f2937" },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
          },
        },
        root: { marginBottom: "16px" },
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

  // Initial State for New Plan
  const [newPlan, setNewPlan] = useState({
    name: "",
    planType: "",
    currentAge: 25,
    targetAge: 60,
    money: 0, // Expense (IB) or Lump Sum (GB)
    currentSavings: 0,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const cookies = parseCookies();
      const account = JSON.parse(cookies.account || "{}");
      const res = await axios.get(
        `http://localhost:3001/plans/account/${account.id}`,
        {
          headers: { Authorization: `Bearer ${cookies.accessToken}` },
        }
      );
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeCreation = async () => {
    if (!newPlan.name.trim() || newPlan.money <= 0) return;
    setIsCreating(true);
    try {
      const cookies = parseCookies();
      const account = JSON.parse(cookies.account || "{}");

      const payload = {
        accountId: account.id,
        name: newPlan.name,
        planType: newPlan.planType,
        currentAge: Number(newPlan.currentAge),
        retirementAge: Number(newPlan.targetAge), // Map targetAge to retirementAge field
        money: Number(newPlan.money),
        currentSavings: Number(newPlan.currentSavings),
        expectedReturn: 7, // Default assumption
        inflationRate: 3, // Default assumption
        retirementYears: 25, // Default assumption
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
    setStep(1);
    setNewPlan({
      name: "",
      planType: "",
      currentAge: 25,
      targetAge: 60,
      money: 0,
      currentSavings: 0,
    });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 pt-24 pb-12 px-4 font-sans">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-in slide-in-from-top-4 duration-500">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-indigo-400" size={20} />
                <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">
                  Financial Workspace
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                พื้นที่วางแผนการเงิน
              </h1>
              <p className="text-gray-400 font-medium text-lg">
                เริ่มต้นออกแบบอนาคตที่มั่นคง ด้วยเครื่องมือคำนวณอัจฉริยะ
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 border border-indigo-400/30 group"
            >
              <Plus
                size={24}
                strokeWidth={3}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
              สร้างแผนใหม่
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 rounded-[32px] bg-white/5 backdrop-blur-sm border border-white/5">
              <CircularProgress
                sx={{ color: "#818cf8" }}
                size={50}
                className="mb-6"
              />
              <p className="text-indigo-300 animate-pulse font-medium">
                กำลังเชื่อมต่อข้อมูล...
              </p>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 rounded-[32px] bg-white/5 backdrop-blur-sm border border-dashed border-white/20 text-center px-4">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Target className="text-gray-500" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                ยังไม่มีแผนการเงิน
              </h3>
              <p className="text-gray-400 mb-8 max-w-md">
                กดปุ่มสร้างแผนใหม่ เพื่อเริ่มคำนวณเป้าหมายของคุณ
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors flex items-center gap-2"
              >
                เริ่มสร้างเลย <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan: any) => (
                <div
                  key={plan.id}
                  onClick={() => router.push(`/plan/${plan.id}`)}
                  className="group relative bg-gray-800/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 hover:border-indigo-500/50 hover:bg-gray-800/60 transition-all duration-300 cursor-pointer shadow-xl shadow-black/20 hover:shadow-indigo-500/10 hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${plan.planType === "ib"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                    >
                      {plan.planType === "ib" ? (
                        <Wallet size={28} />
                      ) : (
                        <Target size={28} />
                      )}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${plan.planType === "ib"
                          ? "bg-blue-500/5 border-blue-500/20 text-blue-300"
                          : "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                        }`}
                    >
                      {plan.planType === "ib" ? "Income Based" : "Goal Based"}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mb-8">
                    {plan.planType === "ib"
                      ? "วางแผนเกษียณจากรายจ่ายต่อเดือน"
                      : "วางแผนเก็บเงินก้อนเพื่อเป้าหมาย"}
                  </p>

                  <div className="flex justify-between items-center pt-5 border-t border-white/5">
                    <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                      ดูรายละเอียด
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Improved Creation Modal */}
        <Dialog
          open={isModalOpen}
          onClose={closeModal}
          PaperProps={{
            className:
              "bg-[#111827] border border-white/10 rounded-[32px] text-white w-full max-w-2xl overflow-hidden shadow-2xl shadow-black/50",
            style: { backgroundColor: "#111827", backgroundImage: "none" },
          }}
          slotProps={{
            backdrop: { className: "backdrop-blur-sm bg-black/60" },
          }}
        >
          <DialogContent className="p-0">
            <div className="relative">
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 text-gray-500 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8 md:p-10">
                {step === 1 ? (
                  // Step 1: Select Type
                  <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h2 className="text-3xl font-black mb-3 text-white">
                      เลือกรูปแบบการคำนวณ
                    </h2>
                    <p className="text-gray-400 mb-8 font-medium">
                      คุณต้องการวางแผนการเงินในลักษณะไหน?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          id: "ib",
                          label: "Income-Based",
                          subLabel: "เน้นรายจ่ายหลังเกษียณ",
                          desc: "คำนวณจากไลฟ์สไตล์รายเดือนที่ต้องการใช้จริง",
                          icon: Wallet,
                          color: "blue",
                        },
                        {
                          id: "gb",
                          label: "Goal-Based",
                          subLabel: "เน้นเงินก้อนเป้าหมาย",
                          desc: "คำนวณเพื่อเก็บเงินซื้อบ้าน, รถ หรือแต่งงาน",
                          icon: Target,
                          color: "emerald",
                        },
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => {
                            setNewPlan({ ...newPlan, planType: btn.id });
                            setStep(2);
                          }}
                          className={`flex flex-col items-center gap-4 p-6 border border-white/10 rounded-[28px] bg-white/5 hover:bg-${btn.color}-500/10 hover:border-${btn.color}-500/50 transition-all group`}
                        >
                          <div
                            className={`bg-${btn.color}-500/20 text-${btn.color}-400 p-4 rounded-2xl group-hover:scale-110 transition-transform`}
                          >
                            <btn.icon size={32} />
                          </div>
                          <div className="text-center">
                            <h4 className="font-bold text-xl text-white">
                              {btn.label}
                            </h4>
                            <p
                              className={`text-xs font-bold uppercase tracking-wider text-${btn.color}-400 mb-2`}
                            >
                              {btn.subLabel}
                            </p>
                            <p className="text-sm text-gray-400">{btn.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Step 2: Input Details
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        onClick={() => setStep(1)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity ${newPlan.planType === "ib"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-emerald-500/20 text-emerald-400"
                          }`}
                      >
                        {newPlan.planType === "ib" ? (
                          <Wallet size={24} />
                        ) : (
                          <Target size={24} />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">
                          กรอกข้อมูลแผน
                        </h2>
                        <p className="text-sm text-gray-400">
                          {newPlan.planType === "ib"
                            ? "Income-Based Plan"
                            : "Goal-Based Plan"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-800/50 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                          <Sparkles size={14} /> ข้อมูลทั่วไป
                        </h3>
                        <TextField
                          label="ชื่อแผนการเงิน"
                          placeholder={
                            newPlan.planType === "ib"
                              ? "เช่น แผนเกษียณอายุ 60"
                              : "เช่น เก็บเงินแต่งงาน"
                          }
                          value={newPlan.name}
                          onChange={(e) =>
                            setNewPlan({ ...newPlan, name: e.target.value })
                          }
                          fullWidth
                          variant="outlined"
                          autoFocus
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <TextField
                            label="อายุปัจจุบัน"
                            type="number"
                            value={newPlan.currentAge}
                            onChange={(e) =>
                              setNewPlan({
                                ...newPlan,
                                currentAge: Number(e.target.value),
                              })
                            }
                            fullWidth
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <span className="text-gray-500 text-xs">
                                    ปี
                                  </span>
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            label={
                              newPlan.planType === "ib"
                                ? "อายุเกษียณ"
                                : "อายุเมื่อถึงเป้า"
                            }
                            type="number"
                            value={newPlan.targetAge}
                            onChange={(e) =>
                              setNewPlan({
                                ...newPlan,
                                targetAge: Number(e.target.value),
                              })
                            }
                            fullWidth
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <span className="text-gray-500 text-xs">
                                    ปี
                                  </span>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-gray-800/50 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                          <DollarSign size={14} /> ตัวเลขทางการเงิน
                        </h3>
                        <TextField
                          label={
                            newPlan.planType === "ib"
                              ? "รายจ่ายต่อเดือนหลังเกษียณ (ที่ต้องการ)"
                              : "จำนวนเงินก้อนเป้าหมาย"
                          }
                          type="number"
                          value={newPlan.money === 0 ? "" : newPlan.money}
                          onChange={(e) =>
                            setNewPlan({
                              ...newPlan,
                              money: Number(e.target.value),
                            })
                          }
                          fullWidth
                          placeholder="0"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span className="text-indigo-400 font-bold">
                                  ฿
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          label="เงินออมที่มีปัจจุบัน (เงินต้น)"
                          type="number"
                          value={
                            newPlan.currentSavings === 0
                              ? ""
                              : newPlan.currentSavings
                          }
                          onChange={(e) =>
                            setNewPlan({
                              ...newPlan,
                              currentSavings: Number(e.target.value),
                            })
                          }
                          fullWidth
                          placeholder="0"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span className="text-emerald-400 font-bold">
                                  ฿
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                      >
                        ย้อนกลับ
                      </button>
                      <button
                        disabled={!newPlan.name || !newPlan.money || isCreating}
                        onClick={handleFinalizeCreation}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />{" "}
                            กำลังสร้าง...
                          </>
                        ) : (
                          "ยืนยันและสร้างแผน"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}
