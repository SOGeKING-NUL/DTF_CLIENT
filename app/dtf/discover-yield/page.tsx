"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/hooks/use-wallet';
import { useDTFFactory } from '@/lib/dtf-contract';
import { ethers } from 'ethers';
import DTFFACTORY_ABI from '@/DTF/abi/DTFFactory';
import Link from 'next/link';
import { 
  Search, 
  Wallet, 
  TrendingUp, 
  Users, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Filter,
  Star,
  Zap,
  Eye,
  Calendar,
  ChevronDown,
  DollarSign,
  Globe,
  Shield,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function DiscoverYieldPage() {
  const wallet = useWallet();
  const factoryService = useDTFFactory(wallet.provider, wallet.signer || undefined);
  
  const [allDTFs, setAllDTFs] = useState<DTFCard[]>([]);
  const [filteredDTFs, setFilteredDTFs] = useState<DTFCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Ref to track if we've already fetched data to prevent multiple calls
  const hasFetchedData = useRef(false);

  // Load all DTFs from factory contract
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
    
    const loadDTFs = async () => {
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
        const transformedDTFs = dtfs.map((dtf: any) => ({
          dtfAddress: dtf.dtfAddress,
          creator: dtf.creator,
          name: dtf.name,
          symbol: dtf.symbol,
          tokens: dtf.tokens,
          weights: dtf.weights.map((weight: any) => Number(weight) / 100), // Convert from basis points to percentage
          createdAt: Number(dtf.createdAt),
          active: dtf.active
        }));
        
        console.log('Transformed DTFs:', transformedDTFs);
        console.log('Number of DTFs found:', transformedDTFs.length);
        
        setAllDTFs(transformedDTFs);
        setFilteredDTFs(transformedDTFs);
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

    loadDTFs();
  }, [wallet.provider, loading]); // Re-run when dependencies change

  // Reset fetch state when wallet disconnects/reconnects
  useEffect(() => {
    if (!wallet.isConnected) {
      // If wallet disconnects, reset the fetch state
      hasFetchedData.current = false;
      setAllDTFs([]); // Clear data when wallet disconnects
      setFilteredDTFs([]);
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
      const transformedDTFs = dtfs.map((dtf: any) => ({
        dtfAddress: dtf.dtfAddress,
        creator: dtf.creator,
        name: dtf.name,
        symbol: dtf.symbol,
        tokens: dtf.tokens,
        weights: dtf.weights.map((weight: any) => Number(weight) / 100), // Convert from basis points to percentage
        createdAt: Number(dtf.createdAt),
        active: dtf.active
      }));
      
      console.log('Refreshed DTFs:', transformedDTFs);
      setAllDTFs(transformedDTFs);
      setFilteredDTFs(transformedDTFs);
      hasFetchedData.current = true; // Update the ref since we have fresh data
    } catch (err: any) {
      console.error('Error refreshing DTFs:', err);
      setError(err.message || 'Failed to refresh DTF data');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort DTFs
  useEffect(() => {
    let filtered = allDTFs;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(dtf => 
        dtf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dtf.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dtf.tokens.some(token => token.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(dtf => {
        switch (selectedCategory) {
          case 'active':
            return dtf.active;
          case 'recent':
            return Date.now() - (dtf.createdAt * 1000) < 7 * 24 * 60 * 60 * 1000; // Last 7 days
          default:
            return true;
        }
      });
    }

    // Sort DTFs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredDTFs(filtered);
  }, [allDTFs, searchQuery, selectedCategory, sortBy]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getTokenSymbol = (tokenAddress: string) => {
    if (tokenAddress === '0x0000000000000000000000000000000000000000') return 'ETH';
    // Add more token mappings as needed
    const tokenMap: { [key: string]: string } = {
      '0xA0b86a33E6441d8e3C0d0a3b8d0b8d0b8d0b8d0b': 'USDC',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
    };
    return tokenMap[tokenAddress] || tokenAddress.slice(0, 6) + '...';
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 40) return 'bg-red-500';
    if (weight >= 20) return 'bg-orange-500';
    if (weight >= 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const categories = [
    { id: 'all', name: 'All DTFs', count: allDTFs.length },
    { id: 'active', name: 'Active', count: allDTFs.filter(dtf => dtf.active).length },
    { id: 'recent', name: 'Recent', count: allDTFs.filter(dtf => Date.now() - (dtf.createdAt * 1000) < 7 * 24 * 60 * 60 * 1000).length },
  ];

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
                  <Link href="/dtf/discover-yield" className="text-blue-400 font-medium">Discover DTFs</Link>
                  <Link href="/dtf/earn-yields" className="text-white/70 hover:text-white transition-colors">Earn Yield</Link>
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
              <Wallet className="w-16 h-16 mx-auto mb-6 text-white/70" />
              <h3 className="text-2xl font-semibold mb-4 text-white">Connect Your Wallet</h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Connect your wallet to discover and interact with all available DTF contracts from the factory.
              </p>
              <Button 
                onClick={wallet.connect} 
                disabled={wallet.isLoading}
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {wallet.isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </>
                )}
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
                <Link href="/dtf/discover-yield" className="text-blue-400 font-medium">Discover DTFs</Link>
                <Link href="/dtf/earn-yields" className="text-white/70 hover:text-white transition-colors">Earn Yield</Link>
                <Link href="/dtf/create" className="text-white/70 hover:text-white transition-colors">Create New DTF</Link>
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              </button>
              <div className="text-xs text-white/50">
                <a href="#" className="hover:text-white/70 transition-colors">Explore all available DTF contracts</a>
              </div>
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Discover DTFs</h2>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Search and Filters */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    placeholder="Search DTFs by name, symbol, or token..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                  />
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "flex items-center gap-2",
                        selectedCategory === category.id 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "bg-white/5 border-white/20 text-white hover:bg-white/10"
                      )}
                    >
                      {category.name}
                      <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>

                {/* Refresh */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshDTFs}
                  disabled={loading || initializing}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          {/* DTFs Grid */}
          {initializing ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-3 border-white/20 border-t-blue-400 rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-white/90 font-medium">Initializing DTF data fetch...</p>
                  <p className="text-white/60 text-sm mt-1">Setting up connection to factory contract</p>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-3 border-white/20 border-t-blue-400 rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-white/90 font-medium">Loading DTFs from factory contract...</p>
                  <p className="text-white/60 text-sm mt-1">Please wait while we fetch the data</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <Card className="bg-white/5 backdrop-blur-sm border-white/20">
              <CardContent className="p-8 text-center">
                <div className="text-red-400">
                  <p>Error loading DTFs: {error}</p>
                  <p className="text-sm text-white/70 mt-2">
                    Make sure your wallet is connected and try refreshing the page.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : filteredDTFs.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-sm border-white/20">
              <CardContent className="p-12 text-center">
                <div className="text-white/70">
                  {allDTFs.length === 0 ? 'No DTFs found in the factory contract.' : 'No DTFs match your search criteria.'}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDTFs.map((dtf, index) => (
                <motion.div
                  key={dtf.dtfAddress}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/5 backdrop-blur-sm border-white/20 hover:border-white/40">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1 flex items-center gap-2 text-white">
                            {dtf.name}
                            <Badge variant={dtf.active ? "default" : "secondary"} className="text-xs bg-blue-600/20 text-blue-400 border-blue-500/30">
                              {dtf.symbol}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-white/70">
                            Created by {dtf.creator.slice(0, 6)}...{dtf.creator.slice(-4)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {dtf.active ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          ) : (
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  
                    <CardContent className="space-y-4">
                      {/* Token Allocation */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Token Allocation</span>
                          <span className="text-xs text-white/70">{dtf.tokens.length} tokens</span>
                        </div>
                        <div className="space-y-2">
                          {dtf.tokens.map((token, tokenIndex) => (
                            <div key={tokenIndex} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-3 h-3 rounded-full",
                                  getWeightColor(dtf.weights[tokenIndex])
                                )}></div>
                                <span className="text-sm text-white">{getTokenSymbol(token)}</span>
                              </div>
                              <span className="text-sm font-medium text-white">{dtf.weights[tokenIndex]}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Portfolio Visualization */}
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="flex h-full">
                          {dtf.tokens.map((_, tokenIndex) => (
                            <div
                              key={tokenIndex}
                              className={cn("h-full", getWeightColor(dtf.weights[tokenIndex]))}
                              style={{ width: `${dtf.weights[tokenIndex]}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(dtf.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Active
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          size="sm"
                          onClick={() => {
                            // Navigate to DTF details or open in new tab
                            window.open(`/dtf/${dtf.dtfAddress}`, '_blank');
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          onClick={() => {
                            // Copy DTF address to clipboard
                            navigator.clipboard.writeText(dtf.dtfAddress);
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Contract Address */}
                      <div className="text-xs text-white/70 font-mono break-all bg-white/5 p-2 rounded border border-white/10">
                        {dtf.dtfAddress}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More Button (if needed) */}
          {filteredDTFs.length > 0 && (
            <div className="text-center">
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Load More DTFs
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


