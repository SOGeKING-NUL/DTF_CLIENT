"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/use-wallet';
import { useDTFContract, useDTFFactory } from '@/lib/dtf-contract';
import { 
  ArrowLeft,
  TrendingUp, 
  DollarSign, 
  Zap,
  RefreshCw,
  ExternalLink,
  Copy,
  Calendar,
  Users,
  BarChart3,
  Wallet,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ModernDTFInvestor } from '@/components/dtf/modern-dtf-investor';

export default function DTFDetailPage() {
  const params = useParams();
  const dtfAddress = params.address as string;
  
  const wallet = useWallet();
  const dtfService = useDTFContract(wallet.provider, wallet.signer || undefined, dtfAddress);
  const factoryService = useDTFFactory(wallet.provider, wallet.signer || undefined);

  const [dtfInfo, setDtfInfo] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load DTF information and portfolio data
  useEffect(() => {
    const loadDTFData = async () => {
      if (!dtfService || !factoryService || !dtfAddress) return;
      
      setLoading(true);
      try {
        const [dtfData, portfolioValue, detailedPortfolio, totalSupply] = await Promise.all([
          factoryService.getDTFByAddress(dtfAddress),
          dtfService.getCurrentPortfolioValue(),
          dtfService.getDetailedPortfolio(),
          dtfService.getTotalSupply()
        ]);

        setDtfInfo(dtfData);
        setPortfolioData({
          portfolioValue,
          detailedPortfolio,
          totalSupply
        });
      } catch (error) {
        console.error('Failed to load DTF data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDTFData();
  }, [dtfService, factoryService, dtfAddress, wallet.isConnected, wallet.account]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTokenSymbol = (tokenAddress: string) => {
    if (tokenAddress === '0x0000000000000000000000000000000000000000') return 'ETH';
    const tokenMap: { [key: string]: string } = {
      '0x31d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0': 'USDC',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
    };
    return tokenMap[tokenAddress] || tokenAddress.slice(0, 6) + '...';
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p className="text-white/70">Loading DTF data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dtfInfo) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-2xl font-bold mb-2 text-white">DTF Not Found</h2>
            <p className="text-white/70 mb-6">The DTF you're looking for doesn't exist or is no longer active.</p>
            <Link href="/dtf">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to DTFs
              </Button>
            </Link>
          </div>
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
              <Link href="/dtf">
                <h1 className="text-xl sm:text-2xl font-bold">OSMO</h1>
              </Link>
              <nav className="hidden lg:flex items-center gap-6">
                <Link href="/dtf" className="text-white/70 hover:text-white transition-colors">Discover DTFs</Link>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dtf">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to DTFs
            </Button>
          </Link>
        </div>

        {/* DTF Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">{dtfInfo.name}</h1>
              <p className="text-xl text-white/70">{dtfInfo.symbol}</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="outline" className="bg-green-500/20 border-green-500/50 text-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
                <Badge variant="outline" className="bg-blue-500/20 border-blue-500/50 text-blue-400">
                  {dtfInfo.tokens.length} Tokens
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {formatNumber(portfolioData?.portfolioValue || 0)} ETH
              </div>
              <div className="text-white/70">Total Value Locked</div>
            </div>
          </div>

          {/* Contract Address */}
          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/70 mb-1">Contract Address</div>
                  <div className="font-mono text-sm text-white">
                    {dtfAddress.slice(0, 6)}...{dtfAddress.slice(-4)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(dtfAddress)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://sepolia.unichain.org/address/${dtfAddress}`, '_blank')}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {formatNumber(portfolioData?.portfolioValue || 0)} ETH
              </div>
              <div className="text-sm text-white/70">Total Value</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {formatNumber(portfolioData?.totalSupply || 0)}
              </div>
              <div className="text-sm text-white/70">Total Supply</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {dtfInfo.tokens.length}
              </div>
              <div className="text-sm text-white/70">Assets</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {new Date(dtfInfo.createdAt * 1000).toLocaleDateString()}
              </div>
              <div className="text-sm text-white/70">Created</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio Composition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/5 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Portfolio Composition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dtfInfo.tokens.map((token: string, index: number) => {
                  const weight = dtfInfo.weights[index];
                  const symbol = getTokenSymbol(token);
                  
                  return (
                    <div key={token} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {symbol === 'ETH' ? 'Ξ' : symbol[0]}
                        </div>
                        <div>
                          <div className="font-medium text-white">{symbol}</div>
                          <div className="text-sm text-white/70">
                            {token.slice(0, 6)}...{token.slice(-4)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">{weight}%</div>
                        <div className="text-sm text-white/70">Weight</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modern Investment Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ModernDTFInvestor 
            dtfAddress={dtfAddress}
            dtfName={dtfInfo.name}
            dtfSymbol={dtfInfo.symbol}
          />
        </motion.div>
      </main>
    </div>
  );
}