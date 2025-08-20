"use client";

import axios from "axios";
import { ArrowRight, PieChart, List, Wrench, BookOpen } from "lucide-react";

const features = [
  {
    icon: PieChart,
    text: "ระบบวางแผนชีวิต",
    color: "text-green-400",
  },
  { icon: List, text: "รายชื่อหุ้น", color: "text-blue-400" },
  {
    icon: Wrench,
    text: "เครื่องมือในการลงทุน",
    color: "text-purple-400",
  },
  {
    icon: BookOpen,
    text: "บทความสำหรับหุ้น",
    color: "text-orange-400",
  },
];

const handleLogin = async () => {
  try {
    window.location.href = 'http://localhost:3001/auth/google/login';
  } catch (error) {
    console.log(error);
  }
};

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16">
      <div className="container mx-auto px-4 py-56">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            เริ่มศึกษาการลงทุนของ{" "}
            <span className="text-blue-400 cursor-pointer">เริ่มต้นที่นี่</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl">
            แพลตฟอร์มการเรียนรู้ด้านการลงทุนและเครื่องมือที่ครบครัน
            ออกแบบมาเพื่อช่วยให้คุณวางแผนชีวิต
            ลงทุนและเติบโตทางการเงินด้วยความมั่นใจ
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {features.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-300 transition hover:scale-110"
                >
                  <IconComponent className={`w-5 h-5 ${item.color}`} />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>

          <button
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition flex items-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105"
            onClick={handleLogin}
          >
            เริ่มต้นเลย
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
