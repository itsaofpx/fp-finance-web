"use client";
import { useState } from "react";
import { TextField, Button, Alert, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";

export interface IStockProfitCalculationRequest {
  ticker: string;
  currentSharePrice: number;
  investmentAmount: number;
  targetSharePrice: number;
}

export interface IStockProfitCalculationResponse {
  ticker: string;
  purchasedShares: number;
  investmentAmount: number;
  totalInvestmentValue: number;
  potentialProfit: number;
  profitPercentage: number;
}

const StockProfitCalculator = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ticker: "",
    currentSharePrice: "",
    investmentAmount: "",
    targetSharePrice: "",
  });
  const [result, setResult] = useState<IStockProfitCalculationResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
      setError(null);
    };

  const handleBackClick = () => {
    router.push("/tool");
  };

  const validateForm = () => {
    const { ticker, currentSharePrice, investmentAmount, targetSharePrice } =
      formData;

    if (!currentSharePrice || !investmentAmount || !targetSharePrice) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return false;
    }

    const currentPrice = parseFloat(currentSharePrice);
    const investAmount = parseFloat(investmentAmount);
    const targetPrice = parseFloat(targetSharePrice);

    if (currentPrice <= 0 || investAmount <= 0 || targetPrice <= 0) {
      setError("กรุณากรอกตัวเลขที่มากกว่า 0");
      return false;
    }

    if (targetPrice <= currentPrice) {
      setError("ราคาเป้าหมายต้องสูงกว่าราคาปัจจุบัน");
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
        ticker: formData.ticker.toUpperCase(),
        currentSharePrice: parseFloat(formData.currentSharePrice),
        investmentAmount: parseFloat(formData.investmentAmount),
        targetSharePrice: parseFloat(formData.targetSharePrice),
      };

      const response = await fetch("http://localhost:3001/tool/profit-target", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Calculation error:", err);
      setError("เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
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
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              คำนวณผลกำไรหุ้น
            </h1>
            <p className="text-gray-400 text-lg">
              ประเมินศักยภาพการลงทุนของคุณ
            </p>
          </div>

          <div className="p-8 pt-0">
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
                วิธีการคำนวณ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">ข้อมูลหุ้น</div>
                    <div className="text-gray-400">ชื่อหุ้นและราคาปัจจุบัน</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">เงินลงทุน</div>
                    <div className="text-gray-400">
                      จำนวนเงินที่ต้องการลงทุน
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">เป้าหมาย</div>
                    <div className="text-gray-400">
                      ราคาเป้าหมายที่ต้องการขาย
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
                <div className="space-y-2 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📈 หุ้น (Ticker)
                  </label>
                  <TextField
                    placeholder="เช่น AAPL, NVDA"
                    variant="outlined"
                    fullWidth
                    value={formData.ticker}
                    onChange={handleInputChange("ticker")}
                    disabled={loading}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💰 ราคาหุ้นปัจจุบัน
                  </label>
                  <TextField
                    placeholder="เช่น 150"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.currentSharePrice}
                    onChange={handleInputChange("currentSharePrice")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">บาท</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💵 เงินลงทุน
                  </label>
                  <TextField
                    placeholder="เช่น 10000"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.investmentAmount}
                    onChange={handleInputChange("investmentAmount")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">บาท</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🎯 ราคาเป้าหมาย
                  </label>
                  <TextField
                    placeholder="เช่น 210"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.targetSharePrice}
                    onChange={handleInputChange("targetSharePrice")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">บาท</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>
              </div>

              {/* Calculate Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
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
                    "คำนวณผลกำไร"
                  )}
                </Button>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <div className="mt-8 bg-gray-750 rounded-xl p-6">
                <div className="text-center mb-6">
                  <span className="text-2xl font-bold text-blue-400">
                    ชื่อหุ้น (Ticker) :{" "}
                    {result.ticker ? result.ticker : "ไม่ระบุ"}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">จำนวนหุ้นที่ซื้อได้</span>
                      <span className="font-bold text-blue-400">
                        {result.purchasedShares.toFixed(4)} หุ้น
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">มูลค่าการลงทุนรวม</span>
                      <span className="font-bold text-green-400">
                        {result.totalInvestmentValue.toLocaleString()} บาท
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">กำไรที่คาดหวัง</span>
                      <span className="font-bold text-yellow-400">
                        {result.potentialProfit.toLocaleString()} บาท
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">อัตราผลตอบแทน</span>
                      <span className="font-bold text-purple-400">
                        {result.profitPercentage.toFixed(2)}%
                      </span>
                    </div>
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

export default StockProfitCalculator;
