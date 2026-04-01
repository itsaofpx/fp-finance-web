"use client";
import {
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Autocomplete,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";
import CloseIcon from "@mui/icons-material/Close";

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

interface TickerData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector?: string;
}
function getTickersFromLocalStorage(): TickerData[] {
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

const AverageCostCalculator = () => {
  const router = useRouter();

  // Load tickers once on first render
  const tickers = useMemo(() => getTickersFromLocalStorage(), []);

  const [selectedTicker, setSelectedTicker] = useState<TickerData | null>(null);
  const [formData, setFormData] = useState({
    currentStockUnits: "",
    averageCostPerShare: "",
    currentMarketPrice: "",
    additionalInvestmentAmount: "",
  });
  const [result, setResult] = useState<IAverageCostInvestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFormula, setOpenFormula] = useState(false);

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
      if (error) setError(null);
    };

  const handleTickerSelect = (_: unknown, value: TickerData | null) => {
    setSelectedTicker(value);
    if (value) {
      setFormData((prev) => ({
        ...prev,
        currentMarketPrice: value.price.toFixed(2),
      }));
      if (error) setError(null);
    }
  };

  const handleBackClick = () => router.push("/tool");
  const handleFormulaClick = () => setOpenFormula(!openFormula);

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
          formData.additionalInvestmentAmount,
        ),
      };
      const response = await fetch("http://localhost:3001/tool/average-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error calculating average cost:", err);
      setError("เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Display helpers
  // -------------------------------------------------------------------------
  const getValueColor = (key: string, value: number) => {
    if (key === "profitLoss" || key === "profitLossPercentage") {
      return value >= 0 ? "text-green-400" : "text-red-400";
    }
    return "text-gray-100";
  };

  const getFieldLabel = (key: string) => {
    const labels: Record<string, string> = {
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
    const descriptions: Record<string, string> = {
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
    return " บาท";
  };
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

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
          {/* ── Header row ── */}
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
              onClick={handleFormulaClick}
              className="inline-flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <span className="font-medium">สูตรการคำนวณ</span>
            </button>
          </div>

          {/* ── Formula Dialog ── */}
          <Dialog
            open={openFormula}
            onClose={() => setOpenFormula(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: "#1F2937",
                backgroundImage: "none",
                color: "#E5E7EB",
                borderRadius: "12px",
                border: "1px solid #374151",
              },
            }}
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #374151",
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              📐 สูตรการคำนวณ
              <IconButton
                onClick={() => setOpenFormula(false)}
                sx={{ color: "#9CA3AF" }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <div className="space-y-4 text-sm">
                {[
                  {
                    color: "blue",
                    label: "1. มูลค่าการลงทุนเดิม",
                    formula: "จำนวนหุ้นปัจจุบัน × ราคาเฉลี่ยปัจจุบัน",
                  },
                  {
                    color: "green",
                    label: "2. หุ้นที่ซื้อเพิ่ม",
                    formula: "เงินลงทุนเพิ่ม ÷ ราคาตลาดปัจจุบัน",
                  },
                  {
                    color: "purple",
                    label: "3. จำนวนหุ้นรวม",
                    formula: "หุ้นเดิม + หุ้นที่ซื้อเพิ่ม",
                  },
                  {
                    color: "yellow",
                    label: "4. มูลค่าการลงทุนรวม",
                    formula: "มูลค่าการลงทุนเดิม + เงินลงทุนเพิ่ม",
                  },
                  {
                    color: "orange",
                    label: "5. ราคาเฉลี่ยใหม่ต่อหุ้น",
                    formula: "มูลค่าการลงทุนรวม ÷ จำนวนหุ้นรวม",
                  },
                  {
                    color: "red",
                    label: "6. มูลค่าพอร์ตปัจจุบัน",
                    formula: "ราคาตลาดปัจจุบัน × จำนวนหุ้นรวม",
                  },
                  {
                    color: "emerald",
                    label: "7. กำไร/ขาดทุน",
                    formula:
                      "(ราคาตลาดปัจจุบัน × จำนวนหุ้นรวม) − มูลค่าการลงทุนรวม",
                  },
                  {
                    color: "pink",
                    label: "8. เปอร์เซ็นต์กำไร/ขาดทุน",
                    formula: "(กำไร/ขาดทุน ÷ มูลค่าการลงทุนรวม) × 100",
                  },
                ].map(({ color, label, formula }) => (
                  <div
                    key={label}
                    className={`p-3 rounded-lg bg-${color}-900/20 border border-${color}-700/30`}
                  >
                    <div className={`font-semibold text-${color}-300 mb-1`}>
                      {label}
                    </div>
                    <div className="text-gray-300 font-mono">{formula}</div>
                  </div>
                ))}
              </div>
            </DialogContent>
            <DialogActions sx={{ borderTop: "1px solid #374151", p: 2 }}>
              <Button
                onClick={() => setOpenFormula(false)}
                sx={{
                  color: "#E5E7EB",
                  "&:hover": { backgroundColor: "rgba(75, 85, 99, 0.3)" },
                }}
              >
                ปิด
              </Button>
            </DialogActions>
          </Dialog>

          {/* ── Page title ── */}
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
            {/* ── How it works ── */}
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
                {[
                  {
                    num: 1,
                    color: "bg-blue-600",
                    title: "ข้อมูลปัจจุบัน",
                    sub: "จำนวนหุ้นและราคาเฉลี่ย",
                  },
                  {
                    num: 2,
                    color: "bg-green-600",
                    title: "ข้อมูลตลาด",
                    sub: "ราคาตลาดและเงินลงทุนเพิ่ม",
                  },
                  {
                    num: 3,
                    color: "bg-yellow-600",
                    title: "ผลลัพธ์",
                    sub: "ราคาเฉลี่ยใหม่และกำไร/ขาดทุน",
                  },
                ].map(({ num, color, title, sub }) => (
                  <div key={num} className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
                    >
                      {num}
                    </div>
                    <div>
                      <div className="text-gray-200 font-medium">{title}</div>
                      <div className="text-gray-400">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Error ── */}
            {error && (
              <div className="mb-6">
                <Alert
                  severity="error"
                  sx={{
                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                    color: "#FCA5A5",
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                    borderRadius: "12px",
                    "& .MuiAlert-icon": { color: "#FCA5A5" },
                  }}
                >
                  {error}
                </Alert>
              </div>
            )}

            {/* ── Form ── */}
            <div className="space-y-6">
              {/* ── Ticker Autocomplete (full width) ── */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🔍 ค้นหาหุ้น (Ticker)
                  {tickers.length === 0 && (
                    <span className="ml-2 text-xs text-yellow-400 font-normal">
                      (ไม่พบข้อมูลใน localStorage – พิมพ์ราคาเองด้านล่าง)
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
                    if (!q) return options.slice(0, 50); // cap initial list
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
                          "&.Mui-focused": {
                            backgroundColor: "#374151 !important",
                          },
                          py: 1.5,
                          px: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        {/* Ticker badge */}
                        <span
                          style={{
                            minWidth: 60,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "#0077E7",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: 0.5,
                            textAlign: "center",
                          }}
                        >
                          {option.ticker}
                        </span>

                        {/* Name */}
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

                        {/* Price + change */}
                        <span
                          style={{
                            color: "#F9FAFB",
                            fontSize: 13,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          $
                          {option.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span
                          style={{
                            color: isUp ? "#34D399" : "#F87171",
                            fontSize: 12,
                            whiteSpace: "nowrap",
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
                          "&::-webkit-scrollbar-track": {
                            background: "#1F2937",
                          },
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

                {/* Selected ticker info card */}
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
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span
                        className={`text-xs font-medium ${selectedTicker.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {selectedTicker.changePercent >= 0 ? "▲" : "▼"}{" "}
                        {Math.abs(selectedTicker.changePercent).toFixed(2)}%
                      </span>
                    </div>
                    {selectedTicker.sector && (
                      <span className="text-gray-500 text-xs hidden sm:inline truncate max-w-xs">
                        {selectedTicker.sector}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ── 2×2 input grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📊 จำนวนหุ้นปัจจุบัน
                  </label>
                  <TextField
                    placeholder="เช่น 100"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.currentStockUnits}
                    onChange={handleInputChange("currentStockUnits")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">หุ้น</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💰 ราคาเฉลี่ยปัจจุบัน
                  </label>
                  <TextField
                    placeholder="เช่น 50.00"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.averageCostPerShare}
                    onChange={handleInputChange("averageCostPerShare")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">บาท</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📈 ราคาตลาดปัจจุบัน
                    {selectedTicker && (
                      <span className="ml-2 text-xs text-blue-400 font-normal">
                        (กรอกอัตโนมัติจาก {selectedTicker.ticker})
                      </span>
                    )}
                  </label>
                  <TextField
                    placeholder="เช่น 45.00"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.currentMarketPrice}
                    onChange={handleInputChange("currentMarketPrice")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">บาท</span>,
                    }}
                    sx={{
                      ...textFieldStyle,
                      // Highlight the field when auto-filled
                      ...(selectedTicker && {
                        "& .MuiOutlinedInput-root": {
                          ...((textFieldStyle[
                            "& .MuiOutlinedInput-root"
                          ] as Record<string, unknown>) ?? {}),
                          backgroundColor: "#1e3a5f",
                          "& fieldset": { borderColor: "#3b82f6" },
                          "&:hover fieldset": { borderColor: "#60a5fa" },
                        },
                      }),
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💵 จำนวนเงินลงทุนเพิ่ม
                  </label>
                  <TextField
                    placeholder="เช่น 10,000"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.additionalInvestmentAmount}
                    onChange={handleInputChange("additionalInvestmentAmount")}
                    disabled={loading}
                    InputProps={{
                      endAdornment: <span className="text-gray-400">บาท</span>,
                    }}
                    sx={textFieldStyle}
                  />
                </div>
              </div>

              {/* ── Calculate button ── */}
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
                  "คำนวณค่าเฉลี่ยหุ้น"
                )}
              </Button>
            </div>

            {/* ── Results ── */}
            {result && (
              <div className="mt-8 bg-gray-750 rounded-xl p-6">
                <div className="space-y-4">
                  {Object.entries(result).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-4 rounded-xl border border-gray-600 bg-gray-700/50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-gray-300">
                            {getFieldLabel(key)}
                          </span>
                          {getFieldDescription(key) && (
                            <div className="text-sm text-gray-500 mt-1">
                              {getFieldDescription(key)}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-lg font-bold ${getValueColor(key, value)}`}
                          >
                            {value.toLocaleString("th-TH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            {getFieldUnit(key)}
                          </span>
                        </div>
                      </div>
                      {key === "profitLossPercentage" && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${value >= 0 ? "bg-green-400" : "bg-red-400"}`}
                              style={{
                                width: `${Math.min(Math.abs(value), 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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

export default AverageCostCalculator;
