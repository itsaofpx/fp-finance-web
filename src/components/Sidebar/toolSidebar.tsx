"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, ChevronLeft } from "lucide-react";
import Badge from "@mui/material/Badge";

export default function ToolLayout({
  children,
  toolName,
}: {
  children: React.ReactNode;
  toolName: string;
}) {
  const [titleMD, setTitleMD] = useState("");
  const [summaryMD, setSummaryMD] = useState("");
  const [howItHelpsMD, setHowItHelpsMD] = useState("");
  const [benefitsMD, setBenefitsMD] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:3001/gemini/prompt/tools?toolName=${toolName}`
        );
        const json = await res.json();

        if (json?.success === true && json?.data) {
          const d = json.data;
          setTitleMD(`**${d.title || toolName}**`);
          setSummaryMD(`${d.summary || ""}`);
          setHowItHelpsMD(`### ✨ วิธีช่วยนักลงทุน\n${d.howItHelps || ""}`);
          setBenefitsMD(
            `### 🔍 ข้อดีของเครื่องมือนี้\n\n${(d.benefits || [])
              .map((b: string, index: number) => `${index + 1}. ${b}`)
              .join("\n")}`
          );
        } else {
          setSummaryMD("ไม่มีข้อมูลที่จะแสดง");
        }
      } catch (e) {
        setSummaryMD("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [toolName]);

  const SkeletonLine = ({ width = "w-full" }) => (
    <div className={`h-3 rounded-md bg-gray-700 animate-pulse ${width}`} />
  );

  const SkeletonBlock = () => (
    <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/70 shadow space-y-3">
      <SkeletonLine width="w-1/3" />
      <SkeletonLine />
      <SkeletonLine />
      <SkeletonLine width="w-2/3" />
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100 relative">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-1/4 bg-gray-850/90 backdrop-blur-lg 
          border-r border-gray-700 shadow-xl z-40 
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Content */}
        <div className="text-sm leading-relaxed text-gray-300 prose prose-invert overflow-y-auto max-h-[90vh] px-6 py-24 space-y-6">
          {/* Title Section */}
          <div>
            {loading ? (
              <SkeletonLine width="w-1/2" />
            ) : (
              <ReactMarkdown
                components={{
                  strong: ({ children }) => (
                    <span className="text-xl font-extrabold text-white">
                      {children}
                    </span>
                  ),
                }}
              >
                {titleMD}
              </ReactMarkdown>
            )}
          </div>

          {/* Summary */}
          {loading ? (
            <SkeletonBlock />
          ) : (
            <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/70 shadow">
              <ReactMarkdown>{summaryMD}</ReactMarkdown>
            </div>
          )}

          {/* How It Helps */}
          {loading ? (
            <SkeletonBlock />
          ) : (
            <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/70 shadow space-y-3">
              <ReactMarkdown
                components={{
                  h3: ({ children }) => (
                    <h3 className="text-lg font-bold text-blue-300">
                      {children}
                    </h3>
                  ),
                }}
              >
                {howItHelpsMD}
              </ReactMarkdown>
            </div>
          )}

          {/* Benefits */}
          {loading ? (
            <SkeletonBlock />
          ) : (
            <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/70 shadow space-y-3">
              <ReactMarkdown
                components={{
                  h3: ({ children }) => (
                    <h3 className="text-lg font-bold text-emerald-300">
                      {children}
                    </h3>
                  ),
                }}
              >
                {benefitsMD}
              </ReactMarkdown>
            </div>
          )}

          {/* --- DISCLAIMER SECTION (ข้อสงวนสิทธิ์) --- */}
          <div className="pt-4 border-t border-gray-700/70 mt-6">
            <div className="p-4 rounded-xl bg-red-900/20 border border-red-700/50 shadow space-y-2">
              <h4 className="text-sm font-bold text-red-300 flex items-center gap-1">
                ⚠️ ข้อสงวนสิทธิ์
              </h4>
              <p className="text-xs leading-relaxed text-gray-400">
                ข้อมูลและการวิเคราะห์นี้สร้างโดยปัญญาประดิษฐ์ (AI)
                เพื่อวัตถุประสงค์ในการให้ข้อมูลเท่านั้น
                และมิได้ถือเป็นคำแนะนำทางการเงิน การลงทุน หรือการซื้อขาย
                โปรดใช้วิจารณญาณส่วนบุคคลและปรึกษาผู้เชี่ยวชาญทางการเงิน
                ก่อนตัดสินใจลงทุนทุกครั้ง
              </p>
            </div>
          </div>
          {/* ------------------------------------------- */}
        </div>
      </aside>

      {/* Open Button */}
      <button
        onClick={() => {
          setOpen(!open);
        }}
        disabled={loading}
        className={`
          fixed top-8 left-6 z-50 px-4 py-2 rounded-xl text-sm font-medium 
          bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all
        `}
      >
        <div className="flex items-center gap-1">
          <Bot className="w-5 h-5" />
          <span className="text-sm font-medium">AI วิเคราะห์</span>
          <div
            className={`dots ${loading ? "bg-red-500" : "bg-green-500"}`}
          ></div>
          {loading ? (
            <Badge color="error" variant="dot"></Badge>
          ) : (
            <Badge color="success" variant="dot"></Badge>
          )}
        </div>
      </button>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
