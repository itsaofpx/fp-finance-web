"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";
import axios from "axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RetirementPlan {
  id: string;
  name: string;
  currentAge: number;
  retirementAge: number;
  /**
   * NOTE: keeping the original field name for backend compatibility.
   * In this lump-sum version, this value represents the target lump sum at retirement (฿), not monthly expenses.
   */
  targetLumpSum: number; // -> targetLumpSum
  currentSavings: number;
  expectedReturn: number;
  inflationRate: number; // kept for display/info
  retirementYears: number; // unused in lump-sum calc, kept for compatibility
  createdAt: string;
}

export default function GoalPlanPage() {
  const router = useRouter();
  const [currentAge, setCurrentAge] = useState<number>(25);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  // interpret as target lump sum at retirement
  const [targetLumpSum, setTargetLumpSum] = useState<number>(0);
  const [currentSavings, setCurrentSavings] = useState<number>(0);
  const [expectedReturn, setExpectedReturn] = useState<number>(7);
  const [inflationRate, setInflationRate] = useState<number>(3);
  const [retirementYears, setRetirementYears] = useState<number>(25);
  const [planName, setPlanName] = useState<string>("");
  const [savedPlans, setSavedPlans] = useState<RetirementPlan[]>([]);
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchPlansFromDatabase = async (accountId: string, token: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3001/plans/account/${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      let savedPlans = [];
      for (let plan of response.data) {
        if (plan.planType === "gb") {
          plan.targetLumpSum = plan.money;
          savedPlans.push(plan);
        }
      }
      setSavedPlans(savedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberInput = (value: string, setter: (val: number) => void) => {
    if (value === "") {
      setter(0);
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        setter(numValue);
      }
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const cookies = parseCookies();
        const accessToken = cookies.accessToken;
        const accountCookie = cookies.account;

        if (!accessToken) {
          throw new Error("Authentication token is missing");
        }

        let accountData: { id?: string } = {};
        try {
          accountData = accountCookie ? JSON.parse(accountCookie) : {};
        } catch (parseError) {
          console.error("Failed to parse account cookie", parseError);
          throw new Error("Invalid account information");
        }

        const id = accountData.id;
        if (!id) {
          throw new Error("Google ID is missing");
        }
        setId(id);
        await fetchPlansFromDatabase(id, accessToken);
      } catch (error) {
        router.push("/");
      }
    };

    fetchUserProfile();
  }, []);

  const savePlan = async () => {
    if (!planName.trim()) {
      setSnackbar({
        open: true,
        message: "กรุณาใส่ชื่อแผน",
        severity: "error",
      });
      return;
    }

    if (!id) {
      setSnackbar({
        open: true,
        message: "ไม่สามารถระบุตัวตนผู้ใช้ได้",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const cookies = parseCookies();
      const accessToken = cookies.accessToken;

      if (!accessToken) {
        setSnackbar({
          open: true,
          message: "กรุณาเข้าสู่ระบบใหม่",
          severity: "error",
        });
        return;
      }

      const planData = {
        accountId: id,
        name: planName,
        currentAge,
        retirementAge,
        // store under original key for compatibility
        money: targetLumpSum,
        currentSavings,
        expectedReturn,
        inflationRate,
        retirementYears,
        planType: "gb",
      };

      // ตรวจสอบว่าเป็นการอัปเดตหรือสร้างใหม่
      if (currentPlan) {
        // อัปเดตแผนที่มีอยู่
        const response = await axios.patch(
          `http://localhost:3001/plans/${currentPlan}`,
          planData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const updatedPlan = response.data;
        updatedPlan.targetLumpSum = updatedPlan.money;

        // อัปเดตรายการแผนที่บันทึก
        setSavedPlans((prevPlans) =>
          prevPlans.map((plan) =>
            plan.id === currentPlan ? updatedPlan : plan
          )
        );

        setSnackbar({
          open: true,
          message: "อัปเดตแผนสำเร็จ!",
          severity: "success",
        });
      } else {
        // สร้างแผนใหม่
        const response = await axios.post(
          "http://localhost:3001/plans",
          planData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const savedPlan = response.data;
        savedPlan.targetLumpSum = savedPlan.money;
        setSavedPlans((prevPlans) => [...prevPlans, savedPlan]);

        setSnackbar({
          open: true,
          message: "บันทึกแผนสำเร็จ!",
          severity: "success",
        });
      }

      // ล้างชื่อแผนและ currentPlan หลังบันทึกสำเร็จ
      setPlanName("");
      setCurrentPlan("");
    } catch (error) {
      console.error("Error saving plan:", error);
      setSnackbar({
        open: true,
        message: currentPlan
          ? "เกิดข้อผิดพลาดในการอัปเดตแผน"
          : "เกิดข้อผิดพลาดในการบันทึกแผน",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPlan = (plan: RetirementPlan) => {
    setCurrentAge(plan.currentAge);
    setRetirementAge(plan.retirementAge);
    setTargetLumpSum(plan.targetLumpSum); // reinterpret
    setCurrentSavings(plan.currentSavings);
    setExpectedReturn(plan.expectedReturn);
    setInflationRate(plan.inflationRate);
    setRetirementYears(plan.retirementYears);
    setPlanName(plan.name);
    setCurrentPlan(plan.id);
  };

  const deletePlan = (planId: string) => {
    setConfirmDialog({
      open: true,
      title: "ยืนยันการลบแผน",
      message: "คุณต้องการลบแผนนี้หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้",
      onConfirm: () => handleDeleteConfirm(planId),
    });
  };

  const handleDeleteConfirm = async (planId: string) => {
    setConfirmDialog({ ...confirmDialog, open: false });

    try {
      setLoading(true);
      const cookies = parseCookies();
      const accessToken = cookies.accessToken;

      if (!accessToken) {
        setSnackbar({
          open: true,
          message: "กรุณาเข้าสู่ระบบใหม่",
          severity: "error",
        });
        return;
      }

      await axios.delete(`http://localhost:3001/plans/${planId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      setSavedPlans((prevPlans) =>
        prevPlans.filter((plan) => plan.id !== planId)
      );
      setSnackbar({
        open: true,
        message: "ลบแผนสำเร็จ!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      setSnackbar({
        open: true,
        message: "เกิดข้อผิดพลาดในการลบแผน",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const createNewPlan = () => {
    setCurrentAge(25);
    setRetirementAge(60);
    setTargetLumpSum(0);
    setCurrentSavings(0);
    setExpectedReturn(7);
    setInflationRate(3);
    setRetirementYears(25);
    setPlanName("");
    setCurrentPlan("");
  };

  // ===== Calculations (Lump Sum Goal) =====
  const calculateRetirement = () => {
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    const annualReturn = expectedReturn / 100;
    const monthlyRate = annualReturn / 12;

    // Future value of current savings at retirement
    const futureValueOfCurrentSavings =
      currentSavings * Math.pow(1 + annualReturn, yearsToRetirement);

    // Additional amount needed to reach the target lump sum
    const additionalNeeded = Math.max(
      0,
      targetLumpSum - futureValueOfCurrentSavings
    );

    // Required monthly contribution to reach the additionalNeeded over n years
    const n = yearsToRetirement * 12;
    let monthlyPayment = 0;
    if (n > 0) {
      if (monthlyRate > 0) {
        monthlyPayment =
          (additionalNeeded * monthlyRate) / (Math.pow(1 + monthlyRate, n) - 1);
      } else {
        monthlyPayment = additionalNeeded / n;
      }
    }

    // Informational: real return after inflation (not used in lump-sum computation)
    const realReturn = (expectedReturn - inflationRate) / 100;

    return {
      yearsToRetirement,
      targetLumpSum: Math.round(targetLumpSum),
      futureValueOfCurrentSavings: Math.round(futureValueOfCurrentSavings),
      additionalSavingsNeeded: Math.round(additionalNeeded),
      monthlyPayment: Math.round(Math.max(0, monthlyPayment)),
      realReturnRate: realReturn,
    };
  };

  const results = calculateRetirement();

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("th-TH").format(num);

  const generateSavingsGrowthData = () => {
    const data: any[] = [];
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    const annualReturn = expectedReturn / 100;
    const monthlyRate = annualReturn / 12;

    for (let year = 0; year <= yearsToRetirement; year++) {
      const currentValue = currentSavings * Math.pow(1 + annualReturn, year);
      const months = year * 12;
      const pmt = results.monthlyPayment;
      const futureContrib =
        monthlyRate > 0
          ? pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
          : pmt * months;

      const total = currentValue + futureContrib;
      data.push({
        year: currentAge + year,
        totalSavings: Math.round(total),
        currentSavingsGrowth: Math.round(currentValue),
        newSavingsGrowth: Math.round(futureContrib),
      });
    }
    return data;
  };

  const generatePieChartData = () => [
    {
      name: "เงินออมปัจจุบัน (มูลค่าเมื่อเกษียณ)",
      value: results.futureValueOfCurrentSavings,
      color: "#6B7FD7",
    },
    {
      name: "เงินออมเพิ่มเติมที่ต้องมี",
      value: results.additionalSavingsNeeded,
      color: "#7BC8A4",
    },
  ];

  const generateComparisonData = () => [
    {
      category: "เงินออมปัจจุบัน (FV)",
      amount: results.futureValueOfCurrentSavings,
      color: "#6B7FD7",
    },
    {
      category: "ต้องออมเพิ่ม",
      amount: results.additionalSavingsNeeded,
      color: "#E8A87C",
    },
    {
      category: "เป้าหมายเงินก้อน",
      amount: results.targetLumpSum,
      color: "#7BC8A4",
    },
  ];

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <div className="min-h-screen bg-gradient-to-br mt-16 from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        {/* Page Title with New Plan Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => router.push("/plan")}
                className="p-2 text-white rounded-lg transition-colors"
                aria-label="กลับไปหน้าแผน"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                แผนการออมเงิน
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              วางแผนอนาคตที่มั่นคงด้วยเครื่องคำนวณแบบมืออาชีพ
            </p>
          </div>
          <button
            onClick={createNewPlan}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
          >
            <span>✨</span> สร้างแผนใหม่
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Sidebar - Saved Plans */}
          <div className="xl:col-span-3 order-2 xl:order-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50 sticky top-6 overflow-hidden">
              <div className="bg-slate-700 dark:bg-slate-800 p-4">
                <h2 className="text-lg font-semibold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    📋 แผนที่บันทึก
                  </span>
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                    {savedPlans.length}
                  </span>
                </h2>
              </div>

              <div className="p-4">
                {savedPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">📂</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      ยังไม่มีแผนที่บันทึกไว้
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      เริ่มสร้างแผนแรกของคุณ
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                    {savedPlans.map((plan, index) => (
                      <div
                        key={plan.id}
                        className="group bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3.5 hover:shadow-md transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:border-slate-400 dark:hover:border-slate-500"
                      >
                        <div className="flex justify-between items-start mb-2.5">
                          <div className="flex items-start gap-2 flex-1">
                            <span className="text-base mt-0.5">💼</span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                                {plan.name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                แผนที่ {index + 1}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => deletePlan(plan.id)}
                            disabled={loading}
                            className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="ลบแผน"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              👤 อายุ:
                            </span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {plan.currentAge} → {plan.retirementAge} ปี
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              🎯 เงินก้อนเป้าหมาย:
                            </span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              ฿{formatNumber(plan.targetLumpSum)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              📅 สร้างเมื่อ:
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {new Date(plan.createdAt).toLocaleDateString(
                                "th-TH",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => loadPlan(plan)}
                          className="w-full px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          โหลดแผน
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-9 order-1 xl:order-2 space-y-6">
            {/* Input & Results Cards */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <div className="bg-slate-700 dark:bg-slate-800 p-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📊</span> ข้อมูลการคำนวณ
                  </h2>
                </div>

                <div className="p-5 space-y-4">
                  {/* Plan Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <span>✏️</span> ชื่อแผน
                    </label>
                    <input
                      type="text"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="เช่น แผนเกษียณอายุ 60"
                      className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>

                  {/* Age Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        👤 อายุปัจจุบัน
                      </label>
                      <input
                        type="number"
                        value={currentAge === 0 ? "" : currentAge}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setCurrentAge)
                        }
                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-700 dark:text-white transition-all"
                        min="18"
                        max="65"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        🎯 อายุเป้าหมาย
                      </label>
                      <input
                        type="number"
                        value={retirementAge === 0 ? "" : retirementAge}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setRetirementAge)
                        }
                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-700 dark:text-white transition-all"
                        min={currentAge + 1}
                        max="80"
                      />
                    </div>
                  </div>

                  {/* Financial Inputs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      💵 เงินก้อนเป้าหมาย (บาท)
                    </label>
                    <input
                      type="number"
                      placeholder="เช่น 5000000"
                      value={targetLumpSum === 0 ? "" : targetLumpSum}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, setTargetLumpSum)
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-700 dark:text-white transition-all"
                      min="10000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      💰 เงินออมปัจจุบัน
                    </label>
                    <input
                      type="number"
                      placeholder="เช่น 150000"
                      value={currentSavings === 0 ? "" : currentSavings}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, setCurrentSavings)
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-700 dark:text-white transition-all"
                      min="0"
                    />
                  </div>

                  {/* Percentage Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        📈 ผลตอบแทน (%/ปี)
                      </label>
                      <input
                        type="number"
                        value={expectedReturn === 0 ? "" : expectedReturn}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setExpectedReturn)
                        }
                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-700 dark:text-white transition-all"
                        min="1"
                        max="20"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        📉 อัตราเงินเฟ้อ (%/ปี)
                      </label>
                      <input
                        type="number"
                        value={inflationRate === 0 ? "" : inflationRate}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setInflationRate)
                        }
                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-700 dark:text-white transition-all"
                        min="0"
                        max="10"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={savePlan}
                    disabled={loading}
                    className="w-full px-5 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? currentPlan
                        ? "กำลังอัปเดต..."
                        : "กำลังบันทึก..."
                      : currentPlan
                      ? "💾 อัปเดตแผน"
                      : "💾 บันทึกแผน"}
                  </button>
                </div>
              </div>

              {/* Results Panel */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <div className="bg-emerald-700 dark:bg-emerald-800 p-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>🎯</span> ผลการคำนวณ
                  </h2>
                </div>

                <div className="p-5 space-y-3">
                  {/* Years to Retirement */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3.5 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                          ⏰ ปีที่เหลือ
                        </div>
                        <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                          {results.yearsToRetirement}{" "}
                          <span className="text-base">ปี</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                        ⏳
                      </div>
                    </div>
                  </div>

                  {/* Monthly Savings Needed */}
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                          💰 เงินออมรายเดือนที่ต้องการ
                        </div>
                        <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                          ฿{formatNumber(results.monthlyPayment)}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                        💵
                      </div>
                    </div>
                  </div>

                  {/* Target Lump Sum */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                    <div className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">
                      🎯 เงินก้อนเป้าหมาย
                    </div>
                    <div className="text-lg font-bold text-purple-800 dark:text-purple-300">
                      ฿{formatNumber(results.targetLumpSum)}
                    </div>
                  </div>

                  {/* Future Value of Current Savings */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                    <div className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-1">
                      📈 มูลค่าอนาคตของเงินออมปัจจุบัน
                    </div>
                    <div className="text-base font-bold text-indigo-800 dark:text-indigo-300">
                      ฿{formatNumber(results.futureValueOfCurrentSavings)}
                    </div>
                  </div>

                  {/* Additional Savings Needed */}
                  <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-200/50 dark:border-rose-800/50">
                    <div className="text-xs font-medium text-rose-700 dark:text-rose-400 mb-1">
                      ⚠️ เงินที่ต้องออมเพิ่ม
                    </div>
                    <div className="text-base font-bold text-rose-800 dark:text-rose-300">
                      ฿{formatNumber(results.additionalSavingsNeeded)}
                    </div>
                  </div>

                  {/* Info: Real return */}
                  <div className="mt-1 p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-md text-xs text-gray-600 dark:text-gray-300">
                    ผลตอบแทนสุทธิหลังหักเงินเฟ้อ (ข้อมูลอ้างอิง):{" "}
                    {(expectedReturn - inflationRate).toFixed(1)}% ต่อปี
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Savings Growth Chart */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <div className="bg-sky-700 dark:bg-sky-800 p-3.5">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <span>📈</span> การเติบโตของเงินออม
                  </h3>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={generateSavingsGrowthData()}>
                      <defs>
                        <linearGradient
                          id="colorCurrent"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6B7FD7"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6B7FD7"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorNew"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#7BC8A4"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="95%"
                            stopColor="#7BC8A4"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        tickFormatter={(v) => `฿${(v / 1000000).toFixed(1)}M`}
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                      />
                      <Tooltip
                        labelFormatter={(label) => `อายุ ${label} ปี`}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Area
                        type="monotone"
                        dataKey="currentSavingsGrowth"
                        stackId="1"
                        stroke="#6B7FD7"
                        strokeWidth={2}
                        fill="url(#colorCurrent)"
                        name="เงินออมปัจจุบัน"
                      />
                      <Area
                        type="monotone"
                        dataKey="newSavingsGrowth"
                        stackId="1"
                        stroke="#7BC8A4"
                        strokeWidth={2}
                        fill="url(#colorNew)"
                        name="เงินออมเพิ่มเติม"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comparison Bar Chart */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <div className="bg-orange-700 dark:bg-orange-800 p-3.5">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <span>📊</span> เปรียบเทียบเงินออม
                  </h3>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={generateComparisonData()}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 10 }}
                        angle={-12}
                        textAnchor="end"
                        height={70}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        tickFormatter={(v) => `฿${(v / 1000000).toFixed(1)}M`}
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="amount"
                        fill="#6B7FD7"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <div className="bg-rose-700 dark:bg-rose-800 p-3.5">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <span>🥧</span> สัดส่วนเงินออม
                  </h3>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={generatePieChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={85}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {generatePieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <div className="bg-violet-700 dark:bg-violet-800 p-3.5">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <span>🎯</span> ความคืบหน้าสู่เป้าหมาย
                  </h3>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={generateSavingsGrowthData()}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        tickFormatter={(v) => `฿${(v / 1000000).toFixed(1)}M`}
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                      />
                      <Tooltip
                        labelFormatter={(label) => `อายุ ${label} ปี`}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Line
                        type="monotone"
                        dataKey="totalSavings"
                        stroke="#6B7FD7"
                        strokeWidth={2.5}
                        name="เงินออมรวม"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey={() => results.targetLumpSum}
                        stroke="#E27D60"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        name="เป้าหมายเงินก้อน"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: "10px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelDelete}
        PaperProps={{
          style: { borderRadius: "12px" },
        }}
      >
        <DialogTitle sx={{ fontWeight: "600" }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: "12px 20px" }}>
          <Button onClick={handleCancelDelete} sx={{ borderRadius: "8px" }}>
            ยกเลิก
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            color="error"
            variant="contained"
            disabled={loading}
            sx={{ borderRadius: "8px" }}
          >
            ลบ
          </Button>
        </DialogActions>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}
