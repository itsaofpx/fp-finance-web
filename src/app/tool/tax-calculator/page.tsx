"use client";
import { useState } from "react";
import { TextField, Button, Alert, CircularProgress } from "@mui/material";
import FormulaDialog from "@/components/FormulaDialog";
import { useRouter } from "next/navigation";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";

export interface ITaxCalculationRequest {
  ticker?: string;
  costPerShare: number;
  numberOfShares: number;
  sellingPricePerShare: number;
}

export interface ITaxCalculationResponse {
  ticker?: string;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  taxRate: number;
  taxAmount: number;
  netProfitAfterTax: number;
}

const TaxCalculator = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ticker: "",
    costPerShare: "",
    numberOfShares: "",
    sellingPricePerShare: "",
  });
  const [result, setResult] = useState<ITaxCalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFormula, setOpenFormula] = useState(false);

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
    const { costPerShare, numberOfShares, sellingPricePerShare } = formData;

    if (!costPerShare || !numberOfShares || !sellingPricePerShare) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return false;
    }

    const cost = parseFloat(costPerShare);
    const shares = parseFloat(numberOfShares);
    const sellingPrice = parseFloat(sellingPricePerShare);

    if (cost <= 0 || shares <= 0 || sellingPrice <= 0) {
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
        ticker: formData.ticker.toUpperCase() || undefined,
        costPerShare: parseFloat(formData.costPerShare),
        numberOfShares: parseFloat(formData.numberOfShares),
        sellingPricePerShare: parseFloat(formData.sellingPricePerShare),
      };

      const response = await fetch(
        "http://localhost:3001/tool/tax-calculator",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

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
                title: "1. มูลค่าการซื้อ",
                formula: "Total Cost = Cost Per Share × Number of Shares",
                color: "blue",
                textColor: "text-blue-300",
              },
              {
                title: "2. มูลค่าการขาย",
                formula: "Total Revenue = Selling Price × Shares",
                color: "green",
                textColor: "text-green-300",
              },
              {
                title: "3. กำไรสุทธิ",
                formula: "Net Profit = Total Revenue - Total Cost",
                color: "purple",
                textColor: "text-purple-300",
              },
              {
                title: "4. ภาษี (15% ประเทศไทย)",
                formula: "Tax = Net Profit × 15%",
                color: "yellow",
                textColor: "text-yellow-300",
              },
              {
                title: "5. กำไรหลังภาษี",
                formula: "Profit After Tax = Net Profit - Tax",
                color: "orange",
                textColor: "text-orange-300",
              },
            ]}
            title="📐 สูตรคำนวณภาษี"
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
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              คำนวณภาษีหุ้น
            </h1>
            <p className="text-gray-400 text-lg">
              คำนวณภาษีจากการขายหุ้นต่างประเทศ (15%)
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
                วิธีการคำนวณภาษี
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">
                      ข้อมูลการซื้อ
                    </div>
                    <div className="text-gray-400">ราคาซื้อและจำนวนหุ้น</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">
                      ข้อมูลการขาย
                    </div>
                    <div className="text-gray-400">ราคาขายที่ต้องการ</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">ภาษี 15%</div>
                    <div className="text-gray-400">คำนวณภาษีจากกำไร</div>
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
                    📈 หุ้น (Ticker) - ไม่บังคับ
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
                    💰 ราคาซื้อต่อหุ้น
                  </label>
                  <TextField
                    placeholder="เช่น 20"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.costPerShare}
                    onChange={handleInputChange("costPerShare")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">USD</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📊 จำนวนหุ้น
                  </label>
                  <TextField
                    placeholder="เช่น 5.00"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.numberOfShares}
                    onChange={handleInputChange("numberOfShares")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">หุ้น</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💸 ราคาขายต่อหุ้น
                  </label>
                  <TextField
                    placeholder="เช่น 100"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.sellingPricePerShare}
                    onChange={handleInputChange("sellingPricePerShare")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">USD</span>,
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
                    "คำนวณภาษี"
                  )}
                </Button>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <div className="mt-8 bg-gray-750 rounded-xl p-6">
                <div className="text-center mb-6">
                  <span className="text-2xl font-bold text-blue-400">
                    ผลการคำนวณภาษี {result.ticker ? `- ${result.ticker}` : ""}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">ต้นทุนรวม</span>
                      <span className="font-bold text-blue-400">
                        ${result.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">รายได้รวม</span>
                      <span className="font-bold text-green-400">
                        ${result.totalRevenue.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">กำไรก่อนหักภาษี</span>
                      <span className="font-bold text-yellow-400">
                        ${result.totalProfit.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-orange-600 bg-orange-900/20">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">
                        ภาษี ({(result.taxRate * 100).toFixed(0)}%)
                      </span>
                      <span className="font-bold text-orange-400">
                        -${result.taxAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-green-600 bg-green-900/20">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-semibold">
                        กำไรสุทธิหลังหักภาษี
                      </span>
                      <span className="font-bold text-green-400 text-lg">
                        ${result.netProfitAfterTax.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profit Percentage Comparison */}
                <div className="mt-6 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800/30 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-400"
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
                    เปรียบเทียบอัตราผลตอบแทน
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before Tax */}
                    <div className="p-4 rounded-xl bg-yellow-900/20 border border-yellow-600/30">
                      <div className="text-center">
                        <div className="text-yellow-400 font-semibold mb-2">
                          ก่อนหักภาษี
                        </div>
                        <div className="text-3xl font-bold text-yellow-400">
                          {(
                            (result.totalProfit / result.totalCost) *
                            100
                          ).toFixed(2)}
                          %
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          กำไร ${result.totalProfit.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* After Tax */}
                    <div className="p-4 rounded-xl bg-green-900/20 border border-green-600/30">
                      <div className="text-center">
                        <div className="text-green-400 font-semibold mb-2">
                          หลังหักภาษี
                        </div>
                        <div className="text-3xl font-bold text-green-400">
                          {(
                            (result.netProfitAfterTax / result.totalCost) *
                            100
                          ).toFixed(2)}
                          %
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          กำไร ${result.netProfitAfterTax.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Summary */}
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">ผลกระทบจากภาษี</span>
                      <span className="font-bold text-orange-400">
                        -
                        {(
                          (result.totalProfit / result.totalCost) * 100 -
                          (result.netProfitAfterTax / result.totalCost) * 100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      ผลตอบแทนลดลง ${result.taxAmount.toFixed(2)} จากภาษี 15%
                    </div>
                  </div>
                </div>

                {/* Tax Info */}
                <div className="mt-6 p-4 bg-blue-900/10 border border-blue-800/30 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
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
                    <div>
                      <h4 className="text-blue-400 font-semibold mb-1">
                        หมายเหตุภาษี
                      </h4>
                      <p className="text-gray-300 text-sm">
                        ภาษีจากการขายหุ้นต่างประเทศสำหรับคนไทย คิดที่ 15%
                        จากกำไรที่ได้รับ (ถ้ามีกำไร)
                      </p>
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

export default TaxCalculator;
