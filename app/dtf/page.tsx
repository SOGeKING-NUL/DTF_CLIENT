"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  Plus,
  Bell,
  Search,
  Sun,
  Play,
  ChevronDown,
  ArrowUp,
  Globe,
  Shield,
  Layers,
  CircleDot,
  Grid3X3,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PriceTicker from "@/components/web3/price-ticker";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { DTFLookup } from '@/components/dtf/dtf-lookup';
import { useWallet } from '@/hooks/use-wallet';
import { useDTFFactory } from '@/lib/dtf-contract';
import { ethers } from 'ethers';
import DTFFACTORY_ABI from '@/DTF/abi/DTFFactory';

// DTF data interface
interface DTFData {
  dtfAddress: string;
  creator: string;
  name: string;
  symbol: string;
  tokens: string[];
  weights: number[];
  createdAt: number;
  active: boolean;
}

// Mock data for the chart
const chartData = [
  { time: 'Jan', value: 200000000 },
  { time: 'Feb', value: 220000000 },
  { time: 'Mar', value: 250000000 },
  { time: 'Apr', value: 280000000 },
  { time: 'May', value: 320000000 },
  { time: 'Jun', value: 380000000 },
  { time: 'Jul', value: 420000000 },
  { time: 'Aug', value: 480000000 },
  { time: 'Sep', value: 543018524 },
];

// Helper function to get token symbol
const getTokenSymbol = (tokenAddress: string) => {
  if (tokenAddress === '0x0000000000000000000000000000000000000000') return 'ETH';
  const tokenMap: { [key: string]: string } = {
    '0xA0b86a33E6441d8e3C0d0a3b8d0b8d0b8d0b8d0b': 'USDC',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
    '0x31d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0': 'TOKEN', // Example for the token in your image
  };
  return tokenMap[tokenAddress] || tokenAddress.slice(0, 6) + '...';
};

// Mock data for DTF table (will be replaced with real data)
const mockDtfData = [
  {
    id: 1,
    name: "Open Stablecoin Index",
    ticker: "$OPEN",
    backing: ["USDC", "USDT", "DAI", "FRAX", "LUSD"],
    tags: ["Stablecoins", "DeFi", "Majors", "Ecosystem"],
    performance: -6.32,
    price: 1.53499,
    marketCap: 914253,
    icon: "R",
    color: "bg-blue-500"
  },
  {
    id: 2,
    name: "Bloomberg Galaxy Crypto Index",
    ticker: "$BGCI",
    backing: ["BTC", "ETH", "ADA", "SOL", "DOT"],
    tags: ["Majors", "Bitcoin", "L1"],
    performance: -2.23,
    price: 3.70671,
    marketCap: 623426,
    icon: "B",
    color: "bg-orange-500"
  },
  {
    id: 3,
    name: "Clanker Index",
    ticker: "$CLX",
    backing: ["DOGE", "SHIB", "PEPE"],
    tags: ["Memes", "SocialFi"],
    performance: -10.64,
    price: 1.62398,
    marketCap: 479198,
    icon: "C",
    color: "bg-purple-500"
  },
  {
    id: 4,
    name: "Alpha Base Index",
    ticker: "$ABX",
    backing: ["ETH", "USDC", "BASE"],
    tags: ["AI", "RWA", "DeFi", "Memes"],
    performance: -9.60,
    price: 0.00259,
    marketCap: 451763,
    icon: "A",
    color: "bg-green-500"
  },
  {
    id: 5,
    name: "MarketVector Token Terminal Fundamental Index",
    ticker: "$MVTT10F",
    backing: ["ETH", "UNI", "AAVE", "COMP"],
    tags: ["Majors", "L1", "DeFi", "Bitcoin"],
    performance: -2.56,
    price: 0.05006,
    marketCap: 408123,
    icon: "M",
    color: "bg-red-500"
  },
  {
    id: 6,
    name: "BTC ETH DCA Index",
    ticker: "$BED",
    backing: ["BTC", "ETH"],
    tags: ["Majors", "Bitcoin", "DeFi", "Stablecoins"],
    performance: -1.44,
    price: 1.35802,
    marketCap: 318456,
    icon: "B",
    color: "bg-yellow-500"
  },
  {
    id: 7,
    name: "DeFi Growth Index",
    ticker: "$DGI",
    backing: ["UNI", "AAVE", "COMP", "MKR"],
    tags: ["DeFi"],
    performance: -7.60,
    price: 1.16169,
    marketCap: 205789,
    icon: "D",
    color: "bg-indigo-500"
  },
  {
    id: 8,
    name: "Imagine The SMEL",
    ticker: "$SMEL",
    backing: ["ETH", "USDC", "stETH"],
    tags: ["DeFi", "Stablecoins", "LST"],
    performance: -3.31,
    price: 1.10882,
    marketCap: 188234,
    icon: "S",
    color: "bg-pink-500"
  },
  {
    id: 9,
    name: "RWA Index",
    ticker: "$RWA",
    backing: ["RWA", "USDC", "USDT"],
    tags: ["RWA"],
    performance: -8.22,
    price: 0.98765,
    marketCap: 197542,
    icon: "R",
    color: "bg-teal-500"
  }
];

// Mock data for featured DTFs
const featuredDTFs = [
  {
    name: "Bloomberg Galaxy Crypto Index",
    ticker: "$BGCI",
    description: "Professional crypto index tracking",
    gradient: "from-yellow-500/20 to-orange-500/20",
    border: "border-yellow-500/30",
    bgPattern: "bg-yellow-500/10"
  },
  {
    name: "Virtual INDEX",
    ticker: "$VIRTUAL",
    description: "Virtual world asset exposure",
    gradient: "from-green-500/20 to-blue-500/20",
    border: "border-green-500/30",
    bgPattern: "bg-green-500/10"
  },
  {
    name: "CoinDesk DeFi Select Index",
    ticker: "$CDSI",
    description: "Curated DeFi token selection",
    gradient: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
    bgPattern: "bg-blue-500/10"
  }
];

// Mock tokens data for portfolio calculations
const mockTokens = [
  { id: 1, symbol: "BTC", name: "Bitcoin", balance: "0.5", price: 45000, value: 22500, change24h: 2.5, logo: "₿", color: "from-orange-400 to-orange-600" },
  { id: 2, symbol: "ETH", name: "Ethereum", balance: "2.0", price: 3200, value: 6400, change24h: -1.2, logo: "Ξ", color: "from-blue-400 to-blue-600" },
  { id: 3, symbol: "USDC", name: "USD Coin", balance: "5000", price: 1, value: 5000, change24h: 0.1, logo: "$", color: "from-green-400 to-green-600" }
];

