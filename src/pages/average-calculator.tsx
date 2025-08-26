import { Button, TextField, Alert, CircularProgress } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";

export interface IAverageCostInvestResponse {
  currentTotalCost: number;
  additionalSharesPurchased: number;
  totalSharesAfterPurchase: number;
  newTotalCost: number;
  newAverageCostPerShare: number;
  currentPortfolioValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

const averageCostAverage = () => {
  const [formData, setFormData] = useState({
    currentStockUnits: "",
    averageCostPerShare: "",
    currentMarketPrice: "",
    additionalInvestmentAmount: "",
  });

  const [result, setResult] = useState<IAverageCostInvestResponse | null>(null);
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
    const {
      currentStockUnits,
      averageCostPerShare,
      currentMarketPrice,
      additionalInvestmentAmount,
    } = formData;

    if (
      !currentStockUnits ||
      !averageCostPerShare ||
      !currentMarketPrice ||
      !additionalInvestmentAmount
    ) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return false;
    }

    if (
      parseFloat(currentStockUnits) <= 0 ||
      parseFloat(averageCostPerShare) <= 0 ||
      parseFloat(currentMarketPrice) <= 0 ||
      parseFloat(additionalInvestmentAmount) <= 0
    ) {
      setError("กรุณากรอกตัวเลขที่มากกว่า 0");
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
        currentStockUnits: parseFloat(formData.currentStockUnits),
        averageCostPerShare: parseFloat(formData.averageCostPerShare),
        currentMarketPrice: parseFloat(formData.currentMarketPrice),
        additionalInvestmentAmount: parseFloat(
          formData.additionalInvestmentAmount
        ),
      };

      const response = await axios.post(
        "http://localhost:3001/tool/average-cost",
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
      console.error("Error calculating average cost:", err);
      setError("เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const getValueColor = (key: string, value: number) => {
    if (key === "profitLoss" || key === "profitLossPercentage") {
      return value >= 0 ? "text-green-400" : "text-red-400";
    }
    return "text-gray-100";
  };

  const getFieldLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      currentTotalCost: "มูลค่าการลงทุนเดิม",
      additionalSharesPurchased: "หุ้นที่ซื้อเพิ่ม",
      totalSharesAfterPurchase: "จำนวนหุ้นรวม",
      newTotalCost: "มูลค่าการลงทุนรวม",
      newAverageCostPerShare: "ราคาเฉลี่ยใหม่ต่อหุ้น",
      currentPortfolioValue: "มูลค่าพอร์ตปัจจุบัน",
      profitLoss: "กำไร/ขาดทุน",
      profitLossPercentage: "เปอร์เซ็นต์กำไร/ขาดทุน",
    };
    return labels[key] || key;
  };

  const getFieldDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      currentTotalCost: "เงินที่ลงทุนไปแล้ว",
      additionalSharesPurchased: "จำนวนหุ้นที่ได้จากเงินลงทุนเพิ่ม",
      totalSharesAfterPurchase: "หุ้นเดิม + หุ้นที่ซื้อเพิ่ม",
      newTotalCost: "เงินลงทุนเดิม + เงินลงทุนเพิ่ม",
      newAverageCostPerShare: "ราคาเฉลี่ยหลังลงทุนเพิ่ม",
      currentPortfolioValue: "มูลค่าตามราคาตลาดปัจจุบัน",
      profitLoss: "จากราคาตลาดปัจจุบัน",
      profitLossPercentage: "ผลตอบแทนจากการลงทุน",
    };
    return descriptions[key];
  };

  const getFieldUnit = (key: string) => {
    if (key.includes("Shares") || key.includes("Units")) return " หุ้น";
    if (key.includes("Percentage")) return "%";
    return " บาท / $";
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              คำนวณค่าเฉลี่ยหุ้น
            </h1>
            <p className="text-gray-400 text-lg">
              เครื่องมือคำนวณราคาเฉลี่ยของหุ้นเพื่อวางแผนการลงทุน
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    จำนวนหุ้นปัจจุบัน (หุ้น)
                  </label>
                  <TextField
                    placeholder="เช่น 100"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.currentStockUnits}
                    onChange={handleInputChange("currentStockUnits")}
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ราคาเฉลี่ยปัจจุบัน (บาท / $)
                  </label>
                  <TextField
                    placeholder="เช่น 50.00"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.averageCostPerShare}
                    onChange={handleInputChange("averageCostPerShare")}
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ราคาตลาดปัจจุบัน (บาท / $)
                  </label>
                  <TextField
                    placeholder="เช่น 45.00"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.currentMarketPrice}
                    onChange={handleInputChange("currentMarketPrice")}
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    จำนวนเงินลงทุนเพิ่ม (บาท / $)
                  </label>
                  <TextField
                    placeholder="เช่น 10,000"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.additionalInvestmentAmount}
                    onChange={handleInputChange("additionalInvestmentAmount")}
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
                    "คำนวณค่าเฉลี่ยหุ้น"
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
                  ผลการคำนวณ
                </h3>
                <div className="w-16 h-0.5 bg-gray-600 mx-auto"></div>
              </div>

              {/* Results Grid */}
              <div className="space-y-4">
                {Object.entries(result).map(([key, value]) => {
                  const isImportant =
                    key === "newAverageCostPerShare" ||
                    key === "currentPortfolioValue" ||
                    key === "profitLoss" ||
                    key === "profitLossPercentage";

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
                              key === "profitLoss" ||
                              key === "profitLossPercentage"
                                ? value >= 0
                                  ? "bg-green-400"
                                  : "bg-red-400"
                                : key === "newAverageCostPerShare"
                                ? "bg-blue-400"
                                : "bg-gray-500"
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
                          {key === "profitLoss" && (
                            <div
                              className={`text-sm mt-1 ${
                                value >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {value >= 0 ? "📈 กำไร" : "📉 ขาดทุน"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress bar for percentage */}
                      {key === "profitLossPercentage" && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                value >= 0 ? "bg-green-400" : "bg-red-400"
                              }`}
                              style={{
                                width: `${Math.min(Math.abs(value), 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
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

export default averageCostAverage;
