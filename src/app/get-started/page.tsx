"use client";
import React, { useEffect, useState } from "react";
import {
  Zap,
  Cpu,
  Building2,
  Heart,
  ShoppingCart,
  ShoppingBag,
  Bolt,
  Phone,
  Truck,
  Home,
  Building,
  Globe,
  Pill,
  Check,
  Plus,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { parseCookies } from "nookies";

interface ISector {
  id: string;
  name: string;
}
export default function QuestionPage() {
  const router = useRouter();
  const { account } = parseCookies();
  const [selected, setSelected] = useState<ISector[]>([]);
  const [sectors, setSectors] = useState<ISector[]>([]);

  const toggleSelect = (sector: ISector) => {
    setSelected((prev) =>
      prev.includes(sector)
        ? prev.filter((item) => item !== sector)
        : [...prev, sector]
    );
  };

  const handleContinue = async () => {
    try {
      const sectorIds = selected.map((sector) => sector.id);
      const userId = JSON.parse(account).id;
      const response = await axios.post(
        `http://localhost:3001/accounts/${userId}/sectors`,
        {
          sectorIds: sectorIds,
        }
      );
      if (response.status === 201) {
        router.push("/hub");
      }
    } catch (error) {}
  };

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await axios.get("http://localhost:3001/sector");
        console.log("Fetched sectors:", response.data);
        setSectors(response.data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
      }
    };

    fetchSectors();
  }, []);

  const progress = Math.min((selected.length / 3) * 100, 100);
  const canContinue = selected.length >= 3;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-16 pb-32 px-4">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
            <Sparkles size={16} className="text-yellow-300" />
            <span className="text-sm font-medium">
              Personalize Your Experience
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            What are you interested in?
          </h1>
          <p className="text-gray-300 text-lg">
            Choose{" "}
            <span className="font-semibold text-white">
              {Math.max(3 - selected.length, 0) === 0
                ? "✓"
                : Math.max(3 - selected.length, 0) + " more"}
            </span>{" "}
            {Math.max(3 - selected.length, 0) === 1 ? "sector" : "sectors"} to
            continue
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{selected.length} selected</span>
            <span>Min. 3 required</span>
          </div>
        </div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectors.map((sector, index) => {
            const isSelected = selected.includes(sector);

            return (
              <button
                key={index}
                onClick={() => toggleSelect(sector)}
                className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden
                  ${
                    isSelected
                      ? "bg-white/20 border-white/40 backdrop-blur-md scale-[1.02] shadow-2xl shadow-white/20"
                      : "bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]"
                  }`}
                style={{
                  animationDelay: `${index * 30}ms`,
                }}
              >
                {/* Text */}
                <div className="relative z-10 flex-1">
                  <span
                    className={`font-medium transition-colors ${
                      isSelected ? "text-white" : "text-gray-200"
                    }`}
                  >
                    {sector.name}
                  </span>
                </div>

                {/* Check/Plus Icon */}
                <div className="relative z-10 flex-shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <Check size={16} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Plus size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <button
            disabled={!canContinue}
            onClick={handleContinue}
            className={`w-full py-4 text-lg rounded-2xl transition-all duration-300 font-semibold relative overflow-hidden group
              ${
                canContinue
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-2xl hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-white/10 text-gray-500 cursor-not-allowed"
              }`}
          >
            {canContinue && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              Continue
              {canContinue && <Check size={20} />}
            </span>
          </button>
          {!canContinue && (
            <p className="text-center mt-3 text-sm text-gray-400">
              Select at least {3 - selected.length} more{" "}
              {3 - selected.length === 1 ? "sector" : "sectors"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
