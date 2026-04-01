"use client";

import {
  Button,
  TextField,
  Alert,
  CircularProgress,
  Autocomplete,
  Box,
} from "@mui/material";
import FormulaDialog from "@/components/FormulaDialog";
import { useState, useEffect } from "react";
import axios from "axios";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";
import { useRouter } from "next/navigation";

/** ── Interfaces ── */
export interface ISupportLevelResponse {
  firstEntry: number;
  secondEntry: number;
  thirdEntry: number;
  fourthEntry: number;
}

interface TickerData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector?: string;
}

/** ── LocalStorage Utility ── */
function getTickersFromLocalStorage(): TickerData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("sp500_stocks_cache");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const source: Record<string, unknown> =
      parsed && typeof parsed === "object" && "data" in parsed
        ? (parsed as { data: Record<string, unknown> }).data
        : parsed;

    return Object.values(source)
      .filter(
        (v): v is Record<string, unknown> =>
          v !== null && typeof v === "object",
      )
      .map((item) => ({
        ticker: String(item.ticker ?? ""),
        name: String(item.name ?? ""),
        price: Number(item.price ?? 0),
        change: Number(item.change ?? 0),
        changePercent: Number(item.changePercent ?? 0),
        sector: item.sector ? String(item.sector) : undefined,
      }))
      .filter((t) => t.ticker && t.price > 0);
  } catch {
    return [];
  }
}

/** ── Styles ── */
const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#374151",
    borderRadius: "12px",
    height: "56px",
    "& fieldset": { borderColor: "#4B5563" },
    "&:hover fieldset": { borderColor: "#6B7280" },
    "&.Mui-focused fieldset": { borderColor: "#9CA3AF", borderWidth: "2px" },
  },
  "& .MuiInputBase-input": {
    color: "#F9FAFB",
    fontSize: "16px",
    "&::placeholder": { color: "#9CA3AF" },
  },
};

const autocompleteInputStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#374151",
    borderRadius: "12px",
    minHeight: "56px",
    padding: "0 14px !important",
    "& fieldset": { borderColor: "#4B5563" },
    "&:hover fieldset": { borderColor: "#6B7280" },
    "&.Mui-focused fieldset": { borderColor: "#9CA3AF", borderWidth: "2px" },
  },
  "& .MuiInputBase-input": {
    color: "#F9FAFB",
    fontSize: "16px",
    padding: "14px 0 !important",
    "&::placeholder": { color: "#9CA3AF" },
  },
  "& .MuiAutocomplete-endAdornment .MuiSvgIcon-root": { color: "#9CA3AF" },
};

