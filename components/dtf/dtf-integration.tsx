"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/hooks/use-wallet';
import { useDTFContract, useDTFFactory } from '@/lib/dtf-contract';
import { WalletConnectionGuard } from './wallet-connection-guard';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap,
  RefreshCw,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DTFIntegrationProps {
  dtfAddress: string; // Required - must be provided from factory
  showCreate?: boolean;
  showInvest?: boolean;
  showPortfolio?: boolean;
}

export function DTFIntegration({ 
  dtfAddress, 
  showCreate = false, 
  showInvest = true, 
  showPortfolio = true 
}: DTFIntegrationProps) {
  const wallet = useWallet();
  const dtfService = useDTFContract(wallet.provider, wallet.signer || undefined, dtfAddress);
  const factoryService = useDTFFactory(wallet.provider, wallet.signer || undefined);

  // State for investment
  const [ethAmount, setEthAmount] = useState('');
  const [investing, setInvesting] = useState(false);

  // State for redemption
  const [dtfAmount, setDtfAmount] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // State for portfolio data
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // State for DTF creation
  const [dtfName, setDtfName] = useState('');
  const [dtfSymbol, setDtfSymbol] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [tokenWeights, setTokenWeights] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);

  // Load portfolio data
  useEffect(() => {
    const loadPortfolioData = async () => {
      if (!dtfService || !wallet.isConnected) return;
      
      setLoading(true);
      try {
        const [portfolioValue, detailedPortfolio, totalSupply, userBalance] = await Promise.all([
          dtfService.getCurrentPortfolioValue(),
          dtfService.getDetailedPortfolio(),
          dtfService.getTotalSupply(),
          wallet.account ? dtfService.getDTFBalance(wallet.account) : '0'
        ]);

        setPortfolioData({
          portfolioValue,
          detailedPortfolio,
          totalSupply,
          userBalance
        });
      } catch (error) {
        console.error('Failed to load portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, [dtfService, wallet.isConnected, wallet.account]);

  const handleInvest = async () => {
    if (!dtfService || !ethAmount) return;
    
    setInvesting(true);
    try {
      const receipt = await dtfService.mintWithEth(ethAmount);
      console.log('Investment successful:', receipt);
      setEthAmount('');
      // Reload portfolio data
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
      // Reload portfolio data
      window.location.reload();
    } catch (error) {
      console.error('Redemption failed:', error);
      alert('Redemption failed. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  const handleCreateDTF = async () => {
    if (!factoryService || !dtfName || !dtfSymbol || selectedTokens.length === 0) return;
    
    setCreating(true);
    try {
      const result = await factoryService.createDTF(dtfName, dtfSymbol, selectedTokens, tokenWeights);
      console.log('DTF created successfully:', result);
      alert(`DTF created successfully! Address: ${result.dtfAddress}`);
      // Reset form
      setDtfName('');
      setDtfSymbol('');
      setSelectedTokens([]);
      setTokenWeights([]);
    } catch (error) {
      console.error('DTF creation failed:', error);
      alert('DTF creation failed. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (!wallet.isConnected) {
    return (
      <WalletConnectionGuard>
        <div />
      </WalletConnectionGuard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Wallet Connected</span>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Connected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Account</p>
              <p className="font-mono text-sm">
                {wallet.account?.slice(0, 6)}...{wallet.account?.slice(-4)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="font-mono text-sm text-green-600">
                {parseFloat(wallet.balance).toFixed(4)} ETH
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chain ID</p>
              <p className="font-mono text-sm">{wallet.chainId}</p>
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={wallet.disconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Overview */}
      {showPortfolio && portfolioData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Portfolio Overview</span>
              <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {parseFloat(portfolioData.portfolioValue).toFixed(4)} ETH
                  </div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {parseFloat(portfolioData.totalSupply).toFixed(4)} DTF
                  </div>
                  <div className="text-sm text-muted-foreground">Total Supply</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {parseFloat(portfolioData.userBalance).toFixed(4)} DTF
                  </div>
                  <div className="text-sm text-muted-foreground">Your Balance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {portfolioData.detailedPortfolio.tokenAddresses.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Assets</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Investment Section */}
      {showInvest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Invest in DTF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">ETH Amount</label>
              <Input
                type="number"
                placeholder="Enter ETH amount"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleInvest} 
              disabled={investing || !ethAmount}
              className="w-full"
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
      )}

      {/* Redemption Section */}
      {showInvest && portfolioData && parseFloat(portfolioData.userBalance) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Redeem DTF Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">DTF Amount</label>
              <Input
                type="number"
                placeholder="Enter DTF amount"
                value={dtfAmount}
                onChange={(e) => setDtfAmount(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {parseFloat(portfolioData.userBalance).toFixed(4)} DTF
              </p>
            </div>
            <Button 
              onClick={handleRedeem} 
              disabled={redeeming || !dtfAmount}
              variant="outline"
              className="w-full"
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

      {/* DTF Creation Section */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Create New DTF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">DTF Name</label>
                <Input
                  placeholder="Enter DTF name"
                  value={dtfName}
                  onChange={(e) => setDtfName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">DTF Symbol</label>
                <Input
                  placeholder="Enter DTF symbol"
                  value={dtfSymbol}
                  onChange={(e) => setDtfSymbol(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">DTF Creation</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This will create a new DTF contract. Make sure you have the correct token addresses and weights.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCreateDTF} 
              disabled={creating || !dtfName || !dtfSymbol}
              className="w-full"
            >
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating DTF...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Create DTF
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
