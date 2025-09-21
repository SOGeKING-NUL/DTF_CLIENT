"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { ethers } from 'ethers';
import DTF_ABI from "@/DTF/abi/DTF";
import { DTFContractService } from '@/lib/dtf-contract';

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

interface DTFCard {
  dtfAddress: string;
  creator: string;
  name: string;
  symbol: string;
  tokens: string[];
  weights: number[];
  createdAt: number;
  active: boolean;
}

export default function DTFPortfolioDashboard() {
  const wallet = useWallet();
  const { transformedDtfData, loading, error, rawDtfs } = useTransformedDTFs();
  const { refreshDTFs, isInitialized } = useDTF();
  const [allDTFs, setAllDTFs] = useState<DTFCard[]>([]);

  console.log('DTFPortfolioDashboard component mounted/rendered');
  const [activeCategory, setActiveCategory] = useState('Index DTFs');
  const [activeChain, setActiveChain] = useState('All chains');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search by name"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Escape to clear search
      if (event.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // TVL state
  const [totalTVL, setTotalTVL] = useState<string>('0');
  const [tvlLoading, setTvlLoading] = useState(false);
  const [tvlError, setTvlError] = useState<string | null>(null);

  // Individual DTF TVL state
  const [dtfTVLs, setDtfTVLs] = useState<{ [key: string]: string }>({});
  const [dtfTvlLoading, setDtfTvlLoading] = useState<{ [key: string]: boolean }>({});
  const [dtfTvlError, setDtfTvlError] = useState<{ [key: string]: string | null }>({});

  // Set allDTFs from rawDtfs (integrating the allDTFs functionality for stats)
  useEffect(() => {
    if (rawDtfs) {
      setAllDTFs(rawDtfs);
    }
  }, [rawDtfs]);

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

  // Function to fetch total TVL from all DTF contracts
  const fetchTotalTVL = async () => {
    if (!rawDtfs || rawDtfs.length === 0) {
      console.log('No DTFs available for TVL calculation');
      return;
    }

    console.log('Starting TVL fetch for', rawDtfs.length, 'DTFs');
    setTvlLoading(true);
    setTvlError(null);

    try {
      let totalTvlWei = BigInt(0);

      // Use wallet provider or fallback to custom RPC
      let provider: any = wallet.provider;
      if (!provider) {
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.unichain.org';
        provider = new ethers.JsonRpcProvider(rpcUrl);
      }

      // Fetch TVL from each DTF contract
      for (const dtf of rawDtfs) {
        try {

          const dtfService = new DTFContractService(provider, undefined, dtf.dtfAddress);

          let tvlEth: string | null = null;

          try {
            tvlEth = await dtfService.getTotalEthLocked();
            console.log(`TVL (ETH locked) for ${dtf.name}: ${tvlEth} ETH`);
          } catch (ethLockedError) {
            console.warn(`getTotalEthLocked failed for ${dtf.name}:`, ethLockedError);

            try {
              tvlEth = await dtfService.getCurrentPortfolioValue();
              console.log(`TVL (portfolio value) for ${dtf.name}: ${tvlEth} ETH`);
            } catch (portfolioError) {
              console.warn(`getCurrentPortfolioValue failed for ${dtf.name}:`, portfolioError);

              try {
                const contractBalance = await provider.getBalance(dtf.dtfAddress);
                tvlEth = ethers.formatEther(contractBalance);
                console.log(`TVL (contract balance) for ${dtf.name}: ${tvlEth} ETH`);
              } catch (balanceError) {
                continue;
              }
            }
          }

          if (!tvlEth) {
            console.warn(`No TVL data available for ${dtf.name}, skipping`);
            continue;
          }

          const tvlWeiBigInt = ethers.parseEther(tvlEth);
          totalTvlWei += tvlWeiBigInt;
        } catch (error) {
          console.error(`Error fetching TVL for DTF ${dtf.dtfAddress}:`, error);
        }
      }

      // Convert to formatted string
      const totalTvlEth = ethers.formatEther(totalTvlWei);
      console.log('Total TVL calculated:', totalTvlEth, 'ETH');
      setTotalTVL(totalTvlEth);
    } catch (error) {
      console.error('Error fetching total TVL:', error);
      setTvlError('Failed to fetch TVL data');
    } finally {
      setTvlLoading(false);
    }
  };

  // Function to fetch TVL for individual DTF
  const fetchDTFTVL = async (dtfAddress: string) => {
    setDtfTvlLoading(prev => ({ ...prev, [dtfAddress]: true }));
    setDtfTvlError(prev => ({ ...prev, [dtfAddress]: null }));

    try {
      // Use wallet provider or fallback to custom RPC
      let provider: any = wallet.provider;
      if (!provider) {
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.unichain.org';
        provider = new ethers.JsonRpcProvider(rpcUrl);
      }

      // Ensure provider can handle transactions for getCurrentPortfolioValue
      if (provider && !provider._isSigner && !provider.getSigner) {
        console.warn('Provider may not support transactions, some TVL calculations might fail');
      }

      console.log(`Fetching TVL for DTF: ${dtfAddress}`);

      // Use DTFContractService for better error handling and formatting
      const dtfService = new DTFContractService(provider, undefined, dtfAddress);

      // Try multiple approaches for TVL calculation
      let tvlEth: string | null = null;

      // First, try getTotalEthLocked (view function, most reliable)
      try {
        tvlEth = await dtfService.getTotalEthLocked();
        console.log(`TVL (ETH locked) for DTF ${dtfAddress}: ${tvlEth} ETH`);
      } catch (ethLockedError) {
        console.warn(`getTotalEthLocked failed for ${dtfAddress}:`, ethLockedError);

        // Second, try getCurrentPortfolioValue (requires transaction for price lookups)
        try {
          tvlEth = await dtfService.getCurrentPortfolioValue();
          console.log(`TVL (portfolio value) for DTF ${dtfAddress}: ${tvlEth} ETH`);
        } catch (portfolioError) {
          console.warn(`getCurrentPortfolioValue failed for ${dtfAddress}:`, portfolioError);

          // Last resort: try to get contract ETH balance
          try {
            const contractBalance = await provider.getBalance(dtfAddress);
            tvlEth = ethers.formatEther(contractBalance);
            console.log(`TVL (contract balance) for DTF ${dtfAddress}: ${tvlEth} ETH`);
          } catch (balanceError) {
            console.error(`All TVL methods failed for ${dtfAddress}:`, balanceError);
            throw balanceError;
          }
        }
      }

      if (tvlEth) {
        setDtfTVLs(prev => ({ ...prev, [dtfAddress]: tvlEth }));
      }
    } catch (error) {
      console.error(`Error fetching TVL for DTF ${dtfAddress}:`, error);

      // Set a more descriptive error message
      let errorMessage = 'Failed to fetch TVL';
      if (error instanceof Error) {
        if (error.message.includes('UNSUPPORTED_OPERATION')) {
          errorMessage = 'Network not supported';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network connection issue';
        } else if (error.message.includes('transaction')) {
          errorMessage = 'Transaction not supported';
        }
      }

      setDtfTvlError(prev => ({ ...prev, [dtfAddress]: errorMessage }));
    } finally {
      setDtfTvlLoading(prev => ({ ...prev, [dtfAddress]: false }));
    }
  };

  // Function to fetch TVL for all DTFs
  const fetchAllDTFTVLs = async () => {
    if (!rawDtfs || rawDtfs.length === 0) return;

    console.log('Fetching TVL for all DTFs...');
    for (const dtf of rawDtfs) {
      await fetchDTFTVL(dtf.dtfAddress);
    }
  };

  // Fetch TVL when DTF data is available
  useEffect(() => {
    if (rawDtfs && rawDtfs.length > 0 && !loading && !error) {
      fetchTotalTVL();
      fetchAllDTFTVLs();
    }
  }, [rawDtfs, loading, error, wallet.provider]);

  // Format TVL for display
  const formatTVLDisplay = (tvl: string) => {
    const tvlNum = parseFloat(tvl);
    if (tvlLoading) return 'Loading...';
    if (tvlError) return 'Error loading TVL';
    if (tvlNum === 0) return '$0';

    return formatCurrency(tvlNum);
  };

  // Format TVL for display with loading spinner
  const renderTVLDisplay = () => {
    if (tvlLoading) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span>Loading TVL...</span>
        </div>
      );
    }

    if (tvlError) {
      return (
        <div className="flex items-center gap-2 text-red-400">
          <span>Error loading TVL</span>
        </div>
      );
    }

    return formatCurrency(parseFloat(totalTVL));
  };

  // Format individual DTF TVL display
  const renderDTFTVLDisplay = (dtfAddress: string) => {
    const isLoading = dtfTvlLoading[dtfAddress];
    const error = dtfTvlError[dtfAddress];
    const tvl = dtfTVLs[dtfAddress];

    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-white/70 text-sm">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-400 text-sm" title={`Error: ${error}`}>
          {error}
        </div>
      );
    }

    if (!tvl || tvl === '0') {
      return (
        <div className="text-white/50 text-sm">
          $0
        </div>
      );
    }

    return (
      <div className="text-white font-medium" title={`TVL: ${formatCurrency(parseFloat(tvl))} ETH`}>
        {formatCurrency(parseFloat(tvl))}
      </div>
    );
  };


  // Filter and search DTFs
  const filteredDTFData = useMemo(() => {
    if (!transformedDtfData) return [];

    return transformedDtfData.filter(dtf => {
      // Search functionality
      const searchLower = debouncedSearchQuery.toLowerCase().trim();

      if (!searchLower) {
        // If no search term, only filter by chain (if implemented)
        return true;
      }

      // Search in multiple fields
      const matchesSearch =
        dtf.name.toLowerCase().includes(searchLower) ||
        dtf.ticker.toLowerCase().includes(searchLower) ||
        dtf.dtfAddress.toLowerCase().includes(searchLower) ||
        dtf.tokens.some(token => {
          const tokenSymbol = typeof token === 'string' ? getTokenSymbol(token) : token.symbol;
          return tokenSymbol.toLowerCase().includes(searchLower);
        });

      return matchesSearch;
    });
  }, [transformedDtfData, debouncedSearchQuery, activeChain]);

  const chains = [
    { name: 'All chains', icon: Grid3X3 },
    { name: 'Ethereum', icon: CircleDot },
    { name: 'Avalanche', icon: CircleDot }
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
                <Link href="/dtf" className="text-blue-400 font-medium">Discover DTFs</Link>
                <Link href="/dtf/earn-yields" className="text-white/70 hover:text-white transition-colors">Earn Yield</Link>
                <Link href="/dtf/create" className="text-white/70 hover:text-white transition-colors">Create New DTF</Link>
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <appkit-button />
            </div>
          </div>
        </div>
      </header>


      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="grid grid-cols-1 mt-4 mb-8 md:grid-cols-4 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white">{allDTFs.length}</div>
              <div className="text-sm text-white/70">Total DTFs</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white">
                {allDTFs.filter(dtf => dtf.active).length}
              </div>
              <div className="text-sm text-white/70">Active DTFs</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white">
                {allDTFs.filter(dtf => Date.now() - (dtf.createdAt * 1000) < 24 * 60 * 60 * 1000).length}
              </div>
              <div className="text-sm text-white/70">Created Today</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white">
                {new Set(allDTFs.map(dtf => dtf.creator)).size}
              </div>
              <div className="text-sm text-white/70">Unique Creators</div>
            </CardContent>
          </Card>
        </div>

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
                className="pl-10 pr-20 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 hover:text-white/80 transition-colors"
                  title="Clear search (Esc)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-white/30">
                  <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">⌘</kbd>
                  <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">K</kbd>
                </div>
              )}
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
                {!isInitialized ? 'Initializing...' : loading ? 'Loading...' :
                  searchQuery ?
                    `Found ${filteredDTFData.length} of ${transformedDtfData.length} DTFs matching "${searchQuery}"` :
                    `${transformedDtfData.length} DTF${transformedDtfData.length !== 1 ? 's' : ''} found`
                }
              </p>
            </div>
            <div className="flex gap-2">
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  title="Clear search"
                >
                  Clear Search
                </Button>
              )}
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
          </div>

          <Card className="bg-white/5 backdrop-blur-sm border-white/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr className="text-left">
                      <th className="px-6 py-4 text-white/70 font-medium">Name</th>
                      <th className="px-6 py-4 text-white/70 font-medium">Backing</th>
                      <th className="px-6 py-4 text-white/70 font-medium">TVL</th>
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
                        <td colSpan={4} className="px-6 py-8 text-center">
                          <div className="text-white/70">
                            <p>No DTFs found.</p>
                            <p className="text-sm mt-2">
                              DTFs will appear here once they are created through the factory contract.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredDTFData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center">
                          <div className="text-white/70">
                            <p>No DTFs match your search for "<span className="text-white font-medium">"{searchQuery}"</span>".</p>
                            <p className="text-sm mt-2">
                              Try searching by name, ticker, or token type.
                            </p>
                            <Button
                              onClick={() => setSearchQuery('')}
                              variant="outline"
                              size="sm"
                              className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              Clear Search
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDTFData.map((dtf, index) => (
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
                            {renderDTFTVLDisplay(dtf.dtfAddress)}
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