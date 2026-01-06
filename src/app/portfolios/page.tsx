"use client";
import React, { useState, useCallback } from "react";
import {
  ArrowUpRight,
  X,
  Award,
  BookOpen,
  Wallet,
  Info,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Modal, Box, Typography, IconButton, Chip } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { INVESTORS, STATIC_INVESTORS_DATA } from "./data/portfolios";

// --- ปรับฟอนต์ Label บน Section ให้เล็กลง ---
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  payload,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // แสดงผลเฉพาะหุ้นที่สัดส่วน > 4% เพื่อไม่ให้รก
  if (payload.weight < 4) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[9px] font-black pointer-events-none opacity-80"
      style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.6)" }}
    >
      {`${payload.weight}%`}
    </text>
  );
};

// --- ปรับขอบเขตการขยายเมื่อ Hover ---
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 0 15px ${fill}66)` }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 14}
        fill={fill}
        opacity={0.1}
      />
    </g>
  );
};

export default function MinimalInteractivePortfolios() {
  const [selected, setSelected] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const openPortfolio = (investor: any) => {
    const data = STATIC_INVESTORS_DATA[investor.name];
    setSelected({ ...investor, ...data });
    setActiveIndex(-1);
  };

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  const activeItem =
    selected && activeIndex > -1 ? selected.holdings[activeIndex] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
            <ShieldCheck size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Institutional Analytics 2026
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 uppercase italic bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Whale Tracking
          </h1>
          <p className="text-slate-400 font-medium max-w-xl mx-auto text-lg opacity-80">
            วิเคราะห์พอร์ตการลงทุนระดับพันล้านแบบ Interactive
          </p>
        </header>

        {/* Investor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INVESTORS.map((inv) => (
            <div
              key={inv.name}
              onClick={() => openPortfolio(inv)}
              className="group bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-[40px] p-8 shadow-2xl hover:border-blue-500/50 transition-all duration-500 cursor-pointer relative overflow-hidden h-[420px] flex flex-col justify-end"
            >
              <img
                src={inv.image}
                className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:opacity-40 group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                alt={inv.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white p-2.5 mb-6 shadow-xl transform group-hover:-rotate-6 transition-transform">
                  <img
                    src={inv.logo}
                    alt={inv.firm}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight">
                  {inv.name}
                </h3>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em] mt-2">
                  {inv.firm}
                </p>
                <div className="mt-8 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-300 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    {inv.style} Strategy
                  </span>
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        closeAfterTransition
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", md: "90vw", lg: "1150px" },
            bgcolor: "#020617",
            borderRadius: 10,
            p: { xs: 3, md: 6 },
            outline: "none",
            maxHeight: "90vh",
            overflowY: "auto",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 0 100px rgba(0,0,0,0.8)",
          }}
        >
          <div className="absolute top-8 right-8 z-20">
            <IconButton
              onClick={() => setSelected(null)}
              className="text-slate-500 hover:text-white bg-white/5"
            >
              <X size={24} />
            </IconButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Chart Area */}
            <div className="lg:col-span-7">
              <div className="mb-10 flex items-center gap-6">
                <div className="w-16 h-16 rounded-[20px] bg-white p-2.5 shadow-2xl">
                  <img
                    src={selected?.logo}
                    alt={selected?.firm}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    fontWeight={950}
                    className="text-white tracking-tighter italic uppercase leading-none"
                  >
                    {selected?.name}
                  </Typography>
                  <div className="flex gap-4 items-center mt-3 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg w-fit">
                    <TrendingUp size={14} />
                    <span className="text-sm tracking-widest">
                      {selected?.totalValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* ปรับ Radius ให้กว้างขึ้น และ Container ดูโปร่งขึ้น */}
              <div className="relative h-[550px] w-full bg-slate-950/30 rounded-[60px] border border-white/5 shadow-inner flex items-center justify-center overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={selected?.holdings}
                      cx="50%"
                      cy="50%"
                      innerRadius={145} // กว้างขึ้น
                      outerRadius={180} // กว้างขึ้น
                      dataKey="weight"
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                      paddingAngle={2.5}
                      stroke="none"
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {selected?.holdings.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Content: Ticker หุ้นขนาดเล็กลง */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  {activeItem ? (
                    <div className="animate-in fade-in zoom-in duration-500">
                      <Typography
                        variant="h1"
                        fontWeight={950}
                        sx={{
                          color: activeItem.color,
                          fontSize: { xs: "2.5rem", md: "3.5rem" }, // เล็กลงเพื่อความหรู
                          lineHeight: 1,
                          letterSpacing: "-0.05em",
                          textShadow: `0 0 30px ${activeItem.color}55`,
                        }}
                      >
                        {activeItem.symbol}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="text-slate-500 font-black tracking-[0.5em] uppercase block mt-3 opacity-60"
                      >
                        {activeItem.name}
                      </Typography>
                    </div>
                  ) : (
                    <div className="opacity-10 flex flex-col items-center">
                      <Wallet size={40} className="mb-3 text-slate-400" />
                      <Typography
                        variant="caption"
                        className="font-black uppercase tracking-[0.5em] text-slate-500"
                      >
                        Select Asset
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-slate-900/60 p-8 rounded-[40px] border border-white/5 shadow-lg">
                <div className="flex items-center gap-3 mb-6 opacity-60">
                  <BookOpen size={18} className="text-blue-400" />
                  <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">
                    Philosophy
                  </span>
                </div>
                <Typography className="text-slate-400 text-base md:text-lg leading-relaxed font-light italic">
                  "{selected?.bio}"
                </Typography>
              </div>

              <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 shadow-xl flex-grow">
                <Typography className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2 opacity-40">
                  <Award size={14} /> Major Holdings
                </Typography>
                <div className="space-y-2.5 mt-6">
                  {selected?.holdings.slice(0, 6).map((h: any) => (
                    <div
                      key={h.symbol}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px]"
                          style={{
                            backgroundColor: `${h.color}15`,
                            color: h.color,
                            border: `1px solid ${h.color}33`,
                          }}
                        >
                          {h.symbol[0]}
                        </div>
                        <p className="text-white font-bold text-sm tracking-tight">
                          {h.symbol}
                        </p>
                      </div>
                      <p className="text-slate-400 font-black text-xs">
                        {h.weight}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
