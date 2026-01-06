"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

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

export default function FeaturedArticleComponent({
  featuredArticle,
  featuredLoading,
  featuredError,
  onRetry,
}: FeaturedArticleProps) {
  if (featuredLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-700">
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
      <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-700">
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

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-700">
      <div className="p-8">
        <div className="flex items-center mb-4">
          <span className="bg-red-600 text-red-100 text-xs font-medium px-2.5 py-0.5 rounded">
            บทวิเคราะห์ AI
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4 line-clamp-2">
          {featuredArticle.title}
        </h2>

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
              h4: ({ children }) => (
                <h4 className="text-base font-medium mb-2 text-white mt-3">
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 className="text-sm font-medium mb-2 text-white mt-3">
                  {children}
                </h5>
              ),
              h6: ({ children }) => (
                <h6 className="text-xs font-medium mb-2 text-white mt-3">
                  {children}
                </h6>
              ),
              p: ({ children }) => (
                <p className="mb-4 leading-relaxed text-gray-300">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2 ml-4">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-300 leading-relaxed">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-200">{children}</em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-200 my-4 bg-gray-700/30 py-2 rounded-r">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-700 px-2 py-1 rounded text-sm font-mono text-yellow-300">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-700 p-4 rounded-lg overflow-x-auto mb-4">
                  <code className="text-gray-200 text-sm font-mono">
                    {children}
                  </code>
                </pre>
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
              hr: () => <hr className="border-gray-600 my-6" />,
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-gray-600 rounded-lg">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gray-700">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="bg-gray-800">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="border-b border-gray-600">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2 text-left text-white font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2 text-gray-300">{children}</td>
              ),
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt}
                  className="max-w-full h-auto rounded-lg mb-4"
                />
              ),
            }}
          >
            {featuredArticle.content}
          </ReactMarkdown>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <span className="text-sm text-gray-400">
            วิเคราะห์โดย AI Assistant (บทความที่ให้มาเป็นการสรุปมาจาก AI
            กรุณาใช้วิจารณญาณในการอ่าน)
          </span>
          {featuredArticle.link && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  featuredArticle.link,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              อ่านเพิ่มเติม
            </button>
          )}
        </div>
      </div>
    </div>
  );
}