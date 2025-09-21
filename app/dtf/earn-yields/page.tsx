"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWallet } from '@/hooks/use-wallet';
import { useDTFFactory, useDTFContract } from '@/lib/dtf-contract';
import { ethers } from 'ethers';
import DTFFACTORY_ABI from '@/DTF/abi/DTFFactory';
import DTF_ABI from '@/DTF/abi/DTF';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Zap, 
  DollarSign,
  Users,
  BarChart3,
  Star,
  Search,
  Globe,
  Layers,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface DTFWithMetrics extends DTFData {
  tvl: string;
  tvlEth: number;
  userBalance?: string;
  portfolioValue?: string;
  totalSupply?: string;
  performance?: number;
  risk: "Low" | "Medium" | "High";
  fee: number;
}

export default function EarnYieldsPage() {
  const wallet = useWallet();
  const factoryService = useDTFFactory(wallet.provider, wallet.signer || undefined);
  
  // State management
  const [allDTFs, setAllDTFs] = useState<DTFWithMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("tvl");
  
  // Refs to prevent multiple calls
  const hasFetchedData = useRef(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search DTFs"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Escape to clear search
      if (event.key === 'Escape' && searchTerm) {
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm]);

  // Fetch all DTFs from factory
  useEffect(() => {
    const fetchDTFs = async () => {
      if (!wallet.provider || hasFetchedData.current || loading) {
        return;
      }
      
      hasFetchedData.current = true;
      setLoading(true);
      
      try {
        console.log('Fetching DTFs for earn yields page...');
        
        // Create contract instance directly
        const DTF_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_DTF_FACTORY_ADDRESS || "0xDA099Db187399f501bA3Dccf688DEd37fc66dF6e";
        let provider: any = wallet.provider;
        if (!provider) {
          const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.unichain.org';
          provider = new ethers.JsonRpcProvider(rpcUrl);
        }
        
        const factoryContract = new ethers.Contract(DTF_FACTORY_ADDRESS, DTFFACTORY_ABI, provider);
        const dtfs = await factoryContract.getAllDTFs();
        
        console.log('Raw DTFs from contract:', dtfs);
        
        // Transform and enhance the data
        const enhancedDTFs: DTFWithMetrics[] = await Promise.all(
          dtfs.map(async (dtf: any) => {
            const transformedDtf: DTFWithMetrics = {
              dtfAddress: dtf.dtfAddress,
              creator: dtf.creator,
              name: dtf.name,
              symbol: dtf.symbol,
              tokens: dtf.tokens,
              weights: dtf.weights.map((weight: any) => Number(weight) / 100),
              createdAt: Number(dtf.createdAt),
              active: dtf.active,
              tvl: "0",
              tvlEth: 0,
              risk: calculateRisk(dtf.tokens, dtf.weights.map((weight: any) => Number(weight) / 100)),
              fee: 0.5 // Default fee
            };

            // Fetch TVL for each DTF
            try {
              const dtfContract = new ethers.Contract(dtf.dtfAddress, DTF_ABI, provider);
              const tvlWei = await dtfContract.getTotalEthLocked();
              const tvlEth = Number(ethers.formatEther(tvlWei));
              
              transformedDtf.tvl = tvlEth.toFixed(4);
              transformedDtf.tvlEth = tvlEth;
              
              // Fetch user balance if wallet is connected
              if (wallet.account) {
                try {
                  const userBalanceWei = await dtfContract.balanceOf(wallet.account);
                  transformedDtf.userBalance = ethers.formatEther(userBalanceWei);
                } catch (error) {
                  console.error('Error fetching user balance:', error);
                }
              }
            } catch (error) {
              console.error(`Error fetching TVL for ${dtf.dtfAddress}:`, error);
            }

            return transformedDtf;
          })
        );
        
        console.log('Enhanced DTFs:', enhancedDTFs);
        setAllDTFs(enhancedDTFs);
      } catch (error) {
        console.error('Error fetching DTFs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDTFs();
  }, [wallet.provider, wallet.account]);

  // Reset fetch state when wallet disconnects
  useEffect(() => {
    if (!wallet.isConnected) {
      hasFetchedData.current = false;
      setAllDTFs([]);
    }
  }, [wallet.isConnected]);

  // Calculate risk based on token diversity and weights
  const calculateRisk = (tokens: string[], weights: number[]): "Low" | "Medium" | "High" => {
    const tokenCount = tokens.length;
    const maxWeight = Math.max(...weights);
    
    if (tokenCount >= 4 && maxWeight <= 40) return "Low";
    if (tokenCount >= 3 && maxWeight <= 60) return "Medium";
    return "High";
  };

  // Memoized filtered and sorted DTFs for performance
  const filteredDTFs = useMemo(() => {
    return allDTFs
      .filter(dtf => {
        // Enhanced search functionality
        const searchLower = debouncedSearchTerm.toLowerCase().trim();
        
        if (!searchLower) {
          // If no search term, only filter by risk
          const matchesRisk = selectedRisk === "all" || dtf.risk === selectedRisk;
          return matchesRisk;
        }
        
        // Search in multiple fields with better matching
        const matchesSearch = 
          dtf.name.toLowerCase().includes(searchLower) ||
          dtf.symbol.toLowerCase().includes(searchLower) ||
          dtf.dtfAddress.toLowerCase().includes(searchLower) ||
          dtf.creator.toLowerCase().includes(searchLower) ||
          dtf.tokens.some(token => getTokenSymbol(token).toLowerCase().includes(searchLower)) ||
          // Also search in token addresses (first 6 chars)
          dtf.tokens.some(token => token.toLowerCase().includes(searchLower));
        
        const matchesRisk = selectedRisk === "all" || dtf.risk === selectedRisk;
        
        return matchesSearch && matchesRisk;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "tvl":
            return b.tvlEth - a.tvlEth;
          case "name":
            return a.name.localeCompare(b.name);
          case "risk":
            const riskOrder = { "Low": 1, "Medium": 2, "High": 3 };
            return riskOrder[a.risk] - riskOrder[b.risk];
          default:
            return 0;
        }
      });
  }, [allDTFs, debouncedSearchTerm, selectedRisk, sortBy]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `${value.toFixed(2)} ETH`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "Medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "High":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getTokenSymbol = (tokenAddress: string) => {
    if (tokenAddress === '0x0000000000000000000000000000000000000000') return 'ETH';
    const tokenMap: { [key: string]: string } = {
      '0xA0b86a33E6441d8e3C0d0a3b8d0b8d0b8d0b8d0b': 'USDC',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
    };
    return tokenMap[tokenAddress] || tokenAddress.slice(0, 6) + '...';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 sm:gap-8">
                <Link href="/">
                  <h1 className="text-xl sm:text-2xl font-bold">OSMO</h1>
                </Link>
                <nav className="hidden lg:flex items-center gap-6">
                  <Link href="/dtf/discover-yield" className="text-white/70 hover:text-white transition-colors">Discover DTFs</Link>
                  <Link href="/dtf/earn-yields" className="text-blue-400 font-medium">Earn Yield</Link>
                  <Link href="/dtf/create" className="text-white/70 hover:text-white transition-colors">Create New DTF</Link>
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 text-white/70 flex items-center justify-center">
                <DollarSign className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Connect Your Wallet</h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Connect your wallet to start earning yields with diversified DTF strategies.
              </p>
              <Button 
                onClick={wallet.connect} 
                disabled={wallet.isLoading}
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {wallet.isLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link href="/">
                <h1 className="text-xl sm:text-2xl font-bold">OSMO</h1>
              </Link>
              <nav className="hidden lg:flex items-center gap-6">
                <Link href="/dtf" className="text-white/70 hover:text-white transition-colors">Discover DTFs</Link>
                <Link href="/dtf/earn-yields" className="text-blue-400 font-medium">Earn Yield</Link>
                <Link href="/dtf/create" className="text-white/70 hover:text-white transition-colors">Create New DTF</Link>
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Earn Yields</h2>
          </div>
          <p className="text-white/70 text-lg max-w-2xl">
            Invest in diversified token baskets and earn yields with professional-grade strategies.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                      placeholder="Search DTFs by name, symbol, or token..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-20 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    {searchTerm ? (
                      <button
                        onClick={() => setSearchTerm('')}
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

                  {/* Risk Filter */}
                  <div className="flex flex-wrap gap-2">
                    {["all", "Low", "Medium", "High"].map((risk) => (
                      <Button
                        key={risk}
                        variant={selectedRisk === risk ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedRisk(risk)}
                        className={cn(
                          "capitalize",
                          selectedRisk === risk 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "bg-white/5 border-white/20 text-white hover:bg-white/10"
                        )}
                      >
                        {risk === "all" ? "All Risks" : `${risk} Risk`}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/70">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 rounded-md border border-white/20 bg-white/5 text-white text-sm"
                    >
                      <option value="tvl">TVL</option>
                      <option value="name">Name</option>
                      <option value="risk">Risk</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-white/70" />
              <span className="ml-3 text-white/70">Loading DTFs...</span>
            </div>
          )}

          {/* DTF Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredDTFs.map((dtf, index) => (
                  <motion.div
                    key={dtf.dtfAddress}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/5 backdrop-blur-sm border-white/20 hover:border-white/40">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1 text-white">{dtf.name}</CardTitle>
                            <p className="text-sm text-white/70 mb-2">
                              {dtf.symbol} • Created {formatDate(dtf.createdAt)}
                            </p>
                          </div>
                          <Badge className={cn("text-xs border", getRiskColor(dtf.risk))}>
                            {dtf.risk}
                          </Badge>
                        </div>
                      </CardHeader>
                    
                      <CardContent className="space-y-4">
                        {/* Token Allocation */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {dtf.tokens.slice(0, 4).map((token, tokenIndex) => (
                              <Badge
                                key={tokenIndex}
                                variant="secondary"
                                className="text-xs px-2 py-1 bg-white/10 text-white border-white/20"
                              >
                                {getTokenSymbol(token)} {dtf.weights[tokenIndex]}%
                              </Badge>
                            ))}
                            {dtf.tokens.length > 4 && (
                              <Badge variant="secondary" className="text-xs px-2 py-1 bg-white/10 text-white border-white/20">
                                +{dtf.tokens.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Portfolio Visualization */}
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="flex h-full">
                            {dtf.tokens.map((_, tokenIndex) => (
                              <div
                                key={tokenIndex}
                                className={cn("h-full", {
                                  "bg-blue-500": tokenIndex === 0,
                                  "bg-green-500": tokenIndex === 1,
                                  "bg-purple-500": tokenIndex === 2,
                                  "bg-orange-500": tokenIndex === 3,
                                  "bg-gray-500": tokenIndex > 3
                                })}
                                style={{ width: `${dtf.weights[tokenIndex]}%` }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-white/70" />
                              <span className="text-white/70">TVL</span>
                            </div>
                            <span className="text-sm font-medium text-white">{formatCurrency(dtf.tvlEth)}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-white/70" />
                              <span className="text-white/70">Fee</span>
                            </div>
                            <span className="text-sm font-medium text-white">{dtf.fee}%</span>
                          </div>
                        </div>

                        {/* User Balance */}
                        {dtf.userBalance && Number(dtf.userBalance) > 0 && (
                          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-md">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-400">Your Balance</span>
                              <span className="font-medium text-white">{Number(dtf.userBalance).toFixed(4)} {dtf.symbol}</span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                            onClick={() => window.open(`/dtf/${dtf.dtfAddress}`, '_blank')}
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Invest
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                            onClick={() => window.open(`/dtf/${dtf.dtfAddress}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Search Results Info */}
          {!loading && allDTFs.length > 0 && (
            <div className="flex items-center justify-between text-sm text-white/70 mb-4">
              <span>
                {searchTerm ? (
                  `Found ${filteredDTFs.length} of ${allDTFs.length} DTFs matching "${searchTerm}"`
                ) : (
                  `Showing ${filteredDTFs.length} DTFs`
                )}
              </span>
              {searchTerm && (
                <Button 
                  onClick={() => setSearchTerm('')}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredDTFs.length === 0 && (
            <div className="text-center py-12">
              {searchTerm ? (
                <>
                  <Search className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <h3 className="text-xl font-semibold mb-2 text-white">No DTFs Found</h3>
                  <p className="text-white/70 mb-6">
                    No DTFs match your search for "<span className="text-white font-medium">"{searchTerm}"</span>". 
                    Try searching by name, symbol, or token type.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={() => setSearchTerm('')}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Clear Search
                    </Button>
                    <Button 
                      onClick={() => setSelectedRisk("all")}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Show All Risks
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <h3 className="text-xl font-semibold mb-2 text-white">No DTFs Available</h3>
                  <p className="text-white/70 mb-6">
                    No DTFs are available at the moment. Check back later or create your own DTF.
                  </p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Platform Stats */}
          {!loading && allDTFs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart3 className="w-5 h-5" />
                    Platform Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{allDTFs.length}</div>
                      <div className="text-sm text-white/70">Total DTFs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(allDTFs.reduce((sum, dtf) => sum + dtf.tvlEth, 0))}
                      </div>
                      <div className="text-sm text-white/70">Total TVL</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {allDTFs.filter(dtf => dtf.active).length}
                      </div>
                      <div className="text-sm text-white/70">Active DTFs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {new Set(allDTFs.map(dtf => dtf.creator)).size}
                      </div>
                      <div className="text-sm text-white/70">Creators</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}


