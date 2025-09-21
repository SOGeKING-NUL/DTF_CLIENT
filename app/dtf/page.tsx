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
import { useTransformedDTFs, useDTF } from '@/hooks/use-dtf-context';
import { DTFTokenTooltip } from '@/components/ui/dtf-token-tooltip';

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

// Enhanced token data with dynamic pricing
const getTokenData = (tokenAddress: string, weight: number) => {
  const tokenMap: { [key: string]: { name: string; symbol: string; logo: string; color: string; price: number; change24h: number } } = {
    '0x0000000000000000000000000000000000000000': { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      logo: 'Ξ', 
      color: 'from-blue-500 to-blue-600',
      price: 3245.67,
      change24h: -1.2
    },
    '0xA0b86a33E6441d8e3C0d0a3b8d0b8d0b8d0b8d0b': { 
      name: 'USD Coin', 
      symbol: 'USDC', 
      logo: '$', 
      color: 'from-green-500 to-green-600',
      price: 1.00,
      change24h: 0.01
    },
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': { 
      name: 'Tether', 
      symbol: 'USDT', 
      logo: '₮', 
      color: 'from-teal-500 to-teal-600',
      price: 1.00,
      change24h: -0.01
    },
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': { 
      name: 'Dai Stablecoin', 
      symbol: 'DAI', 
      logo: '◈', 
      color: 'from-yellow-500 to-yellow-600',
      price: 1.00,
      change24h: 0.02
    },
    '0x31d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0': { 
      name: 'Custom Token', 
      symbol: 'TOKEN', 
      logo: 'T', 
      color: 'from-purple-500 to-purple-600',
      price: 0.45,
      change24h: 5.2
    }
  };

  const tokenInfo = tokenMap[tokenAddress] || {
    name: 'Unknown Token',
    symbol: tokenAddress.slice(0, 6) + '...',
    logo: '?',
    color: 'from-gray-500 to-gray-600',
    price: 0,
    change24h: 0
  };

  return {
    id: Math.random(),
    symbol: tokenInfo.symbol,
    name: tokenInfo.name,
    weight: weight,
    price: tokenInfo.price,
    change24h: tokenInfo.change24h,
    logo: tokenInfo.logo,
    color: tokenInfo.color
  };
};

// Mock tokens data for portfolio calculations
const mockTokens = [
  { id: 1, symbol: "BTC", name: "Bitcoin", balance: "0.5", price: 45000, value: 22500, change24h: 2.5, logo: "₿", color: "from-orange-400 to-orange-600" },
  { id: 2, symbol: "ETH", name: "Ethereum", balance: "2.0", price: 3200, value: 6400, change24h: -1.2, logo: "Ξ", color: "from-blue-400 to-blue-600" },
  { id: 3, symbol: "USDC", name: "USD Coin", balance: "5000", price: 1, value: 5000, change24h: 0.1, logo: "$", color: "from-green-400 to-green-600" }
];

export default function DTFPortfolioDashboard() {
  const wallet = useWallet();
  const { transformedDtfData, loading, error, rawDtfs } = useTransformedDTFs();
  const { refreshDTFs, isInitialized } = useDTF();
  
  console.log('DTFPortfolioDashboard component mounted/rendered');
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
                <Link href="/dtf/earn-yields" className="text-white/70 hover:text-white transition-colors">Earn Yield</Link>
                <Link href="/dtf/create" className="text-white/70 hover:text-white transition-colors">Create New DTF</Link>
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
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
                {!isInitialized ? 'Initializing...' : loading ? 'Loading...' : `${transformedDtfData.length} DTF${transformedDtfData.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <Button
              onClick={refreshDTFs}
              disabled={loading || !isInitialized}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              title="Manually refresh DTF data"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : !isInitialized ? 'Initializing...' : 'Refresh'}
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
                      <th className="px-6 py-4 text-white/70 font-medium">TVL (Last 7 Days)</th>
                      <th className="px-6 py-4 text-white/70 font-medium">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                     {!isInitialized ? (
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
                          <DTFTokenTooltip tokens={dtf.tokens} maxDisplay={5} />
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
      </div>
    </div>
  );
}
