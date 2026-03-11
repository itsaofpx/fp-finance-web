"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Target,
  PiggyBank,
  TrendingUp,
  BookOpen,
  BarChart3,
  Check,
} from "lucide-react";
import Confetti from "./Confetti";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "ยินดีต้อนรับสู่ Finance Pro! 🎉",
    description:
      "เราจะแนะนำคุณรู้จักกับฟีเจอร์ต่างๆ ที่จะช่วยให้คุณบริหารการเงินได้อย่างมีประสิทธิภาพ",
    icon: <Target className="w-12 h-12" />,
    features: [
      "เครื่องมือคำนวณทางการเงินครบครัน",
      "วางแผนการเงินแบบมืออาชีพ",
      "ติดตามข่าวสารและพอร์ตการลงทุน",
    ],
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 2,
    title: "เครื่องมือคำนวณ 🧮",
    description:
      "เครื่องมือคำนวณที่หลากหลายช่วยให้คุณวิเคราะห์และวางแผนการเงินได้อย่างแม่นยำ",
    icon: <Calculator className="w-12 h-12" />,
    features: [
      "คำนวณราคาเฉลี่ยหุ้น - หาจุดคุ้มทุนและกำไร",
      "คำนวณดอกเบี้ยทบต้น - คาดการณ์ผลตอบแทน",
      "คำนวณกองทุนฉุกเฉิน - วางแผนเงินสำรอง",
      "คำนวณ Stop Loss & Profit Target - จัดการความเสี่ยง",
      "คำนวณภาษีเงินได้ - วางแผนภาษี",
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    title: "วางแผนการเงิน 📊",
    description:
      "สร้างแผนการเงินที่เหมาะกับคุณ ไม่ว่าจะเป้าหมายระยะสั้นหรือระยะยาว",
    icon: <Target className="w-12 h-12" />,
    features: [
      "แผนตามเป้าหมาย - กำหนดเป้าหมายที่ชัดเจน",
      "แผนตามรายได้ - จัดสรรเงินออมอัตโนมัติ",
      "ติดตามความคืบหน้าแบบเรียลไทม์",
    ],
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 4,
    title: "ข่าวสารและพอร์ตโฟลิโอ 📰",
    description: "ติดตามข่าวการเงินและตลาดหุ้นแบบเรียลไทม์",
    icon: <TrendingUp className="w-12 h-12" />,
    features: [
      "ข่าวการเงินอัพเดททุกวัน",
      "ข้อมูลหุ้นแบบเรียลไทม์ 15+ หมวดหมู่",
      "พอร์ตโฟลิโอที่แนะนำจากผู้เชี่ยวชาญ",
      "วิเคราะห์ด้วย AI เพื่อช่วยตัดสินใจ",
    ],
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: 5,
    title: "คลังความรู้ 📚",
    description: "เรียนรู้คำศัพท์และแนวคิดทางการเงินอย่างครบถ้วน",
    icon: <BookOpen className="w-12 h-12" />,
    features: [
      "คำศัพท์การเงิน A-Z",
      "คำอธิบายที่เข้าใจง่าย",
      "ตัวอย่างการใช้งานจริง",
      "ค้นหาได้รวดเร็ว",
    ],
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: 6,
    title: "พร้อมเริ่มต้นแล้ว! 🚀",
    description:
      "ตอนนี้คุณพร้อมแล้วที่จะเริ่มใช้งาน ลองสำรวจฟีเจอร์ต่างๆ กันเลย!",
    icon: <Check className="w-12 h-12" />,
    features: [
      "เริ่มต้นด้วยเครื่องมือคำนวณที่ต้องการ",
      "สร้างแผนการเงินแรกของคุณ",
      "ติดตามข่าวสารและพอร์ตโฟลิโอ",
      "สามารถดูคู่มือนี้ได้ทุกเมื่อจากเมนูช่วยเหลือ",
    ],
    color: "from-pink-500 to-rose-500",
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show confetti on completion
      setShowConfetti(true);
      setTimeout(() => {
        handleComplete();
      }, 500);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleDotClick = (index: number) => {
    setCurrentStep(index);
  };

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  if (!isVisible) return null;

  return (
    <>
      <Confetti isActive={showConfetti} />
      <div 
        onClick={handleSkip}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transform transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-t-2xl overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${step.color} transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-12">
          {/* Icon */}
          <div
            className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} text-white mb-6 animate-in slide-in-from-top duration-500`}
          >
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white animate-in slide-in-from-top duration-500 delay-100">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 animate-in slide-in-from-top duration-500 delay-200">
            {step.description}
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {step.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 animate-in slide-in-from-left duration-500"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mt-0.5`}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-gray-700 dark:text-gray-300">{feature}</p>
              </div>
            ))}
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentStep
                    ? "w-8 h-2 bg-gradient-to-r " + step.color
                    : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentStep === 0
                  ? "opacity-50 cursor-not-allowed text-gray-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              ย้อนกลับ
            </button>

            <div className="flex gap-3">
              {currentStep < onboardingSteps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  ข้าม
                </button>
              )}

              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r ${step.color} hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
              >
                {currentStep === onboardingSteps.length - 1
                  ? "เริ่มใช้งาน"
                  : "ถัดไป"}
                {currentStep < onboardingSteps.length - 1 && (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Step Counter */}
        <div className="absolute bottom-4 left-8 text-sm text-gray-500 dark:text-gray-400">
          {currentStep + 1} / {onboardingSteps.length}
        </div>
      </div>
    </div>
    </>
  );
};

export default OnboardingTutorial;
