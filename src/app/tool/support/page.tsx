"use client"
import { Button, TextField, Alert, CircularProgress } from "@mui/material";
import FormulaDialog from "@/components/FormulaDialog";
import { useState } from "react";
import axios from "axios";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";
import { useRouter } from "next/navigation";

export interface ISupportLevelResponse {
  firstEntry: number;
  secondEntry: number;
  thirdEntry: number;
  fourthEntry: number;
}

const SupportLevelCalculator = () => {
  const [formData, setFormData] = useState({
    currentPrice: "",
    option: "0",
  });
  const router = useRouter();

  const [result, setResult] = useState<ISupportLevelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFormula, setOpenFormula] = useState(false);

  const options = [
    {
      value: "0",
      label: "ปกติ",
    },
    {
      value: "1",
      label: "ตื้น",
    },
    {
      value: "2",
      label: "ลึก",
    },
    {
      value: "3",
      label: "Fibonacci",
      additionalInfo:
        "Fibonacci Retracement ใช้ระดับการถอยกลับตามหลักคณิตศาสตร์ของ Fibonacci ในการคำนวณแนวรับ",
    },
    {
      value: "4",
      label: "Golden Ratio",
      additionalInfo:
        "Golden Ratio ใช้อัตราส่วนทองคำ (φ ≈ 1.618) ในการคำนวณระยะห่างของแนวรับแต่ละระดับ",
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
    const { currentPrice } = formData;

    if (!currentPrice) {
      setError("กรุณากรอกราคาปัจจุบัน");
      return false;
    }

    if (parseFloat(currentPrice) <= 0) {
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
        currentPrice: parseFloat(formData.currentPrice),
        option: parseInt(formData.option),
      };

      const response = await axios.post(
        "http://localhost:3001/tool/support",
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
      console.error("Error calculating support levels:", err);
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
                title: "1. วิธีธรรมชาติ (Normal)",
                formula: "Support = Low + (High - Low) × 0.382 / 0.618",
                color: "blue",
                textColor: "text-blue-300",
              },
              {
                title: "2. Fibonacci Retracement",
                formula: "Support = High - (High - Low) × 0.236 / 0.382 / 0.618",
                color: "green",
                textColor: "text-green-300",
              },
              {
                title: "3. Golden Ratio",
                formula: "Golden = High - (High - Low) × 0.618",
                color: "purple",
                textColor: "text-purple-300",
              },
              {
                title: "4. Shallow Support",
                formula: "Shallow = Low + (High - Low) × 0.236",
                color: "yellow",
                textColor: "text-yellow-300",
              },
              {
                title: "5. Deep Support",
                formula: "Deep = Low + (High - Low) × 0.618",
                color: "orange",
                textColor: "text-orange-300",
              },
            ]}
            title="📐 สูตร Support Levels"
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
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              คำนวณแนวรับ 4 ไม้
            </h1>
            <p className="text-gray-400 text-lg">
              เครื่องมือคำนวณแนวรับสำหรับการเข้าซื้อ 4 ครั้ง
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
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ราคาปัจจุบัน (บาท)
                  </label>
                  <TextField
                    placeholder="เช่น 100.00"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.currentPrice}
                    onChange={handleInputChange("currentPrice")}
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
                    รูปแบบแนวรับ
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {options.map((option) => (
                      <div
                        key={option.value}
                        onClick={() =>
                          setFormData({ ...formData, option: option.value })
                        }
                        className={`cursor-pointer rounded-xl transition-all duration-200 ${
                          formData.option === option.value
                            ? "bg-gray-700 border-2 border-blue-500"
                            : "bg-gray-800 border border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-center space-x-4">
                            {/* Radio Button */}
                            <div
                              className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                formData.option === option.value
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-500"
                              }`}
                            >
                              {formData.option === option.value && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`font-medium text-base ${
                                    formData.option === option.value
                                      ? "text-blue-400"
                                      : "text-gray-200"
                                  }`}
                                >
                                  {option.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Information Icon for Fibonacci and Golden Ratio */}
                        {(option.value === "3" || option.value === "4") &&
                          option.additionalInfo && (
                            <div className="px-4 pb-3 -mt-1">
                              <div
                                className={`p-2 rounded-lg ${
                                  formData.option === option.value
                                    ? "bg-gray-600"
                                    : "bg-gray-700"
                                }`}
                              >
                                <div className="flex items-start space-x-2">
                                  <svg
                                    className="w-5 h-5 text-blue-400 mt-0.5"
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
                                  <p className="text-xs text-gray-400 leading-relaxed">
                                    {option.additionalInfo}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
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
                    "คำนวณแนวรับ"
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-2">
                  ผลการคำนวณแนวรับ
                </h3>
                <div className="w-16 h-0.5 bg-gray-600 mx-auto"></div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "firstEntry", label: "แนวรับไม้ที่ 1" },
                  { key: "secondEntry", label: "แนวรับไม้ที่ 2" },
                  { key: "thirdEntry", label: "แนวรับไม้ที่ 3" },
                  { key: "fourthEntry", label: "แนวรับไม้ที่ 4" },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className="p-5 rounded-xl bg-gray-700 border border-gray-600 transition-all duration-200 hover:border-gray-500"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <div className="text-gray-300 font-medium">{label}</div>
                      </div>
                      <div className="text-xl font-bold text-gray-100">
                        {result[
                          key as keyof ISupportLevelResponse
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
            </div>
          </div>
        )}
      </div>
      <DisclaimerFooter />
    </div>
  );
};

export default SupportLevelCalculator;
