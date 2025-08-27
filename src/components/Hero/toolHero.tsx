import React, { useState } from "react";
import Link from "next/link";

export default function ToolListHero() {
  const cards = [
    {
      title: "คำนวณค่าเฉลี่ยหุ้น",
      description: "คำนวณราคาเฉลี่ยของหุ้นเพื่อวางแผนการลงทุน",
      path: "/average-calculator",
      icon: "📊",
      category: "การวิเคราะห์",
    },
    {
      title: "แบ่งเงินลงทุนกับเงินสดเก็บออม",
      description: "จัดสรรเงินระหว่างการลงทุนและการออมอย่างสมดุล",
      path: "/money-allocation",
      icon: "💰",
      category: "การจัดสรร",
    },
    {
      title: "แนวรับ 5 ไม้",
      description: "วิเคราะห์แนวรับและแนวต้านของราคาหุ้น",
      path: "/support",
      icon: "📈",
      category: "การวิเคราะห์",
    },
    {
      title: "คำนวณการขายต้นทุนแบบ FIFO",
      description: "คำนวณกำไรขาดทุนด้วยวิธี First In First Out",
      path: "/fifo-calculator",
      icon: "🔄",
      category: "การคำนวณ",
    },
    {
      title: "คำนวณกำไรเป้าหมาย",
      description: "กำหนดเป้าหมายกำไรและคำนวณจุดขาย",
      path: "/profit-target",
      icon: "🎯",
      category: "การวางแผน",
    },
    {
      title: "ออมเท่าไหร่ถึงได้เป้าหมายตามกำหนด",
      description: "คำนวณจำนวนเงินที่ต้องออมเพื่อให้ถึงเป้าหมาย",
      path: "/savings-goal",
      icon: "🏆",
      category: "การวางแผน",
    },
    {
      title: "คำนวณดอกเบี้ยทบต้น",
      description: "คำนวณการเติบโตของเงินด้วยดอกเบี้ยทบต้น",
      path: "/compound-interest",
      icon: "📈",
      category: "การคำนวณ",
    },
    {
      title: "คำนวณเงินปันผล",
      description: "คำนวณผลตอบแทนจากเงินปันผลรายปี",
      path: "/dividend-calculator",
      icon: "💎",
      category: "การคำนวณ",
    },
    {
      title: "คำนวณภาษีการลงทุน",
      description: "คำนวณภาษีจากกำไรการลงทุนและการซื้อขาย",
      path: "/tax-calculator",
      icon: "🧾",
      category: "การคำนวณ",
    },
  ];

  const categories = [
    "ทั้งหมด",
    "การวิเคราะห์",
    "การจัดสรร",
    "การคำนวณ",
    "การวางแผน",
  ];
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");

  const filteredCards =
    selectedCategory === "ทั้งหมด"
      ? cards
      : cards.filter((card) => card.category === selectedCategory);

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 mt-20">
            <div className="inline-flex items-center px-4 py-2 bg-gray-800 rounded-full border border-gray-700 mb-6">
              <span className="text-gray-300 text-sm font-medium">
                เครื่องมือการเงินครบครัน
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              เครื่องมือการลงทุน
              <span className="block text-gray-400 text-3xl md:text-4xl font-normal mt-2">
                สำหรับบุคคลทั่วไป
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              เครื่องมือครบครันสำหรับการคำนวณ
              และวางแผนการลงทุนอย่างมืออาชีพ
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-white text-gray-900 shadow-lg"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
            {filteredCards.map((card, index) => (
              <Link key={index} href={card.path} className="group block">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 overflow-hidden group-hover:bg-gray-800/70 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-900/20 h-full">
                  {/* Category Badge */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs font-medium rounded-full">
                        {card.category}
                      </span>
                      <div className="w-8 h-8 bg-gray-700/30 rounded-full flex items-center justify-center group-hover:bg-gray-600/50 transition-all duration-300">
                        <svg
                          className="w-4 h-4 text-gray-400 transform group-hover:translate-x-1 group-hover:text-gray-300 transition-all duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 bg-gray-700/50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-gray-700/70 transition-all duration-300 group-hover:scale-110 mb-4">
                      {card.icon}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-gray-100 transition-colors duration-300 leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors duration-300">
                      {card.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6 mt-auto">
                    <div className="pt-4 border-t border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs font-medium group-hover:text-gray-300 transition-colors duration-300">
                          เริ่มใช้งาน
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
