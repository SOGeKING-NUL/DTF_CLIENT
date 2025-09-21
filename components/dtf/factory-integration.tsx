"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/hooks/use-wallet';
import { useDTFFactory } from '@/lib/dtf-contract';
import { 
  Plus,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Zap,
  TrendingUp,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DTFCreationForm {
  name: string;
  symbol: string;
  tokens: string[];
  weights: number[];
}

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

export function FactoryIntegration() {
  const wallet = useWallet();
  const factoryService = useDTFFactory(wallet.provider, wallet.signer || undefined);

  const [allDTFs, setAllDTFs] = useState<DTFData[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState<DTFCreationForm>({
    name: '',
    symbol: '',
    tokens: ['0x0000000000000000000000000000000000000000'], // ETH address
    weights: [100]
  });

  // Load all DTFs from factory
  useEffect(() => {
    const loadDTFs = async () => {
      // Only proceed if wallet is connected and provider is available
      if (!wallet.isConnected || !wallet.provider) {
        setAllDTFs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Loading DTFs from factory...');
        const dtfs = await factoryService.getAllDTFs();
        console.log('Loaded DTFs:', dtfs);
        setAllDTFs(dtfs);
      } catch (error) {
        console.error('Failed to load DTFs:', error);
        // Set empty array on error
        setAllDTFs([]);
        // You could also show a toast notification here
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure wallet is fully connected
    const timer = setTimeout(loadDTFs, 100);
    
    return () => clearTimeout(timer);
  }, [factoryService, wallet.isConnected, wallet.provider]);

  const handleCreateDTF = async () => {
    if (!factoryService || !formData.name || !formData.symbol) return;
    
    setCreating(true);
    try {
      const result = await factoryService.createDTF(
        formData.name, 
        formData.symbol, 
        formData.tokens, 
        formData.weights
      );
      
      console.log('DTF created successfully:', result);
      alert(`DTF created successfully! Address: ${result.dtfAddress}`);
      
      // Reset form
      setFormData({
        name: '',
        symbol: '',
        tokens: ['0x0000000000000000000000000000000000000000'],
        weights: [100]
      });
      setShowCreateForm(false);
      
      // Refresh DTFs list
      await refreshDTFs();
    } catch (error) {
      console.error('DTF creation failed:', error);
      alert('DTF creation failed. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const addToken = () => {
    setFormData({
      ...formData,
      tokens: [...formData.tokens, ''],
      weights: [...formData.weights, 0]
    });
  };

  const removeToken = (index: number) => {
    if (formData.tokens.length > 1) {
      const newTokens = formData.tokens.filter((_, i) => i !== index);
      const newWeights = formData.weights.filter((_, i) => i !== index);
      
      // Rebalance weights to add up to 100
      const totalWeight = newWeights.reduce((sum, weight) => sum + weight, 0);
      const rebalancedWeights = newWeights.map(weight => 
        Math.round((weight / totalWeight) * 100)
      );
      
      setFormData({
        ...formData,
        tokens: newTokens,
        weights: rebalancedWeights
      });
    }
  };

  const updateToken = (index: number, address: string) => {
    const newTokens = [...formData.tokens];
    newTokens[index] = address;
    setFormData({ ...formData, tokens: newTokens });
  };

  const updateWeight = (index: number, weight: number) => {
    const newWeights = [...formData.weights];
    newWeights[index] = weight;
    setFormData({ ...formData, weights: newWeights });
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

  const totalWeight = formData.weights.reduce((sum, weight) => sum + weight, 0);

  // Refresh DTFs function
  const refreshDTFs = async () => {
    if (!wallet.isConnected || !wallet.provider) return;
    
    setLoading(true);
    try {
      const dtfs = await factoryService.getAllDTFs();
      setAllDTFs(dtfs);
      console.log('DTFs refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh DTFs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Factory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{allDTFs.length}</div>
            <div className="text-sm text-muted-foreground">Total DTFs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {allDTFs.filter(dtf => dtf.active).length}
            </div>
            <div className="text-sm text-muted-foreground">Active DTFs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {allDTFs.filter(dtf => Date.now() - (dtf.createdAt * 1000) < 24 * 60 * 60 * 1000).length}
            </div>
            <div className="text-sm text-muted-foreground">Created Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(allDTFs.map(dtf => dtf.creator)).size}
            </div>
            <div className="text-sm text-muted-foreground">Unique Creators</div>
          </CardContent>
        </Card>
      </div>

      {/* Create DTF Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New DTF
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create DTF'}
            </Button>
          </div>
        </CardHeader>
        
        {showCreateForm && (
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">DTF Name</label>
                <Input
                  placeholder="Enter DTF name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">DTF Symbol</label>
                <Input
                  placeholder="Enter DTF symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Token Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Token Allocation</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Total Weight: {totalWeight}%
                  </span>
                  {totalWeight !== 100 && (
                    <Badge variant="destructive" className="text-xs">
                      Must equal 100%
                    </Badge>
                  )}
                  <Button size="sm" variant="outline" onClick={addToken}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {formData.tokens.map((token, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <Input
                        placeholder="Token address (0x...)"
                        value={token}
                        onChange={(e) => updateToken(index, e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {token ? getTokenSymbol(token) : 'Enter token address'}
                      </p>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Weight %"
                        value={formData.weights[index]}
                        onChange={(e) => updateWeight(index, Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    {formData.tokens.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeToken(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {formData.name && formData.symbol && formData.tokens.some(t => t) && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium mb-3">Preview</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{formData.name}</span>
                    <Badge variant="outline">{formData.symbol}</Badge>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="flex h-full">
                      {formData.tokens.map((_, index) => (
                        <div
                          key={index}
                          className={cn("h-full", getWeightColor(formData.weights[index]))}
                          style={{ width: `${formData.weights[index]}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Create Button */}
            <Button
              onClick={handleCreateDTF}
              disabled={creating || !formData.name || !formData.symbol || totalWeight !== 100}
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
        )}
      </Card>

      {/* DTFs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All DTFs ({allDTFs.length})</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshDTFs}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!wallet.isConnected ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>Please connect your wallet to view DTFs</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading DTFs...</span>
            </div>
          ) : allDTFs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p>No DTFs found. Create your first DTF!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {allDTFs.map((dtf, index) => (
                <motion.div
                  key={dtf.dtfAddress}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{dtf.name}</h4>
                        <Badge variant={dtf.active ? "default" : "secondary"}>
                          {dtf.symbol}
                        </Badge>
                        {dtf.active ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Creator: </span>
                          <span className="font-mono">
                            {dtf.creator.slice(0, 6)}...{dtf.creator.slice(-4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created: </span>
                          <span>{formatDate(dtf.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tokens: </span>
                          <span>{dtf.tokens.length}</span>
                        </div>
                      </div>

                      {/* Token Details */}
                      <div className="mt-3 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {dtf.tokens.map((token, tokenIndex) => (
                            <div
                              key={tokenIndex}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs"
                            >
                              <span className="font-medium">
                                {getTokenSymbol(token)}
                              </span>
                              <span className="text-muted-foreground">
                                {dtf.weights[tokenIndex]}%
                              </span>
                            </div>
                          ))}
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
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(`/dtf/${dtf.dtfAddress}`, '_blank');
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
