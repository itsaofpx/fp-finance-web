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
  DialogContentText 
} from '@mui/material';
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
  monthlyExpenses: number;
  currentSavings: number;
  expectedReturn: number;
  inflationRate: number;
  retirementYears: number;
  createdAt: string;
}

export default function PlanPage() {
  const router = useRouter();
  const [currentAge, setCurrentAge] = useState<number>(25);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(30000);
  const [currentSavings, setCurrentSavings] = useState<number>(0);
  const [expectedReturn, setExpectedReturn] = useState<number>(7);
  const [inflationRate, setInflationRate] = useState<number>(3);
  const [retirementYears, setRetirementYears] = useState<number>(25);
  const [planName, setPlanName] = useState<string>("");
  const [savedPlans, setSavedPlans] = useState<RetirementPlan[]>([]);
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // ฟังก์ชันสำหรับเรียก API
  const fetchPlansFromDatabase = async (accountId: string, token: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/plans/account/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSavedPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันจัดการ input number ที่สามารถลบเป็นช่องว่างได้
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

  // โหลดแผนที่บันทึกไว้จาก database
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Parse cookies with error handling
        const cookies = parseCookies();
        const accessToken = cookies.accessToken;
        const accountCookie = cookies.account;

        // Validate tokens
        if (!accessToken) {
          throw new Error("Authentication token is missing");
        }

        // Safely parse account cookie
        let accountData: { id?: string } = {};
        try {
          accountData = accountCookie ? JSON.parse(accountCookie) : {};
        } catch (parseError) {
          console.error("Failed to parse account cookie", parseError);
          throw new Error("Invalid account information");
        }

        // Validate Google ID
        const id = accountData.id;
        if (!id) {
          throw new Error("Google ID is missing");
        }
        setId(id);
        console.log(accountData);

        // โหลดแผนจาก database
        await fetchPlansFromDatabase(id, accessToken);
      } catch (error) {
        router.push("/");
      } finally {
      }
    };

    fetchUserProfile();
  }, []);

  // บันทึกแผนลง database
  const savePlan = async () => {
    if (!planName.trim()) {
      setSnackbar({
        open: true,
        message: 'กรุณาใส่ชื่อแผน',
        severity: 'error'
      });
      return;
    }

    if (!id) {
      setSnackbar({
        open: true,
        message: 'ไม่สามารถระบุตัวตนผู้ใช้ได้',
        severity: 'error'
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
        message: 'กรุณาเข้าสู่ระบบใหม่',
        severity: 'error'
      });
        return;
      }

      const newPlan = {
        accountId: id,
        name: planName,
        currentAge,
        retirementAge,
        monthlyExpenses,
        currentSavings,
        expectedReturn,
        inflationRate,
        retirementYears,
      };

      const response = await axios.post('http://localhost:3001/plans', newPlan, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const savedPlan = response.data;
      
      // อัปเดต state ด้วยแผนที่บันทึกแล้ว
      setSavedPlans(prevPlans => [...prevPlans, savedPlan]);
      setPlanName("");
      setSnackbar({
        open: true,
        message: 'บันทึกแผนสำเร็จ!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving plan:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึกแผน',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // โหลดแผนที่เลือก
  const loadPlan = (plan: RetirementPlan) => {
    setCurrentAge(plan.currentAge);
    setRetirementAge(plan.retirementAge);
    setMonthlyExpenses(plan.monthlyExpenses);
    setCurrentSavings(plan.currentSavings);
    setExpectedReturn(plan.expectedReturn);
    setInflationRate(plan.inflationRate);
    setRetirementYears(plan.retirementYears);
    setPlanName(plan.name);
  };

  // ลบแผน
  const deletePlan = (planId: string) => {
    setConfirmDialog({
      open: true,
      title: 'ยืนยันการลบแผน',
      message: 'คุณต้องการลบแผนนี้หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้',
      onConfirm: () => handleDeleteConfirm(planId)
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
          message: 'กรุณาเข้าสู่ระบบใหม่',
          severity: 'error'
        });
        return;
      }

      await axios.delete(`http://localhost:3001/plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // อัปเดต state โดยลบแผนที่ถูกลบออก
      setSavedPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      setSnackbar({
        open: true,
        message: 'ลบแผนสำเร็จ!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการลบแผน',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  // สร้างแผนใหม่
  const createNewPlan = () => {
    setCurrentAge(25);
    setRetirementAge(60);
    setMonthlyExpenses(30000);
    setCurrentSavings(0);
    setExpectedReturn(7);
    setInflationRate(3);
    setRetirementYears(25);
    setPlanName("");
  };

  const calculateRetirement = () => {
    const yearsToRetirement = retirementAge - currentAge;
    const realReturnRate = (expectedReturn - inflationRate) / 100;
    const monthlyRealReturn = realReturnRate / 12;

    // คำนวณค่าใช้จ่ายรายเดือนในอนาคต (ปรับตามอัตราเงินเฟ้อ)
    const futureMonthlyExpenses =
      monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);

    // คำนวณเงินทั้งหมดที่ต้องใช้ในช่วงเกษียณ
    const totalRetirementNeeds = futureMonthlyExpenses * 12 * retirementYears;

    // คำนวณมูลค่าปัจจุบันของเงินที่ต้องใช้ในอนาคต
    const presentValueOfRetirementNeeds =
      totalRetirementNeeds / Math.pow(1 + realReturnRate, retirementYears);

    // คำนวณมูลค่าอนาคตของเงินออมปัจจุบัน
    const futureValueOfCurrentSavings =
      currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetirement);

    // คำนวณเงินที่ต้องออมเพิ่ม
    const additionalSavingsNeeded =
      presentValueOfRetirementNeeds - futureValueOfCurrentSavings;

    // คำนวณเงินออมรายเดือนที่ต้องการ
    const monthlyPayment =
      (additionalSavingsNeeded * monthlyRealReturn) /
      (Math.pow(1 + monthlyRealReturn, yearsToRetirement * 12) - 1);

    return {
      yearsToRetirement,
      futureMonthlyExpenses: Math.round(futureMonthlyExpenses),
      totalRetirementNeeds: Math.round(totalRetirementNeeds),
      presentValueOfRetirementNeeds: Math.round(presentValueOfRetirementNeeds),
      futureValueOfCurrentSavings: Math.round(futureValueOfCurrentSavings),
      additionalSavingsNeeded: Math.round(Math.max(0, additionalSavingsNeeded)),
      monthlyPayment: Math.round(Math.max(0, monthlyPayment)),
    };
  };

  const results = calculateRetirement();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("th-TH").format(num);
  };

  // สร้างข้อมูลสำหรับกราฟการเติบโตของเงินออม
  const generateSavingsGrowthData = () => {
    const data = [];
    const yearsToRetirement = retirementAge - currentAge;

    for (let year = 0; year <= yearsToRetirement; year++) {
      const currentValue =
        currentSavings * Math.pow(1 + expectedReturn / 100, year);
      const monthlySavingsValue =
        results.monthlyPayment *
        12 *
        year *
        Math.pow(1 + expectedReturn / 100, year / 2);
      const totalSavings = currentValue + monthlySavingsValue;

      data.push({
        year: currentAge + year,
        totalSavings: Math.round(totalSavings),
        currentSavingsGrowth: Math.round(currentValue),
        newSavingsGrowth: Math.round(monthlySavingsValue),
      });
    }
    return data;
  };

  // สร้างข้อมูลสำหรับกราฟ Pie Chart
  const generatePieChartData = () => {
    return [
      {
        name: "เงินออมปัจจุบัน",
        value: results.futureValueOfCurrentSavings,
        color: "#3B82F6",
      },
      {
        name: "เงินออมเพิ่มเติม",
        value: results.additionalSavingsNeeded,
        color: "#10B981",
      },
    ];
  };

  // สร้างข้อมูลสำหรับกราฟแท่งเปรียบเทียบ
  const generateComparisonData = () => {
    return [
      {
        category: "เงินออมที่มี",
        amount: results.futureValueOfCurrentSavings,
        color: "#3B82F6",
      },
      {
        category: "เงินที่ต้องออมเพิ่ม",
        amount: results.additionalSavingsNeeded,
        color: "#F59E0B",
      },
      {
        category: "เป้าหมายเกษียณ",
        amount: results.presentValueOfRetirementNeeds,
        color: "#10B981",
      },
    ];
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              🏦 เครื่องคำนวณแผนเกษียณ
            </h1>

            {/* ปุ่มสร้างแผนใหม่ */}
            <div className="flex justify-center mb-6">
              <button
                onClick={createNewPlan}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                ✨ สร้างแผนใหม่
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - ฟอร์มและผลลัพธ์ */}
            <div className="lg:col-span-3">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* ฟอร์มการคำนวณ */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                    ข้อมูลสำหรับการคำนวณ
                  </h2>

                  <div className="space-y-4">
                    {/* ช่องชื่อแผน */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ชื่อแผน
                      </label>
                      <input
                        type="text"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="เช่น แผนเกษียณอายุ 60"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        อายุปัจจุบัน (ปี)
                      </label>
                      <input
                        type="number"
                        value={currentAge === 0 ? "" : currentAge}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setCurrentAge)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="18"
                        max="65"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        อายุที่ต้องการเกษียณ (ปี)
                      </label>
                      <input
                        type="number"
                        value={retirementAge === 0 ? "" : retirementAge}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setRetirementAge)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min={currentAge + 1}
                        max="80"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ค่าใช้จ่ายรายเดือนปัจจุบัน (บาท)
                      </label>
                      <input
                        type="number"
                        value={monthlyExpenses === 0 ? "" : monthlyExpenses}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setMonthlyExpenses)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="1000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        เงินออมปัจจุบัน (บาท)
                      </label>
                      <input
                        type="number"
                        value={currentSavings === 0 ? "" : currentSavings}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setCurrentSavings)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ผลตอบแทนที่คาดหวัง (% ต่อปี)
                      </label>
                      <input
                        type="number"
                        value={expectedReturn === 0 ? "" : expectedReturn}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setExpectedReturn)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="1"
                        max="20"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        อัตราเงินเฟ้อ (% ต่อปี)
                      </label>
                      <input
                        type="number"
                        value={inflationRate === 0 ? "" : inflationRate}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setInflationRate)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="0"
                        max="10"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        จำนวนปีหลังเกษียณ
                      </label>
                      <input
                        type="number"
                        value={retirementYears === 0 ? "" : retirementYears}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setRetirementYears)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="1"
                        max="50"
                      />
                    </div>

                    {/* ปุ่มบันทึกแผน */}
                    <button
                      onClick={savePlan}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? "กำลังบันทึก..." : "บันทึกแผน"}
                    </button>
                  </div>
                </div>

                {/* ผลลัพธ์การคำนวณ */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                    ผลการคำนวณ
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ปีที่เหลือก่อนเกษียณ
                      </div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {results.yearsToRetirement} ปี
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        เงินออมรายเดือนที่ต้องการ
                      </div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ฿{formatNumber(results.monthlyPayment)}
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ค่าใช้จ่ายรายเดือนในอนาคต
                      </div>
                      <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                        ฿{formatNumber(results.futureMonthlyExpenses)}
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        เงินที่ต้องมีเมื่อเกษียณ
                      </div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        ฿{formatNumber(results.presentValueOfRetirementNeeds)}
                      </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        มูลค่าอนาคตของเงินออมปัจจุบัน
                      </div>
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        ฿{formatNumber(results.futureValueOfCurrentSavings)}
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        เงินที่ต้องออมเพิ่ม
                      </div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        ฿{formatNumber(results.additionalSavingsNeeded)}
                      </div>
                    </div>
                  </div>

                  {/* คำแนะนำ */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                      💡 คำแนะนำ
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• เริ่มออมเงินเกษียณตั้งแต่อายุยังน้อย</li>
                      <li>• พิจารณาลงทุนในกองทุนรวม RMF หรือ SSF</li>
                      <li>• ปรับแผนการออมทุก 2-3 ปี</li>
                      <li>• หาแหล่งรายได้เสริมหลังเกษียณ</li>
                      <li>• คำนวณค่าใช้จ่ายในอนาคตรวมเงินเฟ้อ</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* กราฟแสดงผล */}
              <div className="grid lg:grid-cols-2 gap-8 mt-8">
                {/* กราหการเติบโตของเงินออม */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    📈 การเติบโตของเงินออม
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={generateSavingsGrowthData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="year"
                        className="text-sm"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `฿${(value / 1000000).toFixed(1)}M`
                        }
                        className="text-sm"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `฿${formatNumber(value)}`,
                          "",
                        ]}
                        labelFormatter={(label) => `อายุ ${label} ปี`}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="currentSavingsGrowth"
                        stackId="1"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        name="เงินออมปัจจุบัน"
                      />
                      <Area
                        type="monotone"
                        dataKey="newSavingsGrowth"
                        stackId="1"
                        stroke="#10B981"
                        fill="#10B981"
                        name="เงินออมเพิ่มเติม"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* กราฟเปรียบเทียบเงิน */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    📊 เปรียบเทียบเงินออม
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={generateComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="category"
                        className="text-sm"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `฿${(value / 1000000).toFixed(1)}M`
                        }
                        className="text-sm"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `฿${formatNumber(value)}`,
                          "",
                        ]}
                      />
                      <Bar dataKey="amount" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* กราฟแบ่งสัดส่วนและเส้นเป้าหมาย */}
              <div className="grid lg:grid-cols-2 gap-8 mt-8">
                {/* Pie Chart สัดส่วนเงินออม */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    🥧 สัดส่วนเงินออม
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={generatePieChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {generatePieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `฿${formatNumber(value)}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* กราฟเส้นเป้าหมาย */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    🎯 ความคืบหน้าสู่เป้าหมาย
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={generateSavingsGrowthData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="year"
                        className="text-sm"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `฿${(value / 1000000).toFixed(1)}M`
                        }
                        className="text-sm"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `฿${formatNumber(value)}`,
                          "",
                        ]}
                        labelFormatter={(label) => `อายุ ${label} ปี`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="totalSavings"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        name="เงินออมรวม"
                      />
                      <Line
                        type="monotone"
                        dataKey={() => results.presentValueOfRetirementNeeds}
                        stroke="#EF4444"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        name="เป้าหมายเกษียณ"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sidebar - แผนที่บันทึกไว้ */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-20">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                  📋 แผนที่บันทึกไว้
                  <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                    {savedPlans.length}
                  </span>
                </h2>

                {savedPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📂</div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      ยังไม่มีแผนที่บันทึกไว้
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {savedPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate pr-2">
                            {plan.name}
                          </h3>
                          <button
                            onClick={() => deletePlan(plan.id)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 text-xs disabled:text-gray-400 disabled:cursor-not-allowed"
                            title="ลบแผน"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 mb-3">
                          <p>
                            อายุ: {plan.currentAge} → {plan.retirementAge} ปี
                          </p>
                          <p>
                            ค่าใช้จ่าย: ฿{formatNumber(plan.monthlyExpenses)}
                          </p>
                          <p>
                            สร้างเมื่อ:{" "}
                            {new Date(plan.createdAt).toLocaleDateString(
                              "th-TH"
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => loadPlan(plan)}
                          className="w-full px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
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
        </div>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            ยกเลิก
          </Button>
          <Button 
            onClick={confirmDialog.onConfirm} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
