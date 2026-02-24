import {
  ArrowRight,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  PiggyBank,
  Target,
  User,
  Zap,
  Cpu,
  Building2,
  Heart,
  ShoppingCart,
  Home,
  Flame,
  AlertCircle,
  ShoppingBag,
  Phone,
  Truck,
  Bolt,
  Building,
  Globe,
  Pill,
} from "lucide-react";

const tools: ITool[] = [
  {
    title: "เครื่องคำนวณราคาเฉลี่ยหุ้น",
    description: "คำนวณราคาเฉลี่ยของหุ้นเพื่อวางแผนการลงทุนอย่างมีประสิทธิภาพ",
    icon: "📊",
    path: "/tool/average-calculator",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "เครื่องคำนวณดอกเบี้ยทบต้น",
    description: "คำนวณการเติบโตของเงินลงทุนด้วยดอกเบี้ยทบต้นในระยะยาว",
    icon: "💹",
    path: "/tool/compound-interest",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "ตัวช่วยจัดสรรเงิน",
    description: "แบ่งเงินลงทุนและเงินออมอย่างสมดุลตามหลักการเงิน",
    icon: "💰",
    path: "/tool/money-allocation",
    color: "from-purple-500 to-pink-500",
  },
];


const stockCategories: IStockCategory[] = [
  {
    title: "Technology",
    icon: <Cpu className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    tickers: ["AAPL", "MSFT", "GOOGL", "META"],
  },
  {
    title: "Finance",
    icon: <Building2 className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500",
    tickers: ["JPM", "V", "MA", "BRK.B"],
  },
  {
    title: "Healthcare",
    icon: <Heart className="w-6 h-6" />,
    color: "from-red-500 to-pink-500",
    tickers: ["JNJ", "MRK", "PFE", "ABBV"],
  },
  {
    title: "Energy",
    icon: <Bolt className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    tickers: ["XOM", "CVX", "BP", "COP"],
  },
  {
    title: "Electronic Technology",
    icon: <Zap className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    tickers: ["NVDA", "AMD", "AVGO", "AAPL"],
  },
  {
    title: "Technology Services",
    icon: <Cpu className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    tickers: ["MSFT", "GOOGL", "META", "ORCL"],
  },
  {
    title: "Health Technology",
    icon: <Heart className="w-6 h-6" />,
    color: "from-red-500 to-pink-500",
    tickers: ["LLY", "ABBV", "JNJ", "MRK"],
  },
  {
    title: "Retail Trade",
    icon: <ShoppingCart className="w-6 h-6" />,
    color: "from-indigo-500 to-purple-500",
    tickers: ["AMZN", "WMT", "COST", "HD"],
  },
  {
    title: "Consumer Goods",
    icon: <ShoppingBag className="w-6 h-6" />,
    color: "from-pink-500 to-red-500",
    tickers: ["PG", "KO", "PEP", "UL"],
  },
  {
    title: "Utilities",
    icon: <Home className="w-6 h-6" />,
    color: "from-cyan-500 to-blue-500",
    tickers: ["NEE", "DUK", "SO", "EXC"],
  },
  {
    title: "Telecommunications",
    icon: <Phone className="w-6 h-6" />,
    color: "from-purple-500 to-indigo-500",
    tickers: ["VZ", "T", "TMUS", "CHTR"],
  },
  {
    title: "Transportation",
    icon: <Truck className="w-6 h-6" />,
    color: "from-orange-500 to-yellow-500",
    tickers: ["UPS", "FDX", "DAL", "AAL"],
  },
  {
    title: "Real Estate",
    icon: <Building className="w-6 h-6" />,
    color: "from-rose-500 to-pink-500",
    tickers: ["AMT", "PLD", "SPG", "DLR"],
  },
  {
    title: "Materials",
    icon: <Globe className="w-6 h-6" />,
    color: "from-green-500 to-lime-500",
    tickers: ["LIN", "BHP", "RIO", "NEM"],
  },
  {
    title: "Aerospace & Defense",
    icon: <Bolt className="w-6 h-6" />,
    color: "from-gray-500 to-slate-500",
    tickers: ["LMT", "BA", "NOC", "RTX"],
  },
  {
    title: "Pharmaceuticals",
    icon: <Pill className="w-6 h-6" />,
    color: "from-red-500 to-rose-500",
    tickers: ["PFE", "MRK", "JNJ", "ABBV"],
  },
];

export { tools, stockCategories };