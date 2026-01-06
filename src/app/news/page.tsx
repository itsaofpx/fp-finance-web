"use client";

import { useEffect, useState } from "react";
import React from "react";
import axios from "axios";
import { Calendar, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import FeaturedArticleComponent from "@/components/Article/featuredArticle";

interface AINewsArticle {
  title: string;
  content: string;
  link?: string;
}

interface APINewsArticle {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  url: string;
  estimatedReadTime: number;
  source: string;
}

interface NewsResponse {
  current_page: number;
  data: APINewsArticle[];
  pages: number;
  per_page: number;
  total: number;
}

export default function NewsPage() {
  const [news, setNews] = useState<APINewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<AINewsArticle | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMoreNews, setHasMoreNews] = useState(true);

  const fetchFeaturedArticle = async () => {
    try {
      setFeaturedLoading(true);
      setFeaturedError(null);

      const response = await axios.get<AINewsArticle>(
        "http://localhost:3002/news/prompt/latest"
      );

      if (!response.data.content) {
        throw new Error("ไม่พบเนื้อหาบทความ");
      }

      setFeaturedArticle(response.data);
    } catch (err) {
      console.error("Error fetching featured article:", err);
      setFeaturedError(
        err instanceof Error ? err.message : "ไม่สามารถโหลดบทความเด่นได้"
      );
    } finally {
      setFeaturedLoading(false);
    }
  };

  const fetchNews = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      const response = await axios.get<NewsResponse>(
        `http://localhost:3002/news/?page=${page}&per_page=10`
      );

      const newsData = response.data;

      if (append) {
        setNews((prevNews) => [...prevNews, ...newsData.data]);
      } else {
        setNews(newsData.data);
      }

      setCurrentPage(newsData.current_page);
      setTotalPages(newsData.pages);
      setHasMoreNews(newsData.current_page < newsData.pages);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNews(1, false);
    fetchFeaturedArticle();
  }, []);

  const loadMoreNews = async () => {
    if (!hasMoreNews || loadingMore) return;

    const nextPage = currentPage + 1;
    await fetchNews(nextPage, true);
  };

  const handleArticleClick = (url: string) => {
    window.open(url, "_blank");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };


  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      {/* Header Section */}
      <div className="">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-4">ข่าวการลงทุน</h1>
          <p className="text-xl text-gray-300">
            ติดตามข่าวสารและบทวิเคราะห์ล่าสุดเกี่ยวกับตลาดหุ้นและการลงทุน
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Featured Article Section */}
        <div className="mb-12">
          <FeaturedArticleComponent
            featuredArticle={featuredArticle}
            featuredLoading={featuredLoading}
            featuredError={featuredError}
            onRetry={fetchFeaturedArticle}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-white">กำลังโหลด...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-500">Error: {error}</div>
            <button
              onClick={() => fetchNews(1, false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 gap-6">
            {news.map((article) => (
              <article
                key={article.id}
                className="bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-700 hover:border-gray-600"
                onClick={() => handleArticleClick(article.url)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-blue-600 text-blue-100 text-xs font-medium px-2.5 py-0.5 rounded">
                      {article.source}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(article.publishedAt)}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.estimatedReadTime} นาที
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && !error && hasMoreNews && (
          <div className="text-center mt-12">
            <button
              className={`bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors ${
                loadingMore ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={loadMoreNews}
              disabled={loadingMore}
            >
              {loadingMore ? "กำลังโหลด..." : "โหลดข่าวเพิ่มเติม"}
            </button>
          </div>
        )}

        {/* No more news message */}
        {!loading && !error && !hasMoreNews && news.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-400">ไม่มีข่าวเพิ่มเติมแล้ว</p>
          </div>
        )}

        {/* Pagination info */}
        {!loading && !error && news.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              หน้า {currentPage} จาก {totalPages} ({news.length} ข่าว)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
