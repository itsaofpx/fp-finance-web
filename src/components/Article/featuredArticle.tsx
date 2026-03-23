"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Newspaper, ArrowRight } from "lucide-react";

export interface AINewsArticle {
  title: string;
  content: string;
  link?: string;
}

interface FeaturedArticleProps {
  featuredArticle: AINewsArticle | null;
  featuredLoading: boolean;
  featuredError: string | null;
  onRetry: () => void;
}

interface ParsedNewsContent {
  title?: string;
  header?: string;
  sections: string[];
}

const NEWS_SECTION_HEADINGS = [
  "สรุปภาพรวมสภาวะตลาดการเงินในรอบ 24 ชั่วโมงที่ผ่านมา",
  "เจาะลึก 2-3 ประเด็นสำคัญที่ขับเคลื่อนตลาดและจิตวิทยานักลงทุน",
  "คำแนะนำการบริหารพอร์ตการลงทุนและการรับมือความเสี่ยง",
  "การพยากรณ์ทิศทางตลาดในช่วงสัปดาห์นี้",
];

const parseJsonNewsContent = (
  rawContent: string,
  fallbackTitle?: string
): ParsedNewsContent | null => {
  if (!rawContent) return null;

  const jsonBlockMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = (jsonBlockMatch?.[1] ?? rawContent).trim();

  try {
    const parsed = JSON.parse(candidate);
    const sectionKeys = Object.keys(parsed)
      .filter((key) => /^section_\d+$/i.test(key))
      .sort((a, b) => {
        const ai = Number(a.split("_")[1]);
        const bi = Number(b.split("_")[1]);
        return ai - bi;
      });

    return {
      title: parsed.title || fallbackTitle,
      header: parsed.header || "",
      sections: sectionKeys
        .map((key) => parsed[key])
        .filter((value) => typeof value === "string" && value.trim().length > 0),
    };
  } catch {
    return null;
  }
};

export default function FeaturedArticleComponent({
  featuredArticle,
  featuredLoading,
  featuredError,
  onRetry,
}: FeaturedArticleProps) {
  const parsedNews = useMemo(
    () =>
      featuredArticle
        ? parseJsonNewsContent(featuredArticle.content, featuredArticle.title)
        : null,
    [featuredArticle]
  );

  if (featuredLoading) {
    return (
      <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/90 shadow-2xl">
        <div className="p-8 space-y-6 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-full mx-auto"></div>
          <div className="h-4 bg-gray-700 rounded w-full mx-auto"></div>
          <div className="h-4 bg-gray-700 rounded w-full mx-auto"></div>
          <div className="h-4 bg-gray-700 rounded w-full mx-auto"></div>
          <div className="h-4 bg-gray-700 rounded w-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (featuredError) {
    return (
      <div className="rounded-[2rem] overflow-hidden border border-rose-400/30 bg-rose-950/20 shadow-xl">
        <div className="p-8 text-center">
          <div className="text-red-400 mb-4">เกิดข้อผิดพลาด</div>
          <p className="text-gray-300 mb-4">{featuredError}</p>
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!featuredArticle) return null;

  const hasStructuredContent = !!parsedNews && parsedNews.sections.length > 0;

  return (
    <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-gradient-to-br from-gray-900/95 via-gray-800/80 to-gray-900/95 shadow-2xl relative">
      <div className="absolute -top-14 -right-14 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-14 -left-14 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="p-8 md:p-10 relative z-10">
        <div className="flex items-center justify-between mb-5 gap-4">
          <span className="inline-flex items-center gap-2 bg-indigo-500/15 text-indigo-200 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-400/30 uppercase tracking-wide">
            <Sparkles size={14} />
            บทวิเคราะห์ AI
          </span>
          <span className="inline-flex items-center gap-2 text-xs text-slate-400">
            <Newspaper size={14} /> Daily Market Brief
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
          {parsedNews?.title || featuredArticle.title}
        </h2>

        {parsedNews?.header && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-100 text-sm md:text-base font-medium">
            {parsedNews.header}
          </div>
        )}

        {hasStructuredContent ? (
          <div className="space-y-4">
            {parsedNews.sections.map((section, index) => (
              <section
                key={`${index}-${section.slice(0, 24)}`}
                className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-indigo-500/25 text-indigo-200 text-xs font-bold px-2">
                    {index + 1}
                  </span>
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                    {NEWS_SECTION_HEADINGS[index] || `ประเด็นสรุป ${index + 1}`}
                  </p>
                </div>
                <p className="text-slate-200 leading-relaxed text-sm md:text-base">
                  {section}
                </p>
              </section>
            ))}
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-4 text-white border-b border-gray-600 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mb-3 text-white mt-6">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium mb-2 text-white mt-4">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 leading-relaxed text-gray-300">{children}</p>
                ),
                li: ({ children }) => (
                  <li className="text-gray-300 leading-relaxed">{children}</li>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {featuredArticle.content}
            </ReactMarkdown>
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <span className="text-sm text-gray-400">
            วิเคราะห์โดย AI Assistant (บทความที่ให้มาเป็นการสรุปมาจาก AI
            กรุณาใช้วิจารณญาณในการอ่าน)
          </span>
          {featuredArticle.link && (
            <button
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  featuredArticle.link,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              อ่านเพิ่มเติม <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}