"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Formula {
  title: string;
  formula: string;
  color: string;
  textColor: string;
  description?: string;
}

interface FormulaDialogProps {
  open: boolean;
  onClose: () => void;
  formulas: Formula[];
  title?: string;
}

export default function FormulaDialog({
  open,
  onClose,
  formulas,
  title = "📐 สูตรการคำนวณ",
}: FormulaDialogProps) {
  const colorMap: {
    [key: string]: { bg: string; text: string; border: string };
  } = {
    blue: {
      bg: "bg-blue-900/20",
      text: "text-blue-300",
      border: "border-blue-700/30",
    },
    green: {
      bg: "bg-green-900/20",
      text: "text-green-300",
      border: "border-green-700/30",
    },
    purple: {
      bg: "bg-purple-900/20",
      text: "text-purple-300",
      border: "border-purple-700/30",
    },
    yellow: {
      bg: "bg-yellow-900/20",
      text: "text-yellow-300",
      border: "border-yellow-700/30",
    },
    orange: {
      bg: "bg-orange-900/20",
      text: "text-orange-300",
      border: "border-orange-700/30",
    },
    red: {
      bg: "bg-red-900/20",
      text: "text-red-300",
      border: "border-red-700/30",
    },
    emerald: {
      bg: "bg-emerald-900/20",
      text: "text-emerald-300",
      border: "border-emerald-700/30",
    },
    pink: {
      bg: "bg-pink-900/20",
      text: "text-pink-300",
      border: "border-pink-700/30",
    },
    cyan: {
      bg: "bg-cyan-900/20",
      text: "text-cyan-300",
      border: "border-cyan-700/30",
    },
    indigo: {
      bg: "bg-indigo-900/20",
      text: "text-indigo-300",
      border: "border-indigo-700/30",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        {title}
        <IconButton onClick={onClose} sx={{ color: "#9CA3AF" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <div className="space-y-4 text-sm">
          {formulas.map((item, index) => {
            const colors = colorMap[item.color] || colorMap.blue;
            return (
              <div
                key={index}
                className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}
              >
                <div className={`font-semibold ${colors.text} mb-1`}>
                  {item.title}
                </div>
                <div className="text-gray-300 font-mono text-xs break-words mb-2">
                  {item.formula}
                </div>
                {item.description && (
                  <div className="text-gray-400 text-xs space-y-1 border-t border-gray-600/30 pt-2">
                    {item.description.split("\n").map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: "1px solid #374151",
          p: 2,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "#E5E7EB",
            "&:hover": {
              backgroundColor: "rgba(75, 85, 99, 0.3)",
            },
          }}
        >
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}
