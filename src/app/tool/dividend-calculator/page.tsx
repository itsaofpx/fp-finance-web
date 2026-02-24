"use client";
import {
  Button,
  TextField,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";
import FormulaDialog from "@/components/FormulaDialog";

interface IDividendResult {
  ticker: string;
  dividendGoal: number;
  numberOfSharesNeeded: number;
  totalInvestmentNeeded: number;
  monthlyDividendIncome: number;
  quarterlyDividendIncome: number;
  annualDividendIncome: number;
}

const USD_TO_THB_RATE = 32.0;

const DividendCalculator = () => {
  const router = useRouter();
  const [isUSStock, setIsUSStock] = useState(false);
  const [formData, setFormData] = useState({
    ticker: "",
    dividendGoal: "",
    currentSharePrice: "",
    dividendYield: "",
  });

  const [result, setResult] = useState<IDividendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFormula, setOpenFormula] = useState(false);

  const handleStockTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsUSStock(event.target.checked);
    setFormData({
      ticker: "",
      dividendGoal: "",
      currentSharePrice: "",
      dividendYield: "",
    });
    setResult(null);
    setError(null);
  };

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
    const { ticker, dividendGoal, currentSharePrice, dividendYield } = formData;

    if (!ticker || !dividendGoal || !currentSharePrice || !dividendYield) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return false;
    }

    if (
      parseFloat(dividendGoal) <= 0 ||
      parseFloat(currentSharePrice) <= 0 ||
      parseFloat(dividendYield) <= 0
    ) {
      setError("กรุณากรอกตัวเลขที่มากกว่า 0");
      return false;
    }

    if (parseFloat(dividendYield) > 100) {
      setError("เปอร์เซ็นต์เงินปันผลไม่สามารถเกิน 100% ได้");
      return false;
    }

    return true;
  };

  const handleCalculate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        isUSStock,
        ticker: formData.ticker,
        dividendGoal: parseFloat(formData.dividendGoal),
        currentSharePrice: parseFloat(formData.currentSharePrice),
        dividendYield: parseFloat(formData.dividendYield),
      };

      const response = await fetch(
        "http://localhost:3001/tool/dividend-calculator",
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

      const data: IDividendResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error calculating dividend:", err);
      setError("เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, isUSD: boolean) => {
    if (isUSD) {
      return {
        usd: amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        thb: (amount * USD_TO_THB_RATE).toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      };
    }
    return {
      thb: amount.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
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
                title: "1. หุ้นที่ต้องการ",
                formula: "Shares Needed = Dividend Goal ÷ Annual Dividend Per Share",
                color: "blue",
                textColor: "text-blue-300",
              },
              {
                title: "2. เงินลงทุนที่ต้องการ",
                formula: "Investment Needed = Shares × Current Share Price",
                color: "green",
                textColor: "text-green-300",
              },
              {
                title: "3. เงินปันผลรายเดือน",
                formula: "Monthly Income = (Dividend Per Share × Shares) ÷ 12",
                color: "purple",
                textColor: "text-purple-300",
              },
              {
                title: "4. เงินปันผลรายปี",
                formula: "Annual Income = Dividend Per Share × Shares",
                color: "yellow",
                textColor: "text-yellow-300",
              },
            ]}
            title="📐 สูตรคำนวณปันผล"
          />

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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              คำนวณเป้าหมายเงินปันผล
            </h1>
            <p className="text-gray-400 text-lg">
              วางแผนการลงทุนเพื่อรับเงินปันผล
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
                    <div className="text-gray-200 font-medium">
                      เป้าหมายเงินปันผล
                    </div>
                    <div className="text-gray-400">
                      จำนวนเงินปันผลที่ต้องการต่อเดือน
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">
                      ข้อมูลหุ้นที่เลือก
                    </div>
                    <div className="text-gray-400">
                      ราคาหุ้นและเปอร์เซ็นต์เงินปันผล
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">ผลการคำนวณ</div>
                    <div className="text-gray-400">
                      จำนวนหุ้นและเงินลงทุนที่ต้องใช้
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Type Switch */}
            <div className="mb-6 flex justify-center items-center space-x-4">
              <Typography
                className={`text-sm ${
                  !isUSStock ? "text-blue-400" : "text-gray-400"
                }`}
              >
                หุ้นไทย
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isUSStock}
                    onChange={handleStockTypeChange}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#0077E7",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#0077E7",
                        },
                    }}
                  />
                }
                label=""
              />
              <Typography
                className={`text-sm ${
                  isUSStock ? "text-blue-400" : "text-gray-400"
                }`}
              >
                หุ้น US
              </Typography>
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
                    📈 {isUSStock ? "US Ticker" : "หุ้นไทย"}
                  </label>
                  <TextField
                    placeholder={
                      isUSStock ? "เช่น AAPL, MSFT" : "เช่น PTT, AOT"
                    }
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
                    💰 เป้าหมายเงินปันผลต่อเดือน
                  </label>
                  <TextField
                    placeholder="เช่น 20000"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.dividendGoal}
                    onChange={handleInputChange("dividendGoal")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <span className="text-gray-400">
                          {isUSStock ? "USD" : "บาท"}
                        </span>
                      ),
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💵 ราคาหุ้นปัจจุบัน
                  </label>
                  <TextField
                    placeholder={isUSStock ? "เช่น 150" : "เช่น 35"}
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.currentSharePrice}
                    onChange={handleInputChange("currentSharePrice")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <span className="text-gray-400">
                          {isUSStock ? "USD" : "บาท"}
                        </span>
                      ),
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📊 เปอร์เซ็นต์เงินปันผลต่อปี
                  </label>
                  <TextField
                    placeholder="เช่น 10"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.dividendYield}
                    onChange={handleInputChange("dividendYield")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">%</span>,
                    }}
                    sx={textFieldStyle}
                  />
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
                  "คำนวณเป้าหมาย"
                )}
              </Button>
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
                      <span className="text-gray-300">
                        จำนวนหุ้นที่ต้องซื้อ
                      </span>
                      <span className="font-bold text-blue-400">
                        {result.numberOfSharesNeeded.toLocaleString()} หุ้น
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">เงินลงทุนที่ต้องใช้</span>
                      <div className="text-right">
                        {isUSStock ? (
                          <>
                            <div className="font-bold text-green-400">
                              {
                                formatCurrency(
                                  result.totalInvestmentNeeded,
                                  true
                                ).usd
                              }{" "}
                              USD
                            </div>
                            <div className="text-sm text-gray-400">
                              (
                              {
                                formatCurrency(
                                  result.totalInvestmentNeeded,
                                  true
                                ).thb
                              }{" "}
                              บาท)
                            </div>
                          </>
                        ) : (
                          <span className="font-bold text-green-400">
                            {
                              formatCurrency(
                                result.totalInvestmentNeeded,
                                false
                              ).thb
                            }{" "}
                            บาท
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">เงินปันผลต่อเดือน</span>
                      <div className="text-right">
                        {isUSStock ? (
                          <>
                            <div className="font-bold text-yellow-400">
                              {
                                formatCurrency(
                                  result.monthlyDividendIncome,
                                  true
                                ).usd
                              }{" "}
                              USD
                            </div>
                            <div className="text-sm text-gray-400">
                              (
                              {
                                formatCurrency(
                                  result.monthlyDividendIncome,
                                  true
                                ).thb
                              }{" "}
                              บาท)
                            </div>
                          </>
                        ) : (
                          <span className="font-bold text-yellow-400">
                            {
                              formatCurrency(
                                result.monthlyDividendIncome,
                                false
                              ).thb
                            }{" "}
                            บาท
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">เงินปันผลต่อไตรมาส</span>
                      <div className="text-right">
                        {isUSStock ? (
                          <>
                            <div className="font-bold text-orange-400">
                              {
                                formatCurrency(
                                  result.quarterlyDividendIncome,
                                  true
                                ).usd
                              }{" "}
                              USD
                            </div>
                            <div className="text-sm text-gray-400">
                              (
                              {
                                formatCurrency(
                                  result.quarterlyDividendIncome,
                                  true
                                ).thb
                              }{" "}
                              บาท)
                            </div>
                          </>
                        ) : (
                          <span className="font-bold text-orange-400">
                            {
                              formatCurrency(
                                result.quarterlyDividendIncome,
                                false
                              ).thb
                            }{" "}
                            บาท
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">เงินปันผลต่อปี</span>
                      <div className="text-right">
                        {isUSStock ? (
                          <>
                            <div className="font-bold text-purple-400">
                              {
                                formatCurrency(
                                  result.annualDividendIncome,
                                  true
                                ).usd
                              }{" "}
                              USD
                            </div>
                            <div className="text-sm text-gray-400">
                              (
                              {
                                formatCurrency(
                                  result.annualDividendIncome,
                                  true
                                ).thb
                              }{" "}
                              บาท)
                            </div>
                          </>
                        ) : (
                          <span className="font-bold text-purple-400">
                            {
                              formatCurrency(result.annualDividendIncome, false)
                                .thb
                            }{" "}
                            บาท
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {isUSStock && (
                  <div className="mt-4 text-center text-sm text-white before:content-['*'] before:text-red-400 before:mr-1">
                    อัตราแลกเปลี่ยน: 1 USD = {USD_TO_THB_RATE} บาท
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <DisclaimerFooter />
    </div>
  );
};

export default DividendCalculator;
