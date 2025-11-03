"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseCookies } from "nookies";

export default function PlanPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const cookies = parseCookies();
      const accessToken = cookies.accessToken;
      
      if (!accessToken) {
        router.push("/");
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            เลือกรูปแบบการวางแผนการเงิน
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            เราเตรียมเครื่องมือวางแผนการเงิน 2 รูปแบบให้คุณเลือก 
            ตามความเหมาะสมกับเป้าหมายและสถานการณ์ของคุณ
          </p>
        </div>

        {/* Planning Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Income-Based Planning */}
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:scale-105 cursor-pointer"
            onClick={() => router.push("/plan/income-based")}
          >
            {/* Header with Gradient */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
              
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-5xl">💰</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Income-Based Planning
                </h2>
                <p className="text-blue-100 text-lg">
                  วางแผนตามรายได้
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                เหมาะสำหรับการวางแผนเกษียณโดยอิงจากค่าใช้จ่ายรายเดือนที่ต้องการในอนาคต 
                คำนวณเงินออมรายเดือนที่ต้องการ โดยคำนึงถึงเงินเฟ้อ ผลตอบแทน และเงินออมปัจจุบัน
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">✓</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    กำหนดค่าใช้จ่ายรายเดือนเป้าหมายหลังเกษียณ
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">✓</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    คำนวณเงินออมรายเดือนที่ต้องการ
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">✓</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    ประเมินมูลค่าอนาคตของเงินออมปัจจุบัน
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <span className="text-blue-700 dark:text-blue-400 font-semibold">
                  เริ่มคำนวณเงินออมเพื่อเกษียณ
                </span>
                <svg 
                  className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:translate-x-2 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Goal-Based Planning */}
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:scale-105 cursor-pointer"
            onClick={() => router.push("/plan/goal-based")}
          >
            {/* Header with Gradient */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
              
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-5xl">🎯</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Goal-Based Planning
                </h2>
                <p className="text-emerald-100 text-lg">
                  วางแผนตามเป้าหมาย
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                เหมาะสำหรับผู้ที่มีเป้าหมายการเงินที่ชัดเจน 
                เช่น เกษียณ ซื้อบ้าน การศึกษาบุตร หรือการลงทุน
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    เลือกตามเป้าหมายชีวิต
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    คำนวณเงินออมที่ต้องการ
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    วิเคราะห์การเติบโต
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  เริ่มวางแผนตามเป้าหมาย
                </span>
                <svg 
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-2 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
            เปรียบเทียบรูปแบบการวางแผน
          </h2>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    คุณสมบัติ
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-700 dark:text-blue-400">
                    Income-Based
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Goal-Based
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    เน้นการจัดสรรรายได้
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-blue-600 dark:text-blue-400 text-xl">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400">-</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    มีเป้าหมายที่ชัดเจน
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-400">-</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xl">✓</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    บันทึกและจัดการหลายแผน
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-blue-600 dark:text-blue-400 text-xl">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xl">✓</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    กราฟและการวิเคราะห์
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-blue-600 dark:text-blue-400 text-xl">✓</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xl">✓</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white text-center">
            <div className="text-5xl mb-4">💡</div>
            <h3 className="text-2xl font-bold mb-3">
              ไม่แน่ใจว่าควรเลือกแบบไหน?
            </h3>
            <p className="text-lg text-purple-100 mb-6 max-w-2xl mx-auto">
              ถ้าคุณมีรายได้ประจำและต้องการบริหารเงินให้เหมาะสม เลือก <strong>Income-Based</strong><br />
              ถ้าคุณมีเป้าหมายที่ชัดเจน เช่น เกษียณ ซื้อบ้าน เลือก <strong>Goal-Based</strong>
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => router.push("/plan/income-based")}
                className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors shadow-lg"
              >
                ลอง Income-Based
              </button>
              <button
                onClick={() => router.push("/plan/goal-based")}
                className="px-6 py-3 bg-purple-800 text-white font-semibold rounded-lg hover:bg-purple-900 transition-colors shadow-lg border-2 border-white/30"
              >
                ลอง Goal-Based
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
