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
import { 
  ArrowLeft,
  TrendingUp, 
  TrendingDown, 
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
import { ResponsiveContainer } from 'recharts';

export default function DTFDetailPage() {
  const params = useParams();
  const dtfAddress = params.address as string;
  
  const wallet = useWallet();
  const dtfService = useDTFContract(wallet.provider, wallet.signer || undefined, dtfAddress);
  const factoryService = useDTFFactory(wallet.provider, wallet.signer || undefined);

  const [dtfInfo, setDtfInfo] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [ethAmount, setEthAmount] = useState('');
  const [dtfAmount, setDtfAmount] = useState('');
  const [investing, setInvesting] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  // Load DTF information and portfolio data
  useEffect(() => {
    const loadDTFData = async () => {
      if (!dtfService || !factoryService || !dtfAddress) return;
      
      setLoading(true);
      try {
        // Load DTF info from factory
        const info = await factoryService.getDTFInfo(dtfAddress);
        setDtfInfo(info);

        // Load portfolio data if wallet is connected
        if (wallet.isConnected) {
          const [portfolioValue, detailedPortfolio, totalSupply, userBalance] = await Promise.all([
            dtfService.getCurrentPortfolioValue(),
            dtfService.getDetailedPortfolio(),
            dtfService.getTotalSupply(),
            dtfService.getDTFBalance(wallet.account!)
          ]);

          setPortfolioData({
            portfolioValue,
            detailedPortfolio,
            totalSupply,
            userBalance
          });
        }
      } catch (error) {
        console.error('Failed to load DTF data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDTFData();
  }, [dtfService, factoryService, dtfAddress, wallet.isConnected, wallet.account]);

  const handleInvest = async () => {
    if (!dtfService || !ethAmount) return;
    
    setInvesting(true);
    try {
      const receipt = await dtfService.mintWithEth(ethAmount);
      console.log('Investment successful:', receipt);
      setEthAmount('');
      // Reload data
      window.location.reload();
    } catch (error) {
      console.error('Investment failed:', error);
      alert('Investment failed. Please try again.');
    } finally {
      setInvesting(false);
    }
  };

  const handleRedeem = async () => {
    if (!dtfService || !dtfAmount) return;
    
    setRedeeming(true);
    try {
      const receipt = await dtfService.redeemForEth(dtfAmount);
      console.log('Redemption successful:', receipt);
      setDtfAmount('');
      // Reload data
      window.location.reload();
    } catch (error) {
      console.error('Redemption failed:', error);
      alert('Redemption failed. Please try again.');
    } finally {
      setRedeeming(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (!dtfInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-6 text-red-500" />
              <h3 className="text-2xl font-semibold mb-4">DTF Not Found</h3>
              <p className="text-muted-foreground mb-6">
                The DTF contract at address {dtfAddress} was not found or is invalid.
              </p>
              <Link href="/dtf/discover-yield">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Discover DTFs
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
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              {renderTVLDisplay()}
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
              <ArrowUp className="w-4 h-4 text-green-400" />
            </div>
            {!tvlLoading && !tvlError && (
              <Button
                onClick={fetchTotalTVL}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                title="Refresh TVL data"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>

          <p className="text-white/70 mb-6">Annualized protocol revenue: $14.7M</p>


          
        </motion.div>
          <Link href="/dtf/discover-yield">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Discover
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

              {/* Portfolio Stats */}
              {portfolioData && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Portfolio Stats
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Total Value:</span>
                      <span className="font-medium text-green-400">
                        {parseFloat(portfolioData.portfolioValue).toFixed(4)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Total Supply:</span>
                      <span className="font-medium">
                        {parseFloat(portfolioData.totalSupply).toFixed(4)} DTF
                      </span>
                    </div>
                    {wallet.isConnected && (
                      <div className="flex justify-between">
                        <span className="text-white/70">Your Balance:</span>
                        <span className="font-medium text-blue-400">
                          {parseFloat(portfolioData.userBalance).toFixed(4)} DTF
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Investment Interface */}
        {wallet.isConnected ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invest */}
            <Card className="bg-white/5 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Invest in {dtfInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/70">ETH Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter ETH amount"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    className="mt-1 bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Button 
                  onClick={handleInvest} 
                  disabled={investing || !ethAmount}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {investing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Investing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Invest ETH
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Redeem */}
            {portfolioData && parseFloat(portfolioData.userBalance) > 0 && (
              <Card className="bg-white/5 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Redeem {dtfInfo.symbol} Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/70">DTF Amount</label>
                    <Input
                      type="number"
                      placeholder="Enter DTF amount"
                      value={dtfAmount}
                      onChange={(e) => setDtfAmount(e.target.value)}
                      className="mt-1 bg-white/10 border-white/20 text-white"
                    />
                    <p className="text-xs text-white/50 mt-1">
                      Available: {parseFloat(portfolioData.userBalance).toFixed(4)} {dtfInfo.symbol}
                    </p>
                  </div>
                  <Button 
                    onClick={handleRedeem} 
                    disabled={redeeming || !dtfAmount}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    {redeeming ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Redeeming...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Redeem for ETH
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-white/5 backdrop-blur-md border-white/20">
            <CardContent className="p-8 text-center">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-white/70" />
              <h3 className="text-xl font-semibold mb-2 text-white">Connect Your Wallet</h3>
              <p className="text-white/70 mb-6">
                Connect your wallet to invest in or redeem from this DTF
              </p>
              <Button 
                onClick={wallet.connect}
                disabled={wallet.isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {wallet.isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Detailed Portfolio */}
        {portfolioData && (
          <Card className="bg-white/5 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Detailed Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4">Token</th>
                      <th className="text-left py-3 px-4">Balance</th>
                      <th className="text-left py-3 px-4">ETH Value</th>
                      <th className="text-left py-3 px-4">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioData.detailedPortfolio.tokenAddresses.map((token: string, index: number) => (
                      <tr key={index} className="border-b border-white/10">
                        <td className="py-3 px-4 font-medium">{getTokenSymbol(token)}</td>
                        <td className="py-3 px-4">{parseFloat(portfolioData.detailedPortfolio.balances[index]).toFixed(4)}</td>
                        <td className="py-3 px-4 text-green-400">
                          {parseFloat(portfolioData.detailedPortfolio.ethValues[index]).toFixed(4)} ETH
                        </td>
                        <td className="py-3 px-4">{dtfInfo.weights[index]}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
