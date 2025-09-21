"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/hooks/use-wallet';
import { useDTFContract } from '@/lib/dtf-contract';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ModernDTFInvestorProps {
  dtfAddress: string;
  dtfName?: string;
  dtfSymbol?: string;
}

export function ModernDTFInvestor({ dtfAddress, dtfName = "DTF", dtfSymbol = "DTF" }: ModernDTFInvestorProps) {
  const wallet = useWallet();
  const dtfService = useDTFContract(wallet.provider, wallet.signer, dtfAddress);
  
  const [ethAmount, setEthAmount] = useState('');
  const [dtfAmount, setDtfAmount] = useState('');
  const [investing, setInvesting] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [userBalance, setUserBalance] = useState('0');
  const [slippage, setSlippage] = useState(200); // 2% default

  // Load portfolio data
  useEffect(() => {
    const loadData = async () => {
      if (!dtfService || !wallet.isConnected) return;
      
      setLoading(true);
      try {
        const [portfolioValue, totalSupply, balance, detailedPortfolio] = await Promise.all([
          dtfService.getCurrentPortfolioValue(),
          dtfService.getTotalSupply(),
          wallet.account ? dtfService.getDTFBalance(wallet.account) : '0',
          dtfService.getDetailedPortfolio()
        ]);

        setPortfolioData({
          portfolioValue,
          totalSupply,
          detailedPortfolio
        });
        setUserBalance(balance);
      } catch (error) {
        console.error('Failed to load portfolio data:', error);
        toast.error('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dtfService, wallet.isConnected, wallet.account]);

  const handleInvest = async () => {
    if (!dtfService || !ethAmount) return;
    
    setInvesting(true);
    try {
      const receipt = await dtfService.mintWithEth(ethAmount, slippage);
      console.log('Investment successful:', receipt);
      toast.success(`Successfully invested ${ethAmount} ETH in ${dtfSymbol}`);
      setEthAmount('');
      
      // Reload data
      const [portfolioValue, totalSupply, balance] = await Promise.all([
        dtfService.getCurrentPortfolioValue(),
        dtfService.getTotalSupply(),
        wallet.account ? dtfService.getDTFBalance(wallet.account) : '0'
      ]);
      
      setPortfolioData(prev => ({ ...prev, portfolioValue, totalSupply }));
      setUserBalance(balance);
    } catch (error: any) {
      console.error('Investment failed:', error);
      toast.error(`Investment failed: ${error.message}`);
    } finally {
      setInvesting(false);
    }
  };

  const handleRedeem = async () => {
    if (!dtfService || !dtfAmount) return;
    
    setRedeeming(true);
    try {
      const receipt = await dtfService.redeemForEth(dtfAmount, slippage);
      console.log('Redemption successful:', receipt);
      toast.success(`Successfully redeemed ${dtfAmount} ${dtfSymbol} tokens`);
      setDtfAmount('');
      
      // Reload data
      const [portfolioValue, totalSupply, balance] = await Promise.all([
        dtfService.getCurrentPortfolioValue(),
        dtfService.getTotalSupply(),
        wallet.account ? dtfService.getDTFBalance(wallet.account) : '0'
      ]);
      
      setPortfolioData(prev => ({ ...prev, portfolioValue, totalSupply }));
      setUserBalance(balance);
    } catch (error: any) {
      console.error('Redemption failed:', error);
      toast.error(`Redemption failed: ${error.message}`);
    } finally {
      setRedeeming(false);
    }
  };

  const refreshData = async () => {
    if (!dtfService) return;
    
    setLoading(true);
    try {
      const [portfolioValue, totalSupply, balance] = await Promise.all([
        dtfService.getCurrentPortfolioValue(),
        dtfService.getTotalSupply(),
        wallet.account ? dtfService.getDTFBalance(wallet.account) : '0'
      ]);
      
      setPortfolioData(prev => ({ ...prev, portfolioValue, totalSupply }));
      setUserBalance(balance);
      toast.success('Data refreshed');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.isConnected) {
    return (
      <Card className="bg-black/50 border-white/20">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h3 className="text-xl font-semibold mb-2 text-white">Wallet Not Connected</h3>
          <p className="text-white/70 mb-4">Please connect your wallet to interact with this DTF</p>
          <Button onClick={wallet.connect} className="bg-blue-600 hover:bg-blue-700">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1) {
      return `$${value.toFixed(2)}`;
    } else {
      return `$${value.toFixed(6)}`;
    }
  };

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="bg-black/50 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {dtfName} ({dtfSymbol})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={loading}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : portfolioData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {formatNumber(portfolioData.portfolioValue)} ETH
                </div>
                <div className="text-sm text-white/70">Total Value Locked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {formatNumber(portfolioData.totalSupply)} {dtfSymbol}
                </div>
                <div className="text-sm text-white/70">Total Supply</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {formatNumber(userBalance)} {dtfSymbol}
                </div>
                <div className="text-sm text-white/70">Your Balance</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-white/70">
              Failed to load portfolio data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investment Section */}
      <Card className="bg-black/50 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Invest in DTF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ethAmount" className="text-white font-medium">ETH Amount</Label>
            <Input
              id="ethAmount"
              type="number"
              placeholder="Enter ETH amount"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              step="0.001"
              min="0"
            />
            <p className="text-xs text-white/70">
              Available: {parseFloat(wallet.balance).toFixed(4)} ETH
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slippage" className="text-white font-medium">Slippage Tolerance</Label>
            <div className="flex items-center gap-2">
              <Input
                id="slippage"
                type="number"
                value={slippage / 100}
                onChange={(e) => setSlippage(parseFloat(e.target.value) * 100)}
                className="bg-white/10 border-white/20 text-white"
                step="0.1"
                min="0.1"
                max="5"
              />
              <span className="text-white/70 text-sm">%</span>
            </div>
            <p className="text-xs text-white/70">
              Higher slippage tolerance allows for larger price movements during execution
            </p>
          </div>

          <Button 
            onClick={handleInvest} 
            disabled={investing || !ethAmount || parseFloat(ethAmount) <= 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {investing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

      {/* Redemption Section */}
      {parseFloat(userBalance) > 0 && (
        <Card className="bg-black/50 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Redeem DTF Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dtfAmount" className="text-white font-medium">{dtfSymbol} Amount</Label>
              <Input
                id="dtfAmount"
                type="number"
                placeholder="Enter DTF amount"
                value={dtfAmount}
                onChange={(e) => setDtfAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                step="0.001"
                min="0"
              />
              <p className="text-xs text-white/70">
                Available: {parseFloat(userBalance).toFixed(4)} {dtfSymbol}
              </p>
            </div>

            <Button 
              onClick={handleRedeem} 
              disabled={redeeming || !dtfAmount || parseFloat(dtfAmount) <= 0}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              {redeeming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

      {/* Portfolio Composition */}
      {portfolioData?.detailedPortfolio && (
        <Card className="bg-black/50 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="w-5 h-5" />
              Portfolio Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolioData.detailedPortfolio.tokenAddresses.map((address: string, index: number) => {
                const balance = portfolioData.detailedPortfolio.balances[index];
                const ethValue = portfolioData.detailedPortfolio.ethValues[index];
                const symbol = address === '0x0000000000000000000000000000000000000000' ? 'ETH' : 
                              address.slice(0, 6) + '...';
                
                return (
                  <div key={address} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {symbol === 'ETH' ? 'Ξ' : symbol[0]}
                      </div>
                      <div>
                        <div className="font-medium text-white">{symbol}</div>
                        <div className="text-xs text-white/70">
                          {parseFloat(balance).toFixed(4)} tokens
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {formatNumber(ethValue)} ETH
                      </div>
                      <div className="text-xs text-white/70">
                        {((parseFloat(ethValue) / parseFloat(portfolioData.portfolioValue)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
