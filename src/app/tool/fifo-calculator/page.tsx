"use client";
import {
  Button,
  TextField,
  Alert,
  CircularProgress,
  Typography,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DisclaimerFooter from "@/components/Footer/disclaimerFooter";
import FormulaDialog from "@/components/FormulaDialog";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface ITransaction {
  numberOfShares: number;
  buyingPrice: number;
}

interface IFIFOResult {
  totalCost: number;
  averageCostPerShare: number;
  sellingTransactions: ITransaction[];
  remainingShares: number;
  remainingTransactions: ITransaction[];
}

const FIFOCalculator = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<ITransaction[]>([
    { numberOfShares: 0, buyingPrice: 0 },
  ]);
  const [sellingOfShares, setSellingOfShares] = useState<string>("");

  const [result, setResult] = useState<IFIFOResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFormula, setOpenFormula] = useState(false);

  const handleBackClick = () => {
    router.push("/tool");
  };

  const addTransaction = () => {
    setTransactions([...transactions, { numberOfShares: 0, buyingPrice: 0 }]);
  };

  const removeTransaction = (index: number) => {
    if (transactions.length > 1) {
      const newTransactions = transactions.filter((_, i) => i !== index);
      setTransactions(newTransactions);
    }
  };

  const updateTransaction = (
    index: number,
    field: keyof ITransaction,
    value: string
  ) => {
    const newTransactions = [...transactions];
    newTransactions[index] = {
      ...newTransactions[index],
      [field]: parseFloat(value) || 0,
    };
    setTransactions(newTransactions);
    if (error) setError(null);
  };

  const handleSellingSharesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSellingOfShares(event.target.value);
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!sellingOfShares || parseFloat(sellingOfShares) <= 0) {
      setError("กรุณากรอกจำนวนหุ้นที่ต้องการขาย");
      return false;
    }

    const hasValidTransactions = transactions.some(
      (tx) => tx.numberOfShares > 0 && tx.buyingPrice > 0
    );

    if (!hasValidTransactions) {
      setError("กรุณากรอกข้อมูลการซื้อหุ้นอย่างน้อย 1 รายการ");
      return false;
    }

    const totalShares = transactions.reduce(
      (sum, tx) => sum + tx.numberOfShares,
      0
    );

    if (parseFloat(sellingOfShares) > totalShares) {
      setError("จำนวนหุ้นที่ต้องการขายมากกว่าจำนวนหุ้นที่มี");
      return false;
    }

    return true;
  };

  const handleCalculate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const validTransactions = transactions.filter(
        (tx) => tx.numberOfShares > 0 && tx.buyingPrice > 0
      );

      const payload = {
        transactions: validTransactions,
        sellingOfShares: parseFloat(sellingOfShares),
      };

      const response = await fetch(
        "http://localhost:3001/tool/fifo-calculator",
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

      const data: IFIFOResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error calculating FIFO:", err);
      setError("เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
                title: "1. มูลค่าการซื้อเก่า (FIFO)",
                formula: "Cost of Oldest Shares = Cost Per Share × Shares Sold",
                color: "blue",
                textColor: "text-blue-300",
              },
              {
                title: "2. กำไร/ขาดทุน",
                formula: "P/L = (Selling Price × Shares) - Cost of Shares",
                color: "green",
                textColor: "text-green-300",
              },
              {
                title: "3. หุ้นที่เหลือ",
                formula: "Remaining Shares = Total Shares - Shares Sold",
                color: "purple",
                textColor: "text-purple-300",
              },
              {
                title: "4. ต้นทุนเฉลี่ยหลังการขาย",
                formula: "New Avg Cost = Remaining Cost ÷ Remaining Shares",
                color: "yellow",
                textColor: "text-yellow-300",
              },
            ]}
            title="📐 สูตร FIFO"
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
              คำนวณ FIFO (First In First Out)
            </h1>
            <p className="text-gray-400 text-lg">คำนวณต้นทุนหุ้นตามหลัก FIFO</p>
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
                วิธีการคำนวณ FIFO
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">
                      เพิ่มรายการซื้อ
                    </div>
                    <div className="text-gray-400">
                      ใส่จำนวนหุ้นและราคาซื้อแต่ละครั้ง
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium">
                      จำนวนหุ้นที่ขาย
                    </div>
                    <div className="text-gray-400">
                      ระบุจำนวนหุ้นที่ต้องการขาย
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
                      ต้นทุนและหุ้นคงเหลือตาม FIFO
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

            {/* Transactions Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-100">
                  📊 รายการซื้อหุ้น
                </h3>
                <Button
                  variant="outlined"
                  onClick={addTransaction}
                  startIcon={<AddIcon />}
                  sx={{
                    color: "#60A5FA",
                    borderColor: "#60A5FA",
                    "&:hover": {
                      borderColor: "#3B82F6",
                      backgroundColor: "rgba(96, 165, 250, 0.1)",
                    },
                  }}
                >
                  เพิ่มรายการ
                </Button>
              </div>

              {/* Transaction Cards */}
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <Card
                    key={index}
                    sx={{
                      backgroundColor: "#374151",
                      border: "1px solid #4B5563",
                      borderRadius: "12px",
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <Typography className="text-gray-200 font-medium">
                          รายการที่ {index + 1}
                        </Typography>
                        {transactions.length > 1 && (
                          <IconButton
                            onClick={() => removeTransaction(index)}
                            sx={{ color: "#EF4444" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            จำนวนหุ้น
                          </label>
                          <TextField
                            placeholder="เช่น 100"
                            variant="outlined"
                            fullWidth
                            type="number"
                            value={transaction.numberOfShares || ""}
                            onChange={(e) =>
                              updateTransaction(
                                index,
                                "numberOfShares",
                                e.target.value
                              )
                            }
                            disabled={loading}
                            InputProps={{
                              endAdornment: (
                                <span className="text-gray-400">หุ้น</span>
                              ),
                            }}
                            sx={textFieldStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            ราคาซื้อต่อหุ้น
                          </label>
                          <TextField
                            placeholder="เช่น 25.50"
                            variant="outlined"
                            fullWidth
                            type="number"
                            value={transaction.buyingPrice || ""}
                            onChange={(e) =>
                              updateTransaction(
                                index,
                                "buyingPrice",
                                e.target.value
                              )
                            }
                            disabled={loading}
                            InputProps={{
                              endAdornment: (
                                <span className="text-gray-400">บาท</span>
                              ),
                            }}
                            sx={textFieldStyle}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selling Shares Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  💰 จำนวนหุ้นที่ต้องการขาย
                </label>
                <TextField
                  placeholder="เช่น 150"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={sellingOfShares}
                  onChange={handleSellingSharesChange}
                  disabled={loading}
                  InputProps={{
                    endAdornment: <span className="text-gray-400">หุ้น</span>,
                  }}
                  sx={textFieldStyle}
                />
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
                  "คำนวณ FIFO"
                )}
              </Button>
            </div>

            {/* Result Display */}
            {result && (
              <div className="mt-8 bg-gray-750 rounded-xl p-6">
                <div className="text-center mb-6">
                  <span className="text-2xl font-bold text-blue-400">
                    ผลการคำนวณ FIFO
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">
                        ต้นทุนรวมของหุ้นที่ขาย
                      </span>
                      <span className="font-bold text-red-400">
                        {formatNumber(result.totalCost)} บาท
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">
                        ราคาต้นทุนเฉลี่ยต่อหุ้น (หุ้นคงเหลือ)
                      </span>
                      <span className="font-bold text-blue-400">
                        {formatNumber(result.averageCostPerShare)} บาท
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">จำนวนหุ้นคงเหลือ</span>
                      <span className="font-bold text-green-400">
                        {result.remainingShares.toLocaleString()} หุ้น
                      </span>
                    </div>
                  </div>

                  {/* Selling Transactions */}
                  <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                    <h4 className="text-gray-300 font-medium mb-3">
                      รายการหุ้นที่ขาย (FIFO)
                    </h4>
                    <div className="space-y-2">
                      {result.sellingTransactions.map((tx, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm p-2 bg-gray-600/30 rounded-lg"
                        >
                          <span className="text-gray-300">
                            {tx.numberOfShares.toLocaleString()} หุ้น
                          </span>
                          <span className="text-red-300">
                            @ {formatNumber(tx.buyingPrice)} บาท
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Remaining Transactions */}
                  {result.remainingTransactions.length > 0 && (
                    <div className="p-4 rounded-xl border border-gray-600 bg-gray-700/50">
                      <h4 className="text-gray-300 font-medium mb-3">
                        หุ้นคงเหลือ
                      </h4>
                      <div className="space-y-2">
                        {result.remainingTransactions.map((tx, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm p-2 bg-gray-600/30 rounded-lg"
                          >
                            <span className="text-gray-300">
                              {tx.numberOfShares.toLocaleString()} หุ้น
                            </span>
                            <span className="text-green-300">
                              @ {formatNumber(tx.buyingPrice)} บาท
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

export default FIFOCalculator;
