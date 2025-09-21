"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/use-wallet';
import { useDTFFactory } from '@/lib/dtf-contract';
import { 
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Copy,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function DTFLookup() {
  const wallet = useWallet();
  const factoryService = useDTFFactory(wallet.provider, wallet.signer || undefined);
  
  const [dtfAddress, setDtfAddress] = useState('');
  const [dtfData, setDtfData] = useState<DTFData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('DTFLookup - Wallet state:', {
    isConnected: wallet.isConnected,
    account: wallet.account,
    provider: !!wallet.provider,
    signer: !!wallet.signer,
    chainId: wallet.chainId
  });

  const handleLookup = async () => {
    if (!dtfAddress.trim()) {
      setError('Please enter a DTF address');
      return;
    }

    if (!wallet.isConnected || !wallet.account) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setDtfData(null);

    if (!wallet.provider) {
      console.log('Wallet provider not available, using fallback provider');
    }

    try {
      console.log('Looking up DTF:', dtfAddress);
      const data = await factoryService.getDTFByAddress(dtfAddress.trim());
      console.log('DTF data retrieved:', data);
      setDtfData(data);
    } catch (err: any) {
      console.error('Error looking up DTF:', err);
      setError(err.message || 'Failed to fetch DTF data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRefreshProvider = () => {
    // Force a re-render by updating a dummy state
    setError(null);
    setDtfData(null);
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          DTF Lookup by Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Status */}
        <div className="p-3 bg-white/5 rounded-lg border border-white/10 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${wallet.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-white/70">
                Wallet: {wallet.isConnected ? 'Connected' : 'Not Connected'}
              </span>
              {wallet.isConnected && wallet.account && (
                <span className="text-xs text-white/50">
                  ({wallet.account.slice(0, 6)}...{wallet.account.slice(-4)})
                </span>
              )}
            </div>
            <div className="text-xs text-white/50">
              Provider: {wallet.provider ? 'Available' : 'Not Available'}
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">
              DTF Contract Address
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter DTF contract address (0x...)"
                value={dtfAddress}
                onChange={(e) => setDtfAddress(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
              />
              <Button
                onClick={handleLookup}
                disabled={loading || !dtfAddress.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {!wallet.isConnected && (
            <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <p className="text-sm text-yellow-300">
                  Connect your wallet to look up DTF data
                </p>
              </div>
            </div>
          )}

          {wallet.isConnected && !wallet.provider && (
            <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-blue-300">
                    Using fallback provider. Wallet provider not detected.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefreshProvider}
                  className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {dtfData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* DTF Overview */}
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                    {dtfData.name}
                    <Badge variant="outline" className="text-lg">
                      {dtfData.symbol}
                    </Badge>
                    {dtfData.active ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Creator: {dtfData.creator.slice(0, 6)}...{dtfData.creator.slice(-4)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created: {formatDate(dtfData.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(dtfData.dtfAddress)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/dtf/${dtfData.dtfAddress}`, '_blank')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Token Allocation */}
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Token Allocation
                </h4>
                <div className="space-y-3">
                  {dtfData.tokens.map((token, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full",
                          getWeightColor(dtfData.weights[index])
                        )}></div>
                        <span className="font-medium text-white">
                          {getTokenSymbol(token)}
                        </span>
                        <span className="text-xs text-white/50 font-mono">
                          {token.slice(0, 6)}...{token.slice(-4)}
                        </span>
                      </div>
                      <span className="text-white/70 font-medium">
                        {dtfData.weights[index]}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Portfolio Visualization */}
                <div className="mt-4 w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    {dtfData.tokens.map((_, index) => (
                      <div
                        key={index}
                        className={cn("h-full", getWeightColor(dtfData.weights[index]))}
                        style={{ width: `${dtfData.weights[index]}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Contract Address */}
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50 mb-1">Contract Address</p>
                <p className="font-mono text-sm text-white break-all">
                  {dtfData.dtfAddress}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
