interface INewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  estimatedReadTime: number;
}

interface INewsResponse {
  data: INewsArticle[];
}

interface IStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  market_cap?: number;
  sector?: string;
}

interface ITool {
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

interface IRetirementPlan {
  id: string;
  name: string;
  currentAge: number;
  retirementAge: number;
  planType: string;
  money: string;
  currentSavings: string;
  expectedReturn: string;
  inflationRate: string;
  retirementYears: number;
  accountId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface IAccount {
  email: string;
  id: string;
  googleId: string;
  givenName: string;
}

interface IStockCategory {
  title: string;
  icon: React.ReactNode;
  color: string;
  tickers: string[];
}
