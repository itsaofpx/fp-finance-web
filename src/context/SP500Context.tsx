"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────────
export interface StockData {
  ticker: string;
  price: number;
  changePercent: number;
}

interface SP500ContextValue {
  stocks: Record<string, StockData>;
  loading: boolean;
  progress: number;
  error: string | null;
  refetch: () => void;
}

// ── S&P 500 Tickers ──────────────────────────────────────────────────────────
const SP500_TICKERS = [
  "MMM",
  "AOS",
  "ABT",
  "ABBV",
  "ACN",
  "ADBE",
  "AMD",
  "AES",
  "AFL",
  "A",
  "APD",
  "ABNB",
  "AKAM",
  "ALB",
  "ARE",
  "ALGN",
  "ALLE",
  "LNT",
  "ALL",
  "GOOGL",
  "GOOG",
  "MO",
  "AMZN",
  "AMCR",
  "AEE",
  "AAL",
  "AEP",
  "AXP",
  "AIG",
  "AMT",
  "AWK",
  "AMP",
  "AME",
  "AMGN",
  "APH",
  "ADI",
  "ANSS",
  "AON",
  "APA",
  "AAPL",
  "AMAT",
  "APTV",
  "ACGL",
  "ADM",
  "ANET",
  "AJG",
  "AIZ",
  "T",
  "ATO",
  "ADSK",
  "ADP",
  "AZO",
  "AVB",
  "AVY",
  "AXON",
  "BKR",
  "BALL",
  "BAC",
  "BK",
  "BBWI",
  "BAX",
  "BDX",
  "BRK.B",
  "BBY",
  "BIO",
  "TECH",
  "BIIB",
  "BLK",
  "BX",
  "BA",
  "BCH",
  "BSX",
  "BMY",
  "AVGO",
  "BR",
  "BRO",
  "BF.B",
  "BLDR",
  "BG",
  "CDNS",
  "CZR",
  "CPT",
  "CPB",
  "COF",
  "CAH",
  "KMX",
  "CCL",
  "CARR",
  "CTLT",
  "CAT",
  "CBOE",
  "CBRE",
  "CDW",
  "CE",
  "COR",
  "CNC",
  "CNX",
  "CDAY",
  "CF",
  "CRL",
  "SCHW",
  "CHTR",
  "CVX",
  "CMG",
  "CB",
  "CHD",
  "CI",
  "CINF",
  "CTAS",
  "CSCO",
  "C",
  "CFG",
  "CLX",
  "CME",
  "CMS",
  "KO",
  "CTSH",
  "CL",
  "CMCSA",
  "CMA",
  "CAG",
  "COP",
  "ED",
  "STZ",
  "CEG",
  "COO",
  "CPRT",
  "GLW",
  "CTVA",
  "CSGP",
  "COST",
  "CTRA",
  "CCI",
  "CSX",
  "CMI",
  "CVS",
  "DHI",
  "DHR",
  "DRI",
  "DVA",
  "DAY",
  "DECK",
  "DE",
  "DAL",
  "XRAY",
  "DVN",
  "DXCM",
  "FANG",
  "DLR",
  "DFS",
  "DG",
  "DLTR",
  "D",
  "DPZ",
  "DOV",
  "DOW",
  "DTE",
  "DUK",
  "DD",
  "EMN",
  "ETN",
  "EBAY",
  "ECL",
  "EIX",
  "EW",
  "EA",
  "ELV",
  "LLY",
  "EMR",
  "ENPH",
  "ETR",
  "EOG",
  "EPAM",
  "EQT",
  "EFX",
  "EQIX",
  "EQR",
  "ESS",
  "EL",
  "ETSY",
  "EG",
  "EVRG",
  "ES",
  "EXC",
  "EXPE",
  "EXPD",
  "EXR",
  "XOM",
  "FFIV",
  "FDS",
  "FICO",
  "FAST",
  "FRT",
  "FDX",
  "FIS",
  "FITB",
  "FSLR",
  "FE",
  "FI",
  "FMC",
  "F",
  "FTNT",
  "FTV",
  "FOXA",
  "FOX",
  "BEN",
  "FCX",
  "GRMN",
  "IT",
  "GE",
  "GEHC",
  "GEV",
  "GEN",
  "GNRC",
  "GD",
  "GIS",
  "GM",
  "GPC",
  "GILD",
  "GS",
  "HAL",
  "HIG",
  "HAS",
  "HCA",
  "DOC",
  "HSIC",
  "HSY",
  "HES",
  "HPE",
  "HLT",
  "HOLX",
  "HD",
  "HON",
  "HRL",
  "HST",
  "HWM",
  "HPQ",
  "HUBB",
  "HUM",
  "HBAN",
  "HII",
  "IBM",
  "IEX",
  "IDXX",
  "ITW",
  "INCY",
  "IR",
  "PODD",
  "INTC",
  "ICE",
  "IFF",
  "IP",
  "IPG",
  "INTU",
  "ISRG",
  "IVZ",
  "INVH",
  "IQV",
  "IRM",
  "JBHT",
  "JBL",
  "JKHY",
  "J",
  "JNJ",
  "JCI",
  "JPM",
  "JNPR",
  "K",
  "KVUE",
  "KDP",
  "KEY",
  "KEYS",
  "KMB",
  "KIM",
  "KMI",
  "KLAC",
  "KHC",
  "KR",
  "LHX",
  "LH",
  "LRCX",
  "LW",
  "LVS",
  "LDOS",
  "LEN",
  "LII",
  "LIN",
  "LYV",
  "LKQ",
  "LMT",
  "L",
  "LOW",
  "LULU",
  "LYB",
  "MTB",
  "MRO",
  "MPC",
  "MKTX",
  "MAR",
  "MMC",
  "MLM",
  "MAS",
  "MA",
  "MTCH",
  "MKC",
  "MCD",
  "MCK",
  "MDT",
  "MRK",
  "META",
  "MET",
  "MTD",
  "MGM",
  "MCHP",
  "MU",
  "MSFT",
  "MAA",
  "MRNA",
  "MHK",
  "MOH",
  "TAP",
  "MDLZ",
  "MPWR",
  "MNST",
  "MCO",
  "MS",
  "MOS",
  "MSI",
  "MSCI",
  "NDAQ",
  "NTAP",
  "NFLX",
  "NEM",
  "NWSA",
  "NWS",
  "NEE",
  "NKE",
  "NI",
  "NDSN",
  "NSC",
  "NTRS",
  "NOC",
  "NCLH",
  "NRG",
  "NUE",
  "NVDA",
  "NVR",
  "NXPI",
  "ORLY",
  "OXY",
  "ODFL",
  "OMC",
  "ON",
  "OKE",
  "ORCL",
  "OTIS",
  "OGN",
  "PCAR",
  "PKG",
  "PLTR",
  "PH",
  "PAYX",
  "PAYC",
  "PYPL",
  "PNR",
  "PEP",
  "PFE",
  "PCG",
  "PM",
  "PSX",
  "PNW",
  "PBI",
  "POOL",
  "PPG",
  "PPL",
  "PFG",
  "PG",
  "PGR",
  "PLD",
  "PRU",
  "PEG",
  "PTC",
  "PSA",
  "PHM",
  "QRVO",
  "PWR",
  "QCOM",
  "DGX",
  "RL",
  "RJF",
  "RTX",
  "O",
  "REG",
  "REGN",
  "RF",
  "RSG",
  "RMD",
  "RVTY",
  "ROK",
  "ROL",
  "ROP",
  "ROST",
  "RCL",
  "SPGI",
  "CRM",
  "SBAC",
  "SLB",
  "STX",
  "SRE",
  "NOW",
  "SHW",
  "SPG",
  "SWKS",
  "SJM",
  "SNA",
  "SOLV",
  "SO",
  "LUV",
  "SWK",
  "SBUX",
  "STT",
  "STLD",
  "STE",
  "SYK",
  "SYF",
  "SNPS",
  "SYY",
  "TMUS",
  "TROW",
  "TTWO",
  "TPR",
  "TRGP",
  "TGT",
  "TEL",
  "TDY",
  "TFX",
  "TER",
  "TSLA",
  "TXN",
  "TXT",
  "TMO",
  "TJX",
  "TSCO",
  "TT",
  "TDG",
  "TRV",
  "TRMB",
  "TFC",
  "TYL",
  "TSN",
  "USB",
  "UBER",
  "UDR",
  "ULTA",
  "UNP",
  "UAL",
  "UPS",
  "URI",
  "UNH",
  "UHS",
  "VLO",
  "VTR",
  "VRSN",
  "VRSK",
  "VZ",
  "VRTX",
  "VIAV",
  "VST",
  "V",
  "VMC",
  "WRB",
  "GWW",
  "WAB",
  "WBA",
  "WMT",
  "DIS",
  "WBD",
  "WM",
  "WAT",
  "WEC",
  "WFC",
  "WELL",
  "WST",
  "WDC",
  "WY",
  "WMB",
  "WTW",
  "WYNN",
  "XEL",
  "XYL",
  "YUM",
  "ZBRA",
  "ZBH",
  "ZTS",
];

