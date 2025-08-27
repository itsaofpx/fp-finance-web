import React from 'react';
import { Calendar, Clock, TrendingUp, TrendingDown, User, Eye } from 'lucide-react';

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
  views: number;
  trending: 'up' | 'down' | null;
}

const mockNews: NewsArticle[] = [
  {
    id: 1,
    title: "SET Index ปิดพุ่ง 2.1% หลังธนาชาติไทยเปลี่ยนแปลงอัตราดอกเบี้ย",
    excerpt: "ตลาดหุ้นไทยปิดบวกแรงหลังจากธนาคารแห่งประเทศไทยประกาศปรับลดอัตราดอกเบี้ยนโยบาย ส่งผลให้นักลงทุนมองบวกต่อหุ้นกลุ่มธนาคารและอสังหาริมทรัพย์",
    author: "วิทยา วิเคราะห์",
    date: "27 ส.ค. 2567",
    readTime: "5 นาที",
    category: "ตลาดหุ้น",
    imageUrl: "/api/placeholder/600/300",
    views: 15420,
    trending: 'up'
  },
  {
    id: 2,
    title: "การลงทุนใน AI และ Tech Stocks: โอกาสและความเสี่ยงในปี 2025",
    excerpt: "วิเคราะห์แนวโน้มการลงทุนในหุ้นเทคโนโลยีและปัญญาประดิษฐ์ที่น่าจับตามองในช่วงครึ่งหลังของปี พร้อมเทคนิคการเลือกหุ้นที่มีศักยภาพ",
    author: "ดร.สมชาย ลงทุน",
    date: "26 ส.ค. 2567",
    readTime: "8 นาที",
    category: "การลงทุน",
    imageUrl: "/api/placeholder/600/300",
    views: 8930,
    trending: 'up'
  },
  {
    id: 3,
    title: "หุ้น Energy ร่วงหนัก หลังราคาน้ำมันดิบปรับตัวลง 5%",
    excerpt: "หุ้นกลุ่มพลังงานในตลาดไทยปรับตัวลงตามราคาน้ำมันโลก นักวิเคราะห์แนะให้รอจังหวะที่เหมาะสมก่อนเข้าลงทุน",
    author: "รัตนา การเงิน",
    date: "25 ส.ค. 2567",
    readTime: "4 นาที",
    category: "พลังงาน",
    imageUrl: "/api/placeholder/600/300",
    views: 6750,
    trending: 'down'
  },
  {
    id: 4,
    title: "5 หุ้นเด่นน่าลงทุนระยะยาวสำหรับผู้เริ่มต้น",
    excerpt: "แนะนำหุ้นคุณภาพที่เหมาะสำหรับนักลงทุนมือใหม่ พร้อมกลยุทธ์การลงทุนแบบ Dollar Cost Averaging ที่ช่วยลดความเสี่ยง",
    author: "ประยุทธ์ หุ้นดี",
    date: "24 ส.ค. 2567",
    readTime: "6 นาที",
    category: "การลงทุน",
    imageUrl: "/api/placeholder/600/300",
    views: 12340,
    trending: null
  },
  {
    id: 5,
    title: "การวิเคราะห์หุ้นด้วย Technical Analysis: คู่มือฉบับสมบูรณ์",
    excerpt: "เรียนรู้เทคนิคการวิเคราะห์ทางเทคนิคแบบเข้าใจง่าย ตั้งแต่การอ่านแผนภูมิ การใช้ indicator ต่างๆ จนถึงการหาจังหวะเข้าซื้อขาย",
    author: "อาจารย์วิชัย เทรดเดอร์",
    date: "23 ส.ค. 2567",
    readTime: "12 นาที",
    category: "เทคนิค",
    imageUrl: "/api/placeholder/600/300",
    views: 9876,
    trending: null
  },
  {
    id: 6,
    title: "แนวโน้มตลาดทองคำ: ยังคงเป็นสินทรัพย์ปลอดภัยหรือไม่?",
    excerpt: "วิเคราะห์ปัจจัยที่ส่งผลต่อราคาทองคำในปัจจุบัน และประเมินความเหมาะสมของการลงทุนในทองคำเป็นส่วนหนึ่งของ portfolio",
    author: "สุดา โกลด์",
    date: "22 ส.ค. 2567",
    readTime: "7 นาที",
    category: "สินค้าโภคภัณฑ์",
    imageUrl: "/api/placeholder/600/300",
    views: 5432,
    trending: 'up'
  }
];

const categories = ["ทั้งหมด", "ตลาดหุ้น", "การลงทุน", "พลังงาน", "เทคนิค", "สินค้าโภคภัณฑ์"];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("ทั้งหมด");
  const [filteredNews, setFilteredNews] = React.useState(mockNews);

  React.useEffect(() => {
    if (selectedCategory === "ทั้งหมด") {
      setFilteredNews(mockNews);
    } else {
      setFilteredNews(mockNews.filter(article => article.category === selectedCategory));
    }
  }, [selectedCategory]);

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      {/* Header Section */}
      <div className="">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-4">ข่าวการลงทุน</h1>
          <p className="text-xl text-gray-300">ติดตามข่าวสารและบทวิเคราะห์ล่าสุดเกี่ยวกับตลาดหุ้นและการลงทุน</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article */}
        <div className="mb-12">
          <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-700">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src={filteredNews[0]?.imageUrl} 
                  alt={filteredNews[0]?.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center mb-4">
                  <span className="bg-red-600 text-red-100 text-xs font-medium px-2.5 py-0.5 rounded">
                    เด่นวันนี้
                  </span>
                  {filteredNews[0]?.trending && (
                    <span className="ml-2">
                      {filteredNews[0].trending === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-4 line-clamp-2">
                  {filteredNews[0]?.title}
                </h2>
                <p className="text-gray-300 mb-4 line-clamp-3">
                  {filteredNews[0]?.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {filteredNews[0]?.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {filteredNews[0]?.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {filteredNews[0]?.readTime}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {formatViews(filteredNews[0]?.views || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.slice(1).map((article) => (
            <article key={article.id} className="bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-700 hover:border-gray-600">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-600 text-blue-100 text-xs font-medium px-2.5 py-0.5 rounded">
                    {article.category}
                  </span>
                  {article.trending && (
                    <span>
                      {article.trending === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {article.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {article.date}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {formatViews(article.views)}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            โหลดข่าวเพิ่มเติม
          </button>
        </div>
      </div>
    </div>
  );
}
