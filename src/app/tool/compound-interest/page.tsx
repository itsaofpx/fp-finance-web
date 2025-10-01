"use client";
import { useState } from "react";
import {
  Button,
  TextField,
  Alert,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

export interface ICompoundInterestRequest {
  initialInvestment: number;
  monthlyContribution: number;
  annualInterestRate: number;
  investmentPeriodYears: number;
  compoundingFrequency: "monthly" | "quarterly" | "annually";
}

export interface ICompoundInterestResponse {
  finalBalance: number;
  totalInvestment: number;
  totalContributions: number;
  totalInterestEarned: number;
  yearlyBreakdown: IYearlyBreakdown[];
}

export interface IYearlyBreakdown {
  year: number;
  startBalance: number;
  contributions: number;
  interestEarned: number;
  endBalance: number;
  totalContributions: number;
  totalInterestEarned: number;
}

const CompoundInterestCalculator = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ICompoundInterestRequest>({
    initialInvestment: 0,
    monthlyContribution: 0,
    annualInterestRate: 0,
    investmentPeriodYears: 1,
    compoundingFrequency: "monthly",
  });
  const [result, setResult] = useState<ICompoundInterestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange =
    (field: keyof ICompoundInterestRequest) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
      if (error) setError(null);
    };

  const handleBackClick = () => {
    router.push("/tool");
  };

  const validateForm = () => {
    const {
      initialInvestment,
      monthlyContribution,
      annualInterestRate,
      investmentPeriodYears,
    } = formData;

    if (
      initialInvestment < 0 ||
      monthlyContribution < 0 ||
      annualInterestRate < 0 ||
      investmentPeriodYears < 1
    ) {
      setError("กรุณากรอกตัวเลขให้ถูกต้อง");
      return false;
    }

    if (investmentPeriodYears > 50) {
      setError("ระยะเวลาลงทุนต้องไม่เกิน 50 ปี");
      return false;
    }

    if (annualInterestRate > 100) {
      setError("อัตราผลตอบแทนต้องไม่เกิน 100%");
      return false;
    }

    return true;
  };

  const handleCalculate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3001/tool/compound-interest",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error("Error:", err);
      setError("เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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
        borderColor: "#9CA3AF",
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

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          {/* Back Button */}
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

          {/* Header */}
          <div className="text-center my-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-xl mb-4">
              <svg
                className="w-8 h-8 text-blue-400"
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
              คำนวณดอกเบี้ยทบต้น
            </h1>
            <p className="text-gray-400 text-lg">
              เครื่องมือคำนวณผลตอบแทนจากการลงทุนแบบทบต้น
            </p>
          </div>

          {/* Main Content */}
          <div className="p-8 pt-0">
            {/* Information Box */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/30 to-purple-500/30 rounded-xl border border-blue-800/30">
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
                วิธีการคำนวณ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">
                      เงินลงทุนเริ่มต้น
                    </div>
                    <div className="text-gray-400">
                      จำนวนเงินที่ลงทุนครั้งแรก
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">
                      การลงทุนต่อเนื่อง
                    </div>
                    <div className="text-gray-400">
                      จำนวนเงินที่ลงทุนเพิ่มทุกเดือน
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">ผลตอบแทน</div>
                    <div className="text-gray-400">
                      อัตราผลตอบแทนต่อปีและความถี่ในการทบต้น
                    </div>
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

            {/* Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💰 เงินลงทุนเริ่มต้น
                  </label>
                  <TextField
                    type="number"
                    value={formData.initialInvestment}
                    onChange={handleInputChange("initialInvestment")}
                    placeholder="เช่น 100000"
                    fullWidth
                    InputProps={{
                      endAdornment: <span className="text-gray-400">บาท</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📈 เงินลงทุนรายเดือน
                  </label>
                  <TextField
                    type="number"
                    value={formData.monthlyContribution}
                    onChange={handleInputChange("monthlyContribution")}
                    placeholder="เช่น 5000"
                    fullWidth
                    InputProps={{
                      endAdornment: <span className="text-gray-400">บาท</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📊 อัตราผลตอบแทนต่อปี
                  </label>
                  <TextField
                    type="number"
                    value={formData.annualInterestRate}
                    onChange={handleInputChange("annualInterestRate")}
                    placeholder="เช่น 8"
                    fullWidth
                    InputProps={{
                      endAdornment: <span className="text-gray-400">%</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ⏳ ระยะเวลาลงทุน
                  </label>
                  <TextField
                    type="number"
                    value={formData.investmentPeriodYears}
                    onChange={handleInputChange("investmentPeriodYears")}
                    placeholder="เช่น 10"
                    fullWidth
                    InputProps={{
                      endAdornment: <span className="text-gray-400">ปี</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🔄 ความถี่ในการทบต้น
                  </label>
                  <TextField
                    select
                    value={formData.compoundingFrequency}
                    onChange={handleInputChange("compoundingFrequency")}
                    fullWidth
                    sx={textFieldStyle}
                  >
                    <MenuItem value="monthly">รายเดือน</MenuItem>
                    <MenuItem value="quarterly">รายไตรมาส</MenuItem>
                    <MenuItem value="annually">รายปี</MenuItem>
                  </TextField>
                </div>
              </div>

              {/* Calculate Button */}
              <Button
                variant="contained"
                fullWidth
                onClick={handleCalculate}
                disabled={loading}
                sx={{
                  backgroundColor: "#0077E7",
                  color: "white",
                  py: 1.5,
                  px: 4,
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "12px",
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  "&:hover": {
                    backgroundColor: "#023E8A",
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
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
                  "คำนวณดอกเบี้ยทบต้น"
                )}
              </Button>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-8 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-750 rounded-xl p-6 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-2">
                      มูลค่าสุดท้าย
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(result.finalBalance)}
                    </div>
                    <div className="mt-4 text-gray-400 text-sm">
                      ผลตอบแทนรวม:{" "}
                      <span className="text-blue-400">
                        {formatCurrency(result.totalInterestEarned)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-750 rounded-xl p-6 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-2">
                      เงินลงทุนรวม
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      {formatCurrency(result.totalInvestment)}
                    </div>
                    <div className="mt-4 text-gray-400 text-sm">
                      เงินลงทุนเพิ่ม:{" "}
                      <span className="text-gray-300">
                        {formatCurrency(result.totalContributions)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-gray-750 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">
                    กราฟแสดงการเติบโต
                  </h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={result.yearlyBreakdown}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="year"
                          stroke="#9CA3AF"
                          label={{
                            value: "ปี",
                            position: "insideBottom",
                            offset: -5,
                          }}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          tickFormatter={(value) =>
                            `${(value / 1000).toFixed(0)}k`
                          }
                          label={{
                            value: "มูลค่า (พันบาท)",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [formatCurrency(value)]}
                        />
                        <Line
                          type="monotone"
                          dataKey="endBalance"
                          stroke="#34D399"
                          name="มูลค่ารวม"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="totalContributions"
                          stroke="#60A5FA"
                          name="เงินลงทุนรวม"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Yearly Breakdown Table */}
                <div className="bg-gray-750 rounded-xl border border-gray-700 overflow-hidden">
                  <h3 className="text-lg font-semibold text-gray-100 p-6 pb-4">
                    รายละเอียดรายปี
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-t border-gray-700 bg-gray-800">
                          <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                            ปีที่
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-medium text-gray-400">
                            เงินลงทุนในปี
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-medium text-gray-400">
                            ผลตอบแทนในปี
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-medium text-gray-400">
                            มูลค่าสิ้นปี
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {result.yearlyBreakdown.map((year) => (
                          <tr
                            key={year.year}
                            className="hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {year.year}
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-300">
                              {formatCurrency(year.contributions)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-green-400">
                              {formatCurrency(year.interestEarned)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium text-blue-400">
                              {formatCurrency(year.endBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default CompoundInterestCalculator;