// ── Cache Helpers ────────────────────────────────────────────────────────────
const CACHE_KEY = "sp500_stocks_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCachedStocks(): Record<string, StockData> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedStocks(data: Record<string, StockData>): void {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ data, cachedAt: Date.now() }),
  );
}

const BATCH_SIZE = 20;

async function fetchBatch(tickers: string[]): Promise<StockData[]> {
  const results = await Promise.allSettled(
    tickers.map((ticker) =>
      fetch(`http://localhost:3001/stock/data?ticker=${ticker}`)
        .then((r) => r.json())
        .then((r) => (r.success && r.data ? (r.data as StockData) : null)),
    ),
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<StockData> =>
        r.status === "fulfilled" && r.value !== null,
    )
    .map((r) => r.value);
}

// ── Context ──────────────────────────────────────────────────────────────────
const SP500Context = createContext<SP500ContextValue | null>(null);

export function SP500Provider({ children }: { children: React.ReactNode }) {
  const [stocks, setStocks] = useState<Record<string, StockData>>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false); // prevent double-fetch in StrictMode

  const fetchAll = useCallback(async (bustCache = false) => {
    if (bustCache) localStorage.removeItem(CACHE_KEY);

    const cached = getCachedStocks();
    if (cached) {
      setStocks(cached);
      setProgress(100);
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);

    const allStocks: Record<string, StockData> = {};
    const batches: string[][] = [];
    for (let i = 0; i < SP500_TICKERS.length; i += BATCH_SIZE) {
      batches.push(SP500_TICKERS.slice(i, i + BATCH_SIZE));
    }

    try {
      for (let i = 0; i < batches.length; i++) {
        const batchData = await fetchBatch(batches[i]);
        batchData.forEach((s) => {
          allStocks[s.ticker] = s;
        });
        // Stream results progressively so pages can render partial data
        setStocks((prev) => ({ ...prev, ...allStocks }));
        setProgress(Math.round(((i + 1) / batches.length) * 100));
      }
      setCachedStocks(allStocks);
    } catch (err) {
      setError("Failed to fetch S&P 500 stock data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => fetchAll(true), [fetchAll]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchAll();
  }, [fetchAll]);

  return (
    <SP500Context.Provider
      value={{ stocks, loading, progress, error, refetch }}
    >
      {children}
    </SP500Context.Provider>
  );
}

export function useSP500() {
  const ctx = useContext(SP500Context);
  if (!ctx) throw new Error("useSP500 must be used inside <SP500Provider>");
  return ctx;
}
