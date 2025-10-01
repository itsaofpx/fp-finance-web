"use client";
import {
  Button,
  TextField,
  Alert,
  CircularProgress,
  Typography,
  IconButton,
  Card,
  CardContent,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptIcon from "@mui/icons-material/Receipt";

interface IExpenseItem {
  name: string;
  amount: number;
}

interface IEmergencyFundRequest {
  expenses?: IExpenseItem[];
  monthlyExpense?: number;
  fundMultiplier: number;
}

interface IEmergencyFundResponse {
  totalEmergencyFund: number;
  monthlyExpense: number;
  fundMultiplier: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const EmergencyFundCalculator = () => {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [expenses, setExpenses] = useState<IExpenseItem[]>([
    { name: "", amount: 0 },
  ]);
  const [monthlyExpense, setMonthlyExpense] = useState<string>("");
  const [fundMultiplier, setFundMultiplier] = useState<string>("6");

  const [result, setResult] = useState<IEmergencyFundResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackClick = () => {
    router.push("/tool");
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (error) setError(null);
  };

  const addExpense = () => {
    setExpenses([...expenses, { name: "", amount: 0 }]);
  };

  const removeExpense = (index: number) => {
    if (expenses.length > 1) {
      const newExpenses = expenses.filter((_, i) => i !== index);
      setExpenses(newExpenses);
    }
  };

  const updateExpense = (
    index: number,
    field: keyof IExpenseItem,
    value: string
  ) => {
    const newExpenses = [...expenses];
    newExpenses[index] = {
      ...newExpenses[index],
      [field]: field === "amount" ? parseFloat(value) || 0 : value,
    };
    setExpenses(newExpenses);
    if (error) setError(null);
  };

  const handleMonthlyExpenseChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMonthlyExpense(event.target.value);
    if (error) setError(null);
  };

  const handleFundMultiplierChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFundMultiplier(event.target.value);
    if (error) setError(null);
  };

  const validateForm = () => {
    const multiplier = parseFloat(fundMultiplier);
    if (!fundMultiplier || multiplier <= 0) {
      setError("กรุณากรอกตัวคูณเงินสำรอง (มากกว่า 0)");
      return false;
    }

    if (tabValue === 0) {
      // Monthly Expense tab
      const baseExpense = parseFloat(monthlyExpense) || 0;
      if (baseExpense <= 0) {
        setError("กรุณากรอกรายจ่ายรายเดือน");
        return false;
      }
    } else {
      // Expenses tab
      const hasValidExpenses = expenses.some(
        (expense) => expense.name.trim() && expense.amount > 0
      );
      if (!hasValidExpenses) {
        setError("กรุณาเพิ่มรายการค่าใช้จ่ายอย่างน้อย 1 รายการ");
        return false;
      }
    }

    return true;
  };

  const handleCalculate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      let payload: IEmergencyFundRequest;

      if (tabValue === 0) {
        // Monthly Expense tab
        payload = {
          monthlyExpense: parseFloat(monthlyExpense),
          fundMultiplier: parseFloat(fundMultiplier),
        };
      } else {
        // Expenses tab
        const validExpenses = expenses.filter(
          (expense) => expense.name.trim() && expense.amount > 0
        );
        payload = {
          expenses: validExpenses,
          fundMultiplier: parseFloat(fundMultiplier),
        };
      }

      const response = await fetch(
        "http://localhost:3001/tool/emergency-fund",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: IEmergencyFundResponse = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error calculating Emergency Fund:", err);
      setError("เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#374151",
      borderRadius: "12px",
      height: "56px",
      "& fieldset": {
        borderColor: "#4B5563",
      },
      "&:hover fieldset": {
        borderColor: "#6B7280",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#3B82F6",
        borderWidth: "2px",
      },
    },
    "& .MuiInputBase-input": {
      color: "#F9FAFB",
      fontSize: "16px",
      "&::placeholder": {
        color: "#9CA3AF",
      },
    },
  };

  // Predefined multiplier options
  const multiplierOptions = [
    { value: 3, label: "3 เดือน", description: "ขั้นต้น" },
    { value: 6, label: "6 เดือน", description: "แนะนำ" },
    { value: 9, label: "9 เดือน", description: "มีครอบครัว" },
    { value: 12, label: "12 เดือน", description: "รายได้ไม่แน่นอน" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          {/* Back Arrow Header */}
          <div className="p-6 pb-0">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors duration-200 group"
            >
              <div className="p-2 rounded-lg bg-gray-700 group-hover:bg-gray-600 transition-colors duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </div>
              <span className="font-medium">กลับไปเครื่องมือ</span>
            </button>
          </div>

          {/* Main Header */}
          <div className="text-center my-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              คำนวณ Emergency Fund
            </h1>
            <p className="text-gray-400 text-lg">
              คำนวณเงินสำรองฉุกเฉินที่เหมาะสมกับรายได้
            </p>
          </div>

          <div className="p-8 pt-0">
            {/* Flow Explanation */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/30 to-cyan-500/30 rounded-xl border border-blue-800/30">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                วิธีการคำนวณ Emergency Fund
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">
                      เลือกวิธีคำนวณ
                    </div>
                    <div className="text-gray-400">
                      รายจ่ายรวม หรือ รายการแยกย่อย
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">เลือกตัวคูณ</div>
                    <div className="text-gray-400">
                      เลือกจำนวนเดือนที่ต้องการสำรอง
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">ผลการคำนวณ</div>
                    <div className="text-gray-400">จำนวนเงินสำรองที่ควรมี</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6">
                <Alert
                  severity="error"
                  sx={{
                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                    color: "#FCA5A5",
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                    borderRadius: "12px",
                    "& .MuiAlert-icon": {
                      color: "#FCA5A5",
                    },
                  }}
                >
                  {error}
                </Alert>
              </div>
            )}

            {/* Tabs Section */}
            <div className="space-y-6">
              <Box sx={{ borderBottom: 1, borderColor: "#4B5563" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#3B82F6",
                    },
                    "& .MuiTab-root": {
                      color: "#9CA3AF",
                      textTransform: "none",
                      fontSize: "16px",
                      fontWeight: 500,
                      "&.Mui-selected": {
                        color: "#3B82F6",
                      },
                    },
                  }}
                >
                  <Tab
                    icon={<AccountBalanceWalletIcon />}
                    label="รายจ่ายรายเดือนรวม"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<ReceiptIcon />}
                    label="รายการค่าใช้จ่ายแยกย่อย"
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Tab Panel 0: Monthly Expense */}
              <TabPanel value={tabValue} index={0}>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💰 รายจ่ายรายเดือนรวม
                  </label>
                  <TextField
                    placeholder="เช่น 35000"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={monthlyExpense}
                    onChange={handleMonthlyExpenseChange}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">บาท</span>,
                    }}
                    sx={textFieldStyle}
                  />
                  <p className="text-xs text-gray-400 mt-2 ml-2">
                    ใส่จำนวนเงินรายจ่ายรายเดือนรวมทั้งหมด เช่น ค่าเช่า ค่าอาหาร
                    ค่าเดินทาง ค่าใช้จ่ายอื่นๆ
                  </p>
                </div>
              </TabPanel>

              {/* Tab Panel 1: Detailed Expenses */}
              <TabPanel value={tabValue} index={1}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-100">
                      📊 รายการค่าใช้จ่าย
                    </h3>
                    <Button
                      variant="outlined"
                      onClick={addExpense}
                      startIcon={<AddIcon />}
                      sx={{
                        color: "#3B82F6",
                        borderColor: "#3B82F6",
                        "&:hover": {
                          borderColor: "#2563EB",
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                        },
                      }}
                    >
                      เพิ่มรายการ
                    </Button>
                  </div>

                  {/* Expense Cards */}
                  <div className="space-y-4">
                    {expenses.map((expense, index) => (
                      <Card
                        key={index}
                        sx={{
                          backgroundColor: "#374151",
                          border: "1px solid #4B5563",
                          borderRadius: "12px",
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <Typography className="text-gray-200 font-medium">
                              รายการที่ {index + 1}
                            </Typography>
                            {expenses.length > 1 && (
                              <IconButton
                                onClick={() => removeExpense(index)}
                                sx={{ color: "#EF4444" }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                ชื่อรายการ
                              </label>
                              <TextField
                                placeholder="เช่น ค่าเช่าบ้าน, ค่าอาหาร"
                                variant="outlined"
                                fullWidth
                                value={expense.name}
                                onChange={(e) =>
                                  updateExpense(index, "name", e.target.value)
                                }
                                disabled={loading}
                                sx={textFieldStyle}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                จำนวนเงิน
                              </label>
                              <TextField
                                placeholder="เช่น 8000"
                                variant="outlined"
                                fullWidth
                                type="number"
                                value={expense.amount || ""}
                                onChange={(e) =>
                                  updateExpense(index, "amount", e.target.value)
                                }
                                disabled={loading}
                                InputProps={{
                                  endAdornment: (
                                    <span className="text-gray-400">บาท</span>
                                  ),
                                }}
                                sx={textFieldStyle}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabPanel>

              {/* Fund Multiplier Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  📅 จำนวนเดือนที่ต้องการสำรอง
                </label>

                {/* Quick Select Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {multiplierOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFundMultiplier(option.value.toString())}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        parseFloat(fundMultiplier) === option.value
                          ? "border-blue-500 bg-blue-500/20 text-blue-300"
                          : "border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-xs text-gray-400">
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <TextField
                  placeholder="หรือใส่จำนวนเดือนที่ต้องการ"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={fundMultiplier}
                  onChange={handleFundMultiplierChange}
                  disabled={loading}
                  InputProps={{
                    endAdornment: <span className="text-gray-400">เดือน</span>,
                  }}
                  sx={textFieldStyle}
                />
              </div>

              {/* Calculate Button */}
              <Button
                variant="contained"
                fullWidth
                onClick={handleCalculate}
                disabled={loading}
                sx={{
                  background:
                    "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                  color: "white",
                  py: 1.5,
                  px: 4,
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "12px",
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
                    boxShadow: "0 6px 16px rgba(59, 130, 246, 0.4)",
                  },
                  "&:disabled": {
                    backgroundColor: "#6B7280",
                    color: "#D1D5DB",
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{ mr: 1, color: "white" }}
                    />
                    กำลังคำนวณ...
                  </>
                ) : (
                  "💰 คำนวณเงินสำรองฉุกเฉิน"
                )}
              </Button>
            </div>

            {/* Result Display */}
            {result && (
              <div className="mt-8 bg-gray-750 rounded-xl p-6">
                <div className="text-center mb-6">
                  <span className="text-2xl font-bold text-blue-400">
                    💰 ผลการคำนวณเงินสำรองฉุกเฉิน
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-6 rounded-xl border border-blue-600/30 bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
                    <div className="text-center">
                      <div className="text-gray-300 text-lg mb-2">
                        เงินสำรองฉุกเฉินที่ควรมี
                      </div>
                      <div className="text-4xl font-bold text-blue-400 mb-2">
                        {formatNumber(result.totalEmergencyFund)} บาท
                      </div>
                      <div className="text-gray-400">
                        ({result.fundMultiplier} เดือน ×{" "}
                        {formatNumber(result.monthlyExpense)} บาท)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">
                          รายจ่ายรายเดือนรวม
                        </span>
                        <span className="font-bold text-cyan-400">
                          {formatNumber(result.monthlyExpense)} บาท
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">จำนวนเดือนสำรอง</span>
                        <span className="font-bold text-blue-400">
                          {result.fundMultiplier} เดือน
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Savings Plan */}
                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <h4 className="text-gray-300 font-medium mb-3">
                      💡 แผนการออมเงิน
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          ออมเดือนละ 5,000 บาท:
                        </span>
                        <span className="text-gray-300">
                          ใช้เวลา {Math.ceil(result.totalEmergencyFund / 5000)}{" "}
                          เดือน
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          ออมเดือนละ 10,000 บาท:
                        </span>
                        <span className="text-gray-300">
                          ใช้เวลา {Math.ceil(result.totalEmergencyFund / 10000)}{" "}
                          เดือน
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          ออมเดือนละ 15,000 บาท:
                        </span>
                        <span className="text-gray-300">
                          ใช้เวลา {Math.ceil(result.totalEmergencyFund / 15000)}{" "}
                          เดือน
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="p-4 rounded-xl border border-blue-600/30 bg-blue-900/10">
                    <h4 className="text-blue-400 font-medium mb-2">
                      💡 คำแนะนำ
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• เก็บเงินสำรองในบัญชีออมทรัพย์ที่เข้าถึงได้ง่าย</li>
                      <li>• อย่านำเงินสำรองไปลงทุนในตราสารที่มีความเสี่ยง</li>
                      <li>• ทบทวนจำนวนเงินสำรองทุก 6-12 เดือน</li>
                      <li>• เริ่มต้นจาก 1,000 บาท แล้วค่อยๆ เพิ่ม</li>
                      <li>• แยกบัญชีเงินสำรองออกจากเงินใช้ประจำวัน</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <DisclaimerFooter />
    </div>
  );
};

export default EmergencyFundCalculator;
