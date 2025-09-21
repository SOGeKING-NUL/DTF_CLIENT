"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/hooks/use-wallet';
import { useDTFContract, useDTFFactory } from '@/lib/dtf-contract';
import { useDTF } from '@/hooks/use-dtf-context';
import { 
  ArrowLeft,
  TrendingUp, 
  DollarSign, 
  RefreshCw,
  Copy,
  Calendar,
  Users,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function DTFDetailPage() {
  const params = useParams();
  const rawAddress = params.address as string;
  
  // Normalize address: ensure 0x prefix and convert to lowercase
  const dtfAddress = rawAddress.toLowerCase().startsWith('0x') ? rawAddress.toLowerCase() : `0x${rawAddress.toLowerCase()}`;
  
  const wallet = useWallet();
  const { getDTFByAddress, isInitialized, loading: contextLoading } = useDTF();
  const dtfService = useDTFContract(wallet.provider, wallet.signer || undefined, dtfAddress);
  const factoryService = useDTFFactory(wallet.provider, wallet.signer || undefined);

  const [dtfInfo, setDtfInfo] = useState<any>(null);
  const [tvlData, setTvlData] = useState<string>('0');
  const [tvlLoading, setTvlLoading] = useState(false);
  const [tvlError, setTvlError] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dtfNotFound, setDtfNotFound] = useState(false);

  // Mock data for the chart (you can replace this with real historical data)
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

  // Load DTF information from context only
  useEffect(() => {
    const loadDTFData = () => {
      if (!dtfAddress) return;
      
      // Wait for context to be initialized
      if (!isInitialized) {
        setLoading(true);
        return;
      }

      setLoading(true);
      setDtfNotFound(false);
      
      try {
        // Get DTF info from context only
        const contextDtfInfo = getDTFByAddress(dtfAddress);
        
        if (contextDtfInfo) {
          console.log('DTF found in context:', contextDtfInfo);
          setDtfInfo(contextDtfInfo);
          setDtfNotFound(false);
        } else {
          console.log('DTF not found in context');
          setDtfNotFound(true);
        }
      } catch (error) {
        console.error('Failed to load DTF data from context:', error);
        setDtfNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadDTFData();
  }, [isInitialized, dtfAddress, getDTFByAddress]);

  // Load TVL data using getTotalEthLocked only
  useEffect(() => {
    const loadTvlData = async () => {
      if (!dtfService || !dtfInfo) return;
      
      setTvlLoading(true);
      setTvlError(null);
      
      try {
        console.log('Fetching TVL for DTF:', dtfInfo.name);
        const tvl = await dtfService.getTotalEthLocked();
        console.log('TVL fetched:', tvl, 'ETH');
        setTvlData(tvl);
      } catch (error) {
        console.error('Failed to load TVL data:', error);
        setTvlError('Failed to fetch TVL data');
      } finally {
        setTvlLoading(false);
      }
    };

    loadTvlData();
  }, [dtfService, dtfInfo]);

  // Fetch ETH price from CoinGecko
  useEffect(() => {
    const fetchEthPrice = async () => {
      setPriceLoading(true);
      setPriceError(null);
      
      try {
        const coinGeckoApiKey = process.env.NEXT_PUBLIC_COIN_GECKO_URL;
        const baseUrl = 'https://api.coingecko.com/api/v3';
        const url = `${baseUrl}/simple/price?ids=ethereum&vs_currencies=usd&x_cg_demo_api_key=${coinGeckoApiKey}`;
        
        console.log('Fetching ETH price from CoinGecko...');
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ETH price: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const price = data.ethereum?.usd;
        
        if (price) {
          console.log('ETH price fetched:', price);
          setEthPrice(price);
        } else {
          throw new Error('Invalid price data received');
        }
      } catch (error) {
        console.error('Failed to fetch ETH price:', error);
        setPriceError('Failed to fetch ETH price');
      } finally {
        setPriceLoading(false);
      }
    };

    fetchEthPrice();
  }, []);

  // Recalculate USD value when TVL or ETH price changes
  useEffect(() => {
    if (tvlData && ethPrice > 0) {
      const tvlNum = parseFloat(tvlData);
      const usdValue = tvlNum * ethPrice;
      console.log('TVL USD Conversion:', {
        tvlEth: tvlNum,
        ethPriceUsd: ethPrice,
        usdValue: usdValue,
        formattedUsd: formatCurrency(usdValue)
      });
    }
  }, [tvlData, ethPrice]);

  // Utility functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTVLDisplay = (tvl: string) => {
    const tvlNum = parseFloat(tvl);
    if (tvlLoading || priceLoading) return 'Loading...';
    if (tvlError) return 'Error loading TVL';
    if (priceError) return 'Error loading price';
    if (tvlNum === 0) return '$0';
    
    const usdValue = tvlNum * ethPrice;
    console.log('USD Calculation:', {
      tvlEth: tvlNum,
      ethPrice: ethPrice,
      usdValue: usdValue
    });
    return formatCurrency(usdValue);
  };

  const getTvlUsdValue = () => {
    const tvlNum = parseFloat(tvlData);
    if (tvlNum === 0 || ethPrice === 0) return '0';
    return (tvlNum * ethPrice).toFixed(2);
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

  const getWeightColor = (weight: number) => {
    if (weight >= 40) return 'bg-red-500';
    if (weight >= 20) return 'bg-orange-500';
    if (weight >= 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
              <p className="text-white/70">
                {!isInitialized ? 'Initializing DTF context...' : 'Loading DTF data...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dtfNotFound || !dtfInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-6 text-red-500" />
              <h3 className="text-2xl font-semibold mb-4">DTF Not Found</h3>
              <p className="text-muted-foreground mb-6">
                The DTF contract at address {dtfAddress} was not found in the factory context.
              </p>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-muted-foreground">
                  Make sure the address is correct and the DTF was created through the factory contract.
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Address: {dtfAddress}
                </p>
              </div>
              <Link href="/dtf">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All DTFs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/dtf">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All DTFs
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            {dtfInfo.active ? (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(dtfAddress)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy Address
            </Button>
          </div>
        </div>

        {/* DTF Overview */}
        <Card className="bg-white/5 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2 flex items-center gap-3">
                  {dtfInfo.name}
                  <Badge variant="outline" className="text-lg">
                    {dtfInfo.symbol}
                  </Badge>
                </CardTitle>
                <p className="text-white/70">
                  Created by {dtfInfo.creator.slice(0, 6)}...{dtfInfo.creator.slice(-4)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/70 mb-1">Created</div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(dtfInfo.createdAt * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Token Allocation */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Token Allocation
                </h4>
                <div className="space-y-3">
                  {dtfInfo.tokens.map((token: string, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full",
                          getWeightColor(dtfInfo.weights[index])
                        )}></div>
                        <span className="font-medium">{getTokenSymbol(token)}</span>
                      </div>
                      <span className="text-white/70">{dtfInfo.weights[index]}%</span>
                    </div>
                  ))}
                </div>
                
                {/* Portfolio Visualization */}
                <div className="mt-4 w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    {dtfInfo.tokens.map((_: any, index: number) => (
                      <div
                        key={index}
                        className={cn("h-full", getWeightColor(dtfInfo.weights[index]))}
                        style={{ width: `${dtfInfo.weights[index]}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Contract Info */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Contract Info
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Address:</span>
                    <span className="font-mono text-xs">
                      {dtfAddress.slice(0, 6)}...{dtfAddress.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Creator:</span>
                    <span className="font-mono text-xs">
                      {dtfInfo.creator.slice(0, 6)}...{dtfInfo.creator.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Status:</span>
                    <span className={dtfInfo.active ? "text-green-400" : "text-red-400"}>
                      {dtfInfo.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* TVL and Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TVL Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Total Value Locked (TVL)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {tvlLoading || priceLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        Loading...
                      </div>
                    ) : tvlError ? (
                      <span className="text-red-400">Error</span>
                    ) : priceError ? (
                      <span className="text-red-400">Price Error</span>
                    ) : (
                      formatTVLDisplay(tvlData)
                    )}
                  </div>
                  <p className="text-white/70 text-sm">
                    {tvlLoading ? 'Fetching TVL data...' : 
                     priceLoading ? 'Fetching ETH price...' :
                     tvlError ? 'Failed to load TVL' : 
                     priceError ? 'Failed to load price' :
                     `${parseFloat(tvlData).toFixed(4)} ETH`}
                  </p>
                  {!tvlLoading && !priceLoading && !tvlError && !priceError && ethPrice > 0 && (
                    <p className="text-white/50 text-xs mt-1">
                      ETH Price: ${ethPrice.toFixed(2)}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">DTF Name:</span>
                    <span className="font-medium text-white">{dtfInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Symbol:</span>
                    <span className="font-medium text-white">{dtfInfo.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Status:</span>
                    <span className={dtfInfo.active ? "text-green-400" : "text-red-400"}>
                      {dtfInfo.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="bg-white/5 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: any) => [formatCurrency(value), 'Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-white/70 text-sm">
                  Historical performance data (mock data)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