const SupportLevelCalculator = () => {
  const router = useRouter();

  // Form States
  const [formData, setFormData] = useState({ currentPrice: "", option: "0" });
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<TickerData | null>(null);

  // UI States
  const [result, setResult] = useState<ISupportLevelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFormula, setOpenFormula] = useState(false);

  const options = [
    { value: "0", label: "ปกติ" },
    { value: "1", label: "ตื้น" },
    { value: "2", label: "ลึก" },
    {
      value: "3",
      label: "Fibonacci",
      additionalInfo:
        "Fibonacci Retracement ใช้ระดับการถอยกลับตามหลักคณิตศาสตร์ของ Fibonacci",
    },
    {
      value: "4",
      label: "Golden Ratio",
      additionalInfo: "Golden Ratio ใช้อัตราส่วนทองคำ (φ ≈ 1.618) ในการคำนวณ",
    },
  ];

  useEffect(() => {
    setTickers(getTickersFromLocalStorage());
  }, []);

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
      if (error) setError(null);
    };

  const handleTickerSelect = (_: any, newValue: TickerData | null) => {
    setSelectedTicker(newValue);
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        currentPrice: newValue.price.toString(),
      }));
    }
  };

  const validateForm = () => {
    if (!formData.currentPrice || parseFloat(formData.currentPrice) <= 0) {
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
      );
      setResult(response.data);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 font-sans text-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          {/* ── Header Actions ── */}
          <div className="p-6 pb-0 flex justify-between">
            <button
              onClick={() => router.push("/tool")}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-gray-700 group-hover:bg-gray-600">
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
              onClick={() => setOpenFormula(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              สูตรการคำนวณ
            </button>
          </div>

          <FormulaDialog
            open={openFormula}
            onClose={() => setOpenFormula(false)}
            title="📐 สูตร Support Levels"
            formulas={[
              {
                title: "Normal",
                formula: "0.382 / 0.618 Ratio",
                color: "blue",
                textColor: "text-blue-300",
              },
              {
                title: "Fibonacci",
                formula: "23.6%, 38.2%, 61.8%",
                color: "green",
                textColor: "text-green-300",
              },
            ]}
          />

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
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              คำนวณแนวรับ 4 ไม้
            </h1>
            <p className="text-gray-400 text-lg">
              ค้นหาหุ้นหรือระบุราคาเพื่อหาจุดเข้าซื้อ
            </p>
          </div>

          <div className="p-8 pt-0">
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 4,
                  bgcolor: "rgba(220, 38, 38, 0.1)",
                  color: "#FCA5A5",
                  borderRadius: "12px",
                }}
              >
                {error}
              </Alert>
            )}

            <div className="space-y-6">
              {/* ── Ticker Autocomplete Section ── */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🔍 ค้นหาหุ้น (Ticker)
                  {tickers.length === 0 && (
                    <span className="ml-2 text-xs text-yellow-400 font-normal">
                      (ไม่พบข้อมูล cache)
                    </span>
                  )}
                </label>
                <Autocomplete
                  options={tickers}
                  getOptionLabel={(option) =>
                    `${option.ticker} – ${option.name}`
                  }
                  value={selectedTicker}
                  onChange={handleTickerSelect}
                  disabled={loading || tickers.length === 0}
                  noOptionsText={
                    <span style={{ color: "#9CA3AF" }}>ไม่พบหุ้น</span>
                  }
                  filterOptions={(options, { inputValue }) => {
                    const q = inputValue.trim().toLowerCase();
                    if (!q) return options.slice(0, 50);
                    return options.filter(
                      (o) =>
                        o.ticker.toLowerCase().startsWith(q) ||
                        o.name.toLowerCase().includes(q),
                    );
                  }}
                  renderOption={(props, option) => {
                    const isUp = option.changePercent >= 0;
                    return (
                      <Box
                        component="li"
                        {...props}
                        sx={{
                          backgroundColor: "#1F2937 !important",
                          "&:hover": { backgroundColor: "#374151 !important" },
                          py: 1.5,
                          px: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <span
                          style={{
                            minWidth: 60,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "#0077E7",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 13,
                            textAlign: "center",
                          }}
                        >
                          {option.ticker}
                        </span>
                        <span
                          style={{
                            color: "#E5E7EB",
                            fontSize: 14,
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {option.name}
                        </span>
                        <span
                          style={{
                            color: "#F9FAFB",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          $
                          {option.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <span
                          style={{
                            color: isUp ? "#34D399" : "#F87171",
                            fontSize: 12,
                          }}
                        >
                          {isUp ? "▲" : "▼"}{" "}
                          {Math.abs(option.changePercent).toFixed(2)}%
                        </span>
                      </Box>
                    );
                  }}
                  PaperComponent={({ children, ...rest }) => (
                    <Box
                      {...rest}
                      sx={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                        mt: 0.5,
                        overflow: "hidden",
                        "& .MuiAutocomplete-listbox": {
                          padding: 0,
                          maxHeight: 320,
                          "&::-webkit-scrollbar": { width: 6 },
                          "&::-webkit-scrollbar-thumb": {
                            background: "#4B5563",
                            borderRadius: 3,
                          },
                        },
                      }}
                    >
                      {children}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="เช่น AAPL, NVDA, TSLA …"
                      variant="outlined"
                      sx={autocompleteInputStyle}
                    />
                  )}
                />

                {/* Selected Ticker Info Card */}
                {selectedTicker && (
                  <div className="mt-2 p-3 rounded-xl bg-gray-700/50 border border-gray-600 flex items-center gap-4 flex-wrap">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                      {selectedTicker.ticker}
                    </span>
                    <span className="text-gray-300 text-sm flex-1">
                      {selectedTicker.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-100 font-semibold text-sm">
                        $
                        {selectedTicker.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span
                        className={`text-xs font-medium ${selectedTicker.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {selectedTicker.changePercent >= 0 ? "▲" : "▼"}{" "}
                        {Math.abs(selectedTicker.changePercent).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Price Input ── */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  ราคาปัจจุบัน (บาท)
                </label>
                <TextField
                  fullWidth
                  type="number"
                  value={formData.currentPrice}
                  onChange={handleInputChange("currentPrice")}
                  disabled={loading}
                  sx={textFieldStyle}
                  placeholder="หรือระบุราคาเองที่นี่..."
                />
              </div>

              {/* ── Support Patterns ── */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  รูปแบบแนวรับ
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {options.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() =>
                        setFormData({ ...formData, option: opt.value })
                      }
                      className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${formData.option === opt.value ? "bg-gray-700 border-blue-500" : "bg-gray-800 border-gray-700 hover:border-gray-600"}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.option === opt.value ? "border-blue-500 bg-blue-500" : "border-gray-500"}`}
                        >
                          {formData.option === opt.value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className={`font-medium ${formData.option === opt.value ? "text-blue-400" : "text-gray-200"}`}
                        >
                          {opt.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                fullWidth
                variant="contained"
                onClick={handleCalculate}
                disabled={loading}
                sx={{
                  bgcolor: "#0077E7",
                  py: 2,
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "16px",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#023E8A" },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "คำนวณแนวรับ"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Results Area (Updated with 1, 2, 3, 4) ── */}
        {result && (
          <div className="mt-8 bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-100 text-center mb-6">
              ผลการคำนวณแนวรับ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "firstEntry", num: 1 },
                { key: "secondEntry", num: 2 },
                { key: "thirdEntry", num: 3 },
                { key: "fourthEntry", num: 4 },
              ].map(({ key, num }) => (
                <div
                  key={key}
                  className="p-5 rounded-xl bg-gray-700 border border-gray-600 flex justify-between items-center hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                      {num}
                    </div>
                    <span className="text-gray-300 font-medium">
                      แนวรับที่ {num}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    {result[key as keyof ISupportLevelResponse].toLocaleString(
                      "th-TH",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}{" "}
                    <span className="text-sm text-gray-400 ml-1">บาท</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <DisclaimerFooter />
    </div>
  );
};

export default SupportLevelCalculator;
