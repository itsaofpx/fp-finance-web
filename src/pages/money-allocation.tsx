import { Button, TextField, Alert, CircularProgress } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";

export interface IMoneyAllocationResponse {
  totalInvestmentAmount: number;
  totalSavingsAmount: number;
  actualInvestmentAmount: number;
  weeklyInvestmentAmount: number;
}

const MoneyAllocation = () => {
  const [formData, setFormData] = useState({
    totalMoney: "",
    investPercent: "",
    savingPercent: "",
  });

  const [result, setResult] = useState<IMoneyAllocationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
      if (error) setError(null);
    };

  const handleBackClick = () => {
    window.location.href = "http://localhost:3000/tool";
  };

  const validateForm = () => {
    const { totalMoney, investPercent, savingPercent } = formData;

    if (!totalMoney || !investPercent || !savingPercent) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return false;
    }

    if (
      parseFloat(totalMoney) <= 0 ||
      parseFloat(investPercent) < 0 ||
      parseFloat(savingPercent) < 0
    ) {
      setError("กรุณากรอกตัวเลขที่ถูกต้อง");
      return false;
    }

    if (parseFloat(investPercent) > 100) {
      setError("เปอร์เซ็นต์การลงทุนไม่สามารถเกิน 100% ได้");
      return false;
    }

    if (parseFloat(savingPercent) > 100) {
      setError("เปอร์เซ็นต์การออมไม่สามารถเกิน 100% ได้");
      return false;
    }

    return true;
  };

  const handleCalculate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        totalMoney: parseFloat(formData.totalMoney),
        investPercent: parseFloat(formData.investPercent),
        savingPercent: parseFloat(formData.savingPercent),
      };

      const response = await axios.post(
        "http://localhost:3001/tool/money-allocation",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error("Error calculating money allocation:", err);
      setError("เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const getValueColor = (key: string, value: number) => {
    if (
      key === "actualInvestmentAmount" &&
      result &&
      value < result.totalInvestmentAmount
    ) {
      return "text-yellow-400";
    }
    return "text-gray-100";
  };

  const getFieldLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      totalInvestmentAmount: "เงินที่จัดสรรไปลงทุน",
      totalSavingsAmount: "เงินที่เก็บเป็นเงินสด (จากส่วนลงทุน)",
      actualInvestmentAmount: "เงินลงทุนจริง",
      weeklyInvestmentAmount: "เงินลงทุนรายสัปดาห์",
    };
    return labels[key] || key;
  };

  const getFieldDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      totalInvestmentAmount: `${formData.investPercent}% ของเงินทั้งหมด`,
      totalSavingsAmount: `${formData.savingPercent}% ของเงินลงทุน (เก็บเป็นเงินสด)`,
      actualInvestmentAmount: "เงินลงทุนจริง",
      weeklyInvestmentAmount: "แผนการลงทุนรายสัปดาห์",
    };
    return descriptions[key];
  };

  const getFieldUnit = (key: string) => {
    return " บาท";
  };

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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-xl mb-4">
              <svg
                className="w-8 h-8 text-gray-300"
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
              จัดสรรเงิน
            </h1>
            <p className="text-gray-400 text-lg">
              เครื่องมือจัดสรรเงินเพื่อการลงทุนและการออม
            </p>
          </div>

          <div className="p-8 pt-0">
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

            {/* Flow Explanation */}
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
                วิธีการจัดสรรเงิน
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">เงินทั้งหมด</div>
                    <div className="text-gray-400">
                      เช่น เงินเดือน 100,000 บาท
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">
                      แบ่งเพื่อลงทุน
                    </div>
                    <div className="text-gray-400">เช่น 60% = 60,000 บาท</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">
                      เก็บเป็นเงินสด
                    </div>
                    <div className="text-gray-400">
                      เช่น 30% ของ 60,000 = 18,000
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💰 เงินทั้งหมด (บาท)
                  </label>
                  <TextField
                    placeholder="เช่น 100,000"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.totalMoney}
                    onChange={handleInputChange("totalMoney")}
                    disabled={loading}
                    inputProps={{ step: "0.01", min: "0" }}
                    sx={{
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
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    เช่น เงินเดือน, โบนัส, หรือเงินที่มีอยู่ทั้งหมด
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📈 เปอร์เซ็นต์เพื่อลงทุน (%)
                  </label>
                  <TextField
                    placeholder="เช่น 60"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.investPercent}
                    onChange={handleInputChange("investPercent")}
                    disabled={loading}
                    inputProps={{ step: "0.1", min: "0", max: "100" }}
                    sx={{
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
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    จากเงินทั้งหมด จะแบ่งเท่าไหร่เพื่อลงทุน
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💵 เปอร์เซ็นต์เก็บเป็นเงินสด (%)
                  </label>
                  <TextField
                    placeholder="เช่น 30"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.savingPercent}
                    onChange={handleInputChange("savingPercent")}
                    disabled={loading}
                    inputProps={{ step: "0.1", min: "0", max: "100" }}
                    sx={{
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
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    จากเงินลงทุน จะเก็บเท่าไหร่เป็นเงินสด
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCalculate}
                  disabled={loading}
                  className="flex-1"
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
                    "คำนวณการจัดสรรเงิน"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="mt-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-700 rounded-full mb-4">
                  <svg
                    className="w-7 h-7 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-2">
                  ผลการจัดสรรเงิน
                </h3>
                <div className="w-16 h-0.5 bg-gray-600 mx-auto"></div>
              </div>

              {/* Results Grid */}
              <div className="space-y-4">
                {Object.entries(result).map(([key, value]) => {
                  const isImportant =
                    key === "actualInvestmentAmount" ||
                    key === "weeklyInvestmentAmount";

                  return (
                    <div
                      key={key}
                      className={`p-5 rounded-xl border transition-all duration-200 hover:border-gray-500 ${
                        isImportant
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-750 border-gray-650"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Label */}
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              key === "totalInvestmentAmount"
                                ? "bg-blue-400"
                                : key === "totalSavingsAmount"
                                ? "bg-green-400"
                                : key === "actualInvestmentAmount"
                                ? "bg-yellow-400"
                                : "bg-purple-400"
                            }`}
                          ></div>
                          <div>
                            <div className="text-gray-300 font-medium text-base">
                              {getFieldLabel(key)}
                            </div>
                            {getFieldDescription(key) && (
                              <div className="text-gray-500 text-sm mt-1">
                                {getFieldDescription(key)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Value */}
                        <div className="text-right">
                          <div
                            className={`text-xl font-bold ${getValueColor(
                              key,
                              value
                            )}`}
                          >
                            {value.toLocaleString("th-TH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            <span className="text-base text-gray-400 ml-1">
                              {getFieldUnit(key)}
                            </span>
                          </div>
                          {key === "weeklyInvestmentAmount" && (
                            <div className="text-sm mt-1 text-purple-400">
                              📅 แผนรายสัปดาห์
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <DisclaimerFooter />
    </div>
  );
};

export default MoneyAllocation;