export default function DTFPortfolioDashboard() {
  const wallet = useWallet();
  const factoryService = useDTFFactory(wallet.provider, wallet.signer || undefined);
  
  console.log('DTFPortfolioDashboard component mounted/rendered');
  
  // State for DTF data
  const [dtfData, setDtfData] = useState<DTFData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  // Ref to track if we've already fetched data to prevent multiple calls
  const hasFetchedData = useRef(false);
  const isInitialized = useRef(false);

  // Fetch all DTFs when factory service and provider are available
  useEffect(() => {
    console.log('useEffect triggered - checking fetch conditions...');
    console.log('hasFetchedData.current:', hasFetchedData.current);
    console.log('factoryService:', !!factoryService);
    console.log('wallet.provider:', !!wallet.provider);
    console.log('wallet.isConnected:', wallet.isConnected);
    
    // Only fetch if we haven't fetched yet and not currently loading
    if (hasFetchedData.current || loading) {
      console.log('Skipping fetch - already fetched or currently loading');
      return;
    }
    
    console.log('Starting DTF fetch...');
    
    const fetchDTFs = async () => {
      try {
        hasFetchedData.current = true;
        setInitializing(false);
        setLoading(true);
        setError(null);

        console.log('Fetching all DTFs from factory...');
        
        // Create contract instance directly with timeout
        const DTF_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_DTF_FACTORY_ADDRESS || "0xDA099Db187399f501bA3Dccf688DEd37fc66dF6e";
        
        // Use wallet provider or fallback to custom RPC
        let provider: any = wallet.provider;
        if (!provider) {
          console.log('Using fallback provider...');
          const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.unichain.org';
          provider = new ethers.JsonRpcProvider(rpcUrl);
        }
        
        const factoryContract = new ethers.Contract(DTF_FACTORY_ADDRESS, DTFFACTORY_ABI, provider);
        
        console.log('Contract created, calling getAllDTFs...');
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
        });
        
        const dtfsPromise = factoryContract.getAllDTFs();
        const dtfs = await Promise.race([dtfsPromise, timeoutPromise]);
        
        console.log('Raw DTFs from contract:', dtfs);
        
        // Transform the data
        const allDTFs = dtfs.map((dtf: any) => ({
          dtfAddress: dtf.dtfAddress,
          creator: dtf.creator,
          name: dtf.name,
          symbol: dtf.symbol,
          tokens: dtf.tokens,
          weights: dtf.weights.map((weight: any) => Number(weight) / 100), // Convert from basis points to percentage
          createdAt: Number(dtf.createdAt),
          active: dtf.active
        }));
        
        console.log('Transformed DTFs:', allDTFs);
        console.log('Number of DTFs found:', allDTFs.length);
        
        setDtfData(allDTFs);
      } catch (err: any) {
        console.error('Error fetching DTFs:', err);
        console.error('Error details:', {
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        setError(err.message || 'Failed to fetch DTF data');
        hasFetchedData.current = false; // Reset on error so user can retry
      } finally {
        setLoading(false);
      }
    };

    fetchDTFs();
  }, [wallet.provider, loading]); // Re-run when dependencies change

  // Reset fetch state when wallet disconnects/reconnects
  useEffect(() => {
    if (!wallet.isConnected) {
      // If wallet disconnects, reset the fetch state
      hasFetchedData.current = false;
      isInitialized.current = false;
      setDtfData([]); // Clear data when wallet disconnects
      setInitializing(true); // Reset initialization state
    }
  }, [wallet.isConnected]);

  // Refresh DTF data (manual refresh)
  const refreshDTFs = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Manual refresh: Fetching DTF data...');
      
      // Create contract instance directly
      const DTF_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_DTF_FACTORY_ADDRESS || "0xDA099Db187399f501bA3Dccf688DEd37fc66dF6e";
      
      // Use wallet provider or fallback to custom RPC
      let provider: any = wallet.provider;
      if (!provider) {
        console.log('Using fallback provider for refresh...');
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.unichain.org';
        provider = new ethers.JsonRpcProvider(rpcUrl);
      }
      
      const factoryContract = new ethers.Contract(DTF_FACTORY_ADDRESS, DTFFACTORY_ABI, provider);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });
      
      const dtfsPromise = factoryContract.getAllDTFs();
      const dtfs = await Promise.race([dtfsPromise, timeoutPromise]);
      
      // Transform the data
      const allDTFs = dtfs.map((dtf: any) => ({
        dtfAddress: dtf.dtfAddress,
        creator: dtf.creator,
        name: dtf.name,
        symbol: dtf.symbol,
        tokens: dtf.tokens,
        weights: dtf.weights.map((weight: any) => Number(weight) / 100), // Convert from basis points to percentage
        createdAt: Number(dtf.createdAt),
        active: dtf.active
      }));
      
      console.log('Refreshed DTFs:', allDTFs);
      setDtfData(allDTFs);
      hasFetchedData.current = true; // Update the ref since we have fresh data
    } catch (err: any) {
      console.error('Error refreshing DTFs:', err);
      setError(err.message || 'Failed to refresh DTF data');
    } finally {
      setLoading(false);
    }
  };

  // Transform DTF data for display
  const transformedDtfData = dtfData.map((dtf, index) => ({
    id: index + 1,
    name: dtf.name,
    ticker: `$${dtf.symbol}`,
    backing: dtf.tokens.map(token => getTokenSymbol(token)),
    tags: ['DTF'], // You can add more sophisticated tag logic here
    performance: 0, // Placeholder - you might want to calculate this from price data
    price: 1.0, // Placeholder - you might want to get actual price data
    marketCap: 0, // Placeholder - you might want to calculate this
    icon: dtf.name.charAt(0).toUpperCase(),
    color: `bg-${['blue', 'green', 'purple', 'red', 'yellow', 'indigo', 'pink', 'teal'][index % 8]}-500`,
    dtfAddress: dtf.dtfAddress,
    creator: dtf.creator,
    createdAt: dtf.createdAt,
    active: dtf.active
  }));
  const [activeCategory, setActiveCategory] = useState('Index DTFs');
  const [activeChain, setActiveChain] = useState('All chains');
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const categories = [
    { name: 'Index DTFs', description: 'Get easy exposure to narratives, indexes, and ecosystems', icon: Globe },
    { name: 'Yield DTFs', description: 'Earn yield safely with diversified DeFi positions', icon: Shield },
    { name: 'Stablecoins', description: 'Overcollateralized tokens pegged to the US dollar', icon: Layers }
  ];

  const chains = [
    { name: 'All chains', icon: Grid3X3 },
    { name: 'Ethereum', icon: CircleDot },
    { name: 'Base', icon: CircleDot }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              <h1 className="text-xl sm:text-2xl font-bold">OSMO</h1>
              <nav className="hidden lg:flex items-center gap-6">
                <Link href="/discover-yield" className="text-blue-400 font-medium">Discover DTFs</Link>
                <Link href="/earn-yields" className="text-white/70 hover:text-white transition-colors">Earn Yield</Link>
                <Link href="create" className="text-white/70 hover:text-white transition-colors">Create New DTF</Link>
                {/* <Link href="#" className="text-white/70 hover:text-white transition-colors flex items-center gap-1">
                  More <ChevronDown className="w-4 h-4" />
                </Link> */}
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              </button>
              <appkit-button />
            </div>
          </div>
        </div>
      </header>

      {/* Price Ticker */}
      <div className="sticky top-0 z-40">
        {/* <PriceTicker /> */}
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* TVL Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">TVL in OSMO</h2>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold">$543,018,524</div>
            <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
              <ArrowUp className="w-4 h-4 text-green-400" />
            </div>
          </div>

          <p className="text-white/70 mb-6">Annualized protocol revenue: $14.7M</p>

          <div className="mb-6">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Play className="w-4 h-4 mr-2" />
              What are DTFs?
            </Button>
          </div>

          {/* Chart */}
          <div className="h-64 bg-white/5 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                  formatter={(value: any) => [formatCurrency(value), 'TVL']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Featured DTFs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Featured DTFs</h2>
            <div className="w-24 h-0.5 bg-white/20 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDTFs.map((dtf, index) => (
              <motion.div
                key={dtf.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="group"
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/20 hover:border-white/40 transition-all duration-300 h-full">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{dtf.name}</h3>
                      <p className="text-white/70 text-sm mb-4">{dtf.description}</p>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* DTF Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-300",
                    activeCategory === category.name
                      ? "bg-white/10 border-white/30"
                      : "bg-white/5 border-white/20 hover:bg-white/8"
                  )}
                  onClick={() => setActiveCategory(category.name)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-white/10">
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{category.name}</h3>
                        <p className="text-white/70 text-sm mt-1">{category.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <Input
                placeholder="Search by name, ticker, tag or collateral"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {chains.map((chain, index) => (
                <Button
                  key={chain.name}
                  variant={activeChain === chain.name ? "default" : "outline"}
                  className={cn(
                    "flex items-center gap-2",
                    activeChain === chain.name
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-white/5 border-white/20 text-white hover:bg-white/10"
                  )}
                  onClick={() => setActiveChain(chain.name)}
                >
                  <chain.icon className="w-4 h-4" />
                  {chain.name}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* DTF Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">All DTFs</h2>
              <p className="text-white/70 text-sm">
                {initializing ? 'Initializing...' : loading ? 'Loading...' : `${dtfData.length} DTF${dtfData.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <Button
              onClick={refreshDTFs}
              disabled={loading || initializing}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              title="Manually refresh DTF data"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : initializing ? 'Initializing...' : 'Refresh'}
            </Button>
          </div>
          
          <Card className="bg-white/5 backdrop-blur-sm border-white/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr className="text-left">
                      <th className="px-6 py-4 text-white/70 font-medium">Name</th>
                      <th className="px-6 py-4 text-white/70 font-medium">Backing</th>
                      <th className="px-6 py-4 text-white/70 font-medium">Tags</th>
                      <th className="px-6 py-4 text-white/70 font-medium">Performance (Last 7 Days)</th>
                      <th className="px-6 py-4 text-white/70 font-medium">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                     {initializing ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-12 text-center">
                           <div className="flex flex-col items-center justify-center gap-4">
                             <div className="w-8 h-8 border-3 border-white/20 border-t-blue-400 rounded-full animate-spin"></div>
                             <div className="text-center">
                               <p className="text-white/90 font-medium">Initializing DTF data fetch...</p>
                               <p className="text-white/60 text-sm mt-1">Setting up connection to factory contract</p>
                             </div>
                           </div>
                         </td>
                       </tr>
                     ) : loading ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-12 text-center">
                           <div className="flex flex-col items-center justify-center gap-4">
                             <div className="w-8 h-8 border-3 border-white/20 border-t-blue-400 rounded-full animate-spin"></div>
                             <div className="text-center">
                               <p className="text-white/90 font-medium">Loading DTFs from factory contract...</p>
                               <p className="text-white/60 text-sm mt-1">Please wait while we fetch the data</p>
                             </div>
                           </div>
                         </td>
                       </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <div className="text-red-400">
                            <p>Error loading DTFs: {error}</p>
                            <p className="text-sm text-white/70 mt-2">
                              Make sure your wallet is connected and try refreshing the page.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : transformedDtfData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <div className="text-white/70">
                            <p>No DTFs found.</p>
                            <p className="text-sm mt-2">
                              DTFs will appear here once they are created through the factory contract.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transformedDtfData.map((dtf, index) => (
                      <motion.tr
                        key={dtf.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => window.open(`/dtf/${dtf.dtfAddress}`, '_blank')}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                              dtf.color
                            )}>
                              {dtf.icon}
                            </div>
                            <div>
                              <div className="font-medium text-white">{dtf.name}</div>
                              <div className="text-white/70 text-sm">{dtf.ticker}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            {dtf.backing.slice(0, 5).map((asset, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white"
                              >
                                {asset.charAt(0)}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {dtf.tags.map((tag, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs bg-white/10 border-white/20 text-white/80"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "text-sm font-medium",
                              dtf.performance >= 0 ? "text-green-400" : "text-red-400"
                            )}>
                              {formatPercentage(dtf.performance)}
                            </div>
                            <div className="text-white/70 text-sm">
                              (${dtf.price.toFixed(5)})
                            </div>
                          </div>
                          <div className="w-16 h-8 bg-gradient-to-r from-red-500 to-green-500 rounded opacity-20 mt-1"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">
                            {formatCompactCurrency(dtf.marketCap)}
                          </div>
                        </td>
                      </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* DTF Lookup Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">DTF Lookup</h2>
            <div className="w-24 h-0.5 bg-white/20 mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <DTFLookup />
          </div>
        </motion.div>

        {/* Static DTF Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">DTF Platform</h2>
            <div className="w-24 h-0.5 bg-white/20 mx-auto"></div>
          </div>
          
          <div className="max-w-6xl mx-auto space-y-8">
            <Card className="bg-white/5 backdrop-blur-sm border-white/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-white">Welcome to OSMO DTF Platform</h3>
                <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                  Discover and invest in diversified token funds (DTFs) that provide exposure to multiple assets in a single token. 
                  Our platform offers professional-grade crypto index tracking with built-in yield optimization.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Diversified Exposure</h4>
                    <p className="text-sm text-white/70">Get exposure to multiple tokens in a single investment</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Risk Management</h4>
                    <p className="text-sm text-white/70">Built-in risk diversification across multiple assets</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layers className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Professional Indexes</h4>
                    <p className="text-sm text-white/70">Access professionally curated token portfolios</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
