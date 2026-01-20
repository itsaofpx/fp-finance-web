"use client";
import { Button, TextField, Alert, CircularProgress } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";
import FormulaDialog from "@/components/FormulaDialog";
import { useRouter } from "next/navigation";

export interface IDepth {
  earlyStopPrice: number;
  moderateStopPrice: number;
  wideStopPrice: number;
}

export interface IStopLossResponse {
  ticker?: string;
  stopPrice: IDepth[];
}

const StopLossCalculator = () => {
  const [formData, setFormData] = useState({
    ticker: "",
    entryPrice: "",
    method: "loss",
  });
  const router = useRouter();

  const [result, setResult] = useState<IStopLossResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFormula, setOpenFormula] = useState(false);

  const methods = [
    {
      value: "loss",
      label: "Stop Loss",
      description: "กำหนดจุดตัดขาดทุนเพื่อจำกัดความเสี่ยง",
      icon: (
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
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          />
        </svg>
      ),
    },
    {
      value: "profit",
      label: "Take Profit",
      description: "กำหนดจุดรับกำไรเพื่อล็อคผลตอบแทน",
      icon: (
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
            d="M7 11l5-5m0 0l5 5m-5-5v12"
          />
        </svg>
      ),
    },
  ];

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
    const { entryPrice } = formData;

    if (!entryPrice) {
      setError("กรุณากรอกราคาเข้า");
      return false;
    }

    if (parseFloat(entryPrice) <= 0) {
      setError("กรุณากรอกราคาที่มากกว่า 0");
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
        ticker: formData.ticker || undefined,
        entryPrice: parseFloat(formData.entryPrice),
        method: formData.method as "loss" | "profit",
      };

      const response = await axios.post(
        "http://localhost:3001/tool/stop-loss",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      console.log(response);
      setResult(response.data);
    } catch (err) {
      console.error("Error calculating stop loss:", err);
      setError("เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          {/* Back Arrow Header */}
          <div className="p-6 pb-0 flex justify-between">
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
            <button
              onClick={() => setOpenFormula(!openFormula)}
              className="inline-flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <span className="font-medium">สูตรการคำนวณ</span>
            </button>
          </div>

          {/* Formula Dialog */}
          <FormulaDialog
            open={openFormula}
            onClose={() => setOpenFormula(false)}
            formulas={[
              {
                title: "1. ราคา Stop Loss",
                formula: "Stop Loss = Entry Price × (1 - Loss %)",
                color: "blue",
                textColor: "text-blue-300",
              },
              {
                title: "2. ราคา Take Profit",
                formula: "Take Profit = Entry Price × (1 + Profit %)",
                color: "green",
                textColor: "text-green-300",
              },
              {
                title: "3. Fibonacci Levels",
                formula: "Support = High - (High - Low) × 0.236 / 0.382 / 0.618",
                color: "purple",
                textColor: "text-purple-300",
              },
              {
                title: "4. Golden Ratio",
                formula: "Golden Ratio = 1.618 (สำหรับคำนวณจุดสนับสนุน)",
                color: "yellow",
                textColor: "text-yellow-300",
              },
            ]}
            title="📐 สูตร Stop Loss"
          />

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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              คำนวณ Stop Loss / Take Profit
            </h1>
            <p className="text-gray-400 text-lg">
              เครื่องมือจัดการความเสี่ยงและรับกำไร
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

            {/* Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    สัญลักษณ์หุ้น (ไม่บังคับ)
                  </label>
                  <TextField
                    placeholder="เช่น NVDA, AAPL"
                    variant="outlined"
                    fullWidth
                    value={formData.ticker}
                    onChange={handleInputChange("ticker")}
                    disabled={loading}
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
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ราคาเข้า (บาท)
                  </label>
                  <TextField
                    placeholder="เช่น 20.00"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.entryPrice}
                    onChange={handleInputChange("entryPrice")}
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
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ประเภทการคำนวณ
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {methods.map((method) => (
                    <div
                      key={method.value}
                      onClick={() =>
                        setFormData({ ...formData, method: method.value })
                      }
                      className={`cursor-pointer rounded-xl transition-all duration-200 ${
                        formData.method === method.value
                          ? "bg-gray-700 border-2 border-blue-500"
                          : "bg-gray-800 border border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-4">
                          {/* Radio Button */}
                          <div
                            className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.method === method.value
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-500"
                            }`}
                          >
                            {formData.method === method.value && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>

                          {/* Icon */}
                          <div
                            className={`p-2 rounded-lg ${
                              formData.method === method.value
                                ? "bg-blue-500 text-white"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {method.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`font-semibold text-lg ${
                                  formData.method === method.value
                                    ? "text-blue-400"
                                    : "text-gray-200"
                                }`}
                              >
                                {method.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
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
                    `คำนวณ ${
                      formData.method === "loss" ? "Stop Loss" : "Take Profit"
                    }`
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
                  ผลการคำนวณ{" "}
                  {formData.method === "loss" ? "Stop Loss" : "Take Profit"}
                  {result.ticker && (
                    <span className="text-blue-400 ml-2">
                      ({result.ticker})
                    </span>
                  )}
                </h3>
                <div className="w-16 h-0.5 bg-gray-600 mx-auto"></div>
              </div>

              {/* Results Grid */}
              {result.stopPrice && result.stopPrice.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      key: "earlyStopPrice",
                      label: "ระดับแคบ",
                      color: "text-green-400",
                    },
                    {
                      key: "moderateStopPrice",
                      label: "ระดับปานกลาง",
                      color: "text-yellow-400",
                    },
                    {
                      key: "wideStopPrice",
                      label: "ระดับกว้าง",
                      color: "text-red-400",
                    },
                  ].map(({ key, label, color }) => (
                    <div
                      key={key}
                      className="p-5 rounded-xl bg-gray-700 border border-gray-600 transition-all duration-200 hover:border-gray-500"
                    >
                      <div className="text-center">
                        <div className={`text-sm font-medium mb-2 ${color}`}>
                          {label}
                        </div>
                        <div className="text-xl font-bold text-gray-100">
                          {result.stopPrice[0][
                            key as keyof IDepth
                          ].toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          <span className="text-base text-gray-400 ml-1">
                            บาท
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <DisclaimerFooter />
    </div>
  );
};

export default StopLossCalculator;
