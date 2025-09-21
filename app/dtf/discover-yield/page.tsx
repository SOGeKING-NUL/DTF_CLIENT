"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import DashboardPageLayout from "@/components/dashboard/layout";
import AtomIcon from "@/components/icons/atom";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/hooks/use-wallet';
import { useDTFFactory, useDTFContract } from '@/lib/dtf-contract';
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
  ChevronDown
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Load all DTFs from factory contract
  useEffect(() => {
    const loadDTFs = async () => {
      if (!factoryService) return;
      
      setLoading(true);
      try {
        const dtfs = await factoryService.getAllDTFs();
        setAllDTFs(dtfs);
        setFilteredDTFs(dtfs);
      } catch (error) {
        console.error('Failed to load DTFs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDTFs();
  }, [factoryService]);

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
      <DashboardPageLayout
        header={{
          title: "Discover DTFs",
          description: "Explore all available DTF contracts",
          icon: AtomIcon,
        }}
      >
        <Card className="w-full">
          <CardContent className="p-12 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-4">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your wallet to discover and interact with all available DTF contracts from the factory.
            </p>
            <Button 
              onClick={wallet.connect} 
              disabled={wallet.isLoading}
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Discover DTFs",
        description: "Explore all available DTF contracts",
        icon: AtomIcon,
      }}
    >
      <div className="space-y-8">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search DTFs by name, symbol, or token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
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
                      selectedCategory === category.id && "bg-primary text-primary-foreground"
                    )}
                  >
                    {category.name}
                    <Badge variant="secondary" className="ml-1">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 rounded-md border border-border bg-background text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                disabled={loading}
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{allDTFs.length}</div>
              <div className="text-sm text-muted-foreground">Total DTFs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {allDTFs.filter(dtf => dtf.active).length}
              </div>
              <div className="text-sm text-muted-foreground">Active DTFs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {allDTFs.filter(dtf => Date.now() - (dtf.createdAt * 1000) < 24 * 60 * 60 * 1000).length}
              </div>
              <div className="text-sm text-muted-foreground">Created Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {new Set(allDTFs.map(dtf => dtf.creator)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unique Creators</div>
            </CardContent>
          </Card>
        </div>

        {/* DTFs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredDTFs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
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
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1 flex items-center gap-2">
                          {dtf.name}
                          <Badge variant={dtf.active ? "default" : "secondary"} className="text-xs">
                            {dtf.symbol}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
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
                        <span className="text-sm font-medium">Token Allocation</span>
                        <span className="text-xs text-muted-foreground">{dtf.tokens.length} tokens</span>
                      </div>
                      <div className="space-y-2">
                        {dtf.tokens.map((token, tokenIndex) => (
                          <div key={tokenIndex} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                getWeightColor(dtf.weights[tokenIndex])
                              )}></div>
                              <span className="text-sm">{getTokenSymbol(token)}</span>
                            </div>
                            <span className="text-sm font-medium">{dtf.weights[tokenIndex]}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Portfolio Visualization */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
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
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                        onClick={() => {
                          // Copy DTF address to clipboard
                          navigator.clipboard.writeText(dtf.dtfAddress);
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Contract Address */}
                    <div className="text-xs text-muted-foreground font-mono break-all bg-gray-50 p-2 rounded">
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
            <Button variant="outline" size="lg">
              Load More DTFs
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </DashboardPageLayout>
  );
}


