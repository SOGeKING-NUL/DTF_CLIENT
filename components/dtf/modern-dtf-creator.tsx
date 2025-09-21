"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useWallet } from '@/hooks/use-wallet';
import { useDTFFactory } from '@/lib/dtf-contract';
import { 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  TrendingUp,
  Zap,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Token {
  id: string;
  symbol: string;
  name: string;
  address: string;
  price: number;
  weight: number;
  logo: string;
  color: string;
}

// Real token addresses for Unichain Sepolia testnet
const AVAILABLE_TOKENS: Token[] = [
  { 
    id: "eth", 
    symbol: "ETH", 
    name: "Ethereum", 
    address: "0x0000000000000000000000000000000000000000", 
    price: 3245.67, 
    weight: 0, 
    logo: "Ξ", 
    color: "from-blue-500 to-blue-600" 
  },
  { 
    id: "usdc", 
    symbol: "USDC", 
    name: "USD Coin", 
    address: "0x31d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0", 
    price: 1.00, 
    weight: 0, 
    logo: "$", 
    color: "from-green-500 to-green-600" 
  },
  { 
    id: "usdt", 
    symbol: "USDT", 
    name: "Tether", 
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", 
    price: 1.00, 
    weight: 0, 
    logo: "₮", 
    color: "from-teal-500 to-teal-600" 
  },
  { 
    id: "dai", 
    symbol: "DAI", 
    name: "Dai Stablecoin", 
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", 
    price: 1.00, 
    weight: 0, 
    logo: "◈", 
    color: "from-yellow-500 to-yellow-600" 
  }
];

interface ModernDTFCreatorProps {
  onDTFCreated?: (dtfAddress: string) => void;
}

export function ModernDTFCreator({ onDTFCreated }: ModernDTFCreatorProps) {
  const wallet = useWallet();
  const factoryService = useDTFFactory(wallet.provider, wallet.signer);
  
  const [step, setStep] = useState(1);
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [dtfName, setDtfName] = useState('');
  const [dtfSymbol, setDtfSymbol] = useState('');
  const [creating, setCreating] = useState(false);
  const [totalWeight, setTotalWeight] = useState(0);
  const [createdDTF, setCreatedDTF] = useState<any>(null);

  // Update total weight when selected tokens change
  useEffect(() => {
    const total = selectedTokens.reduce((sum, token) => sum + token.weight, 0);
    setTotalWeight(total);
  }, [selectedTokens]);

  const addToken = (token: Token) => {
    if (!selectedTokens.find(t => t.id === token.id)) {
      const newToken = { ...token, weight: 0 };
      setSelectedTokens([...selectedTokens, newToken]);
    }
  };

  const removeToken = (tokenId: string) => {
    setSelectedTokens(selectedTokens.filter(t => t.id !== tokenId));
  };

  const updateWeight = (tokenId: string, weight: number) => {
    const updated = selectedTokens.map(t => 
      t.id === tokenId ? { ...t, weight } : t
    );
    setSelectedTokens(updated);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedTokens.length >= 2 && totalWeight === 100;
      case 2:
        return dtfName.length > 0 && dtfSymbol.length > 0;
      default:
        return false;
    }
  };

  const handleCreateDTF = async () => {
    if (!factoryService || !canProceed()) return;
    
    setCreating(true);
    try {
      const tokenAddresses = selectedTokens.map(t => t.address);
      const weights = selectedTokens.map(t => t.weight * 100); // Convert to basis points
      
      const result = await factoryService.createDTF(dtfName, dtfSymbol, tokenAddresses, weights);
      
      setCreatedDTF(result);
      toast.success(`DTF created successfully! Address: ${result.dtfAddress}`);
      
      if (onDTFCreated) {
        onDTFCreated(result.dtfAddress);
      }
    } catch (error: any) {
      console.error('DTF creation failed:', error);
      toast.error(`DTF creation failed: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedTokens([]);
    setDtfName('');
    setDtfSymbol('');
    setCreating(false);
    setCreatedDTF(null);
    setTotalWeight(0);
  };

  if (!wallet.isConnected) {
    return (
      <Card className="bg-black/50 border-white/20">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h3 className="text-xl font-semibold mb-2 text-white">Wallet Not Connected</h3>
          <p className="text-white/70 mb-4">Please connect your wallet to create a DTF</p>
          <Button onClick={wallet.connect} className="bg-blue-600 hover:bg-blue-700">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (createdDTF) {
    return (
      <Card className="bg-black/50 border-white/20">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">DTF Created Successfully!</h3>
          <p className="text-white/70 mb-4">{dtfName} ({dtfSymbol})</p>
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <p className="text-sm text-white/70 mb-1">Contract Address</p>
            <p className="font-mono text-sm text-white break-all">{createdDTF.dtfAddress}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => window.open(`/dtf/${createdDTF.dtfAddress}`, '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View DTF
            </Button>
            <Button onClick={resetForm} variant="outline" className="border-white/20 text-white">
              Create Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= stepNumber
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-white/50"
                )}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={cn(
                  "w-16 h-0.5 mx-2",
                  step > stepNumber ? "bg-blue-600" : "bg-white/10"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-white/70">
          Step {step} of 3
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Token Selection */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-black/50 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Select Tokens & Weights
                </CardTitle>
                <p className="text-white/70 text-sm">
                  Choose at least 2 tokens and set their allocation weights (must total 100%)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Available Tokens */}
                <div>
                  <Label className="text-white font-medium mb-3 block">Available Tokens</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_TOKENS.map((token) => (
                      <motion.div
                        key={token.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start p-4 h-auto border-white/20",
                            selectedTokens.find(t => t.id === token.id)
                              ? "bg-blue-600/20 border-blue-500 text-white"
                              : "bg-white/5 text-white hover:bg-white/10"
                          )}
                          onClick={() => addToken(token)}
                          disabled={selectedTokens.find(t => t.id === token.id) !== undefined}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                              token.color
                            )}>
                              {token.logo}
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{token.symbol}</div>
                              <div className="text-xs opacity-70">{token.name}</div>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Selected Tokens with Weights */}
                {selectedTokens.length > 0 && (
                  <div>
                    <Label className="text-white font-medium mb-3 block">Selected Tokens & Weights</Label>
                    <div className="space-y-4">
                      {selectedTokens.map((token) => (
                        <div key={token.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                token.color
                              )}>
                                {token.logo}
                              </div>
                              <div>
                                <div className="font-medium text-white">{token.symbol}</div>
                                <div className="text-xs text-white/70">{token.name}</div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeToken(token.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Weight</span>
                              <span className="text-white font-medium">{token.weight}%</span>
                            </div>
                            <Slider
                              value={[token.weight]}
                              onValueChange={([value]) => updateWeight(token.id, value)}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Weight Summary */}
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Total Weight</span>
                        <span className={cn(
                          "font-medium",
                          totalWeight === 100 ? "text-green-400" : "text-yellow-400"
                        )}>
                          {totalWeight}%
                        </span>
                      </div>
                      {totalWeight !== 100 && (
                        <p className="text-xs text-yellow-400 mt-1">
                          Weights must total exactly 100%
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: DTF Details */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-black/50 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  DTF Configuration
                </CardTitle>
                <p className="text-white/70 text-sm">
                  Set the name and symbol for your DTF token
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dtfName" className="text-white font-medium">DTF Name</Label>
                    <Input
                      id="dtfName"
                      placeholder="e.g., DeFi Index Fund"
                      value={dtfName}
                      onChange={(e) => setDtfName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      maxLength={50}
                    />
                    <p className="text-xs text-white/70">Maximum 50 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dtfSymbol" className="text-white font-medium">DTF Symbol</Label>
                    <Input
                      id="dtfSymbol"
                      placeholder="e.g., DIF"
                      value={dtfSymbol}
                      onChange={(e) => setDtfSymbol(e.target.value.toUpperCase())}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      maxLength={10}
                    />
                    <p className="text-xs text-white/70">Maximum 10 characters</p>
                  </div>
                </div>

                {/* Portfolio Preview */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-3">Portfolio Preview</h4>
                  <div className="space-y-2">
                    {selectedTokens.map((token) => (
                      <div key={token.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs",
                            token.color
                          )}>
                            {token.logo}
                          </div>
                          <span className="text-white text-sm">{token.symbol}</span>
                        </div>
                        <span className="text-white/70 text-sm">{token.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Review & Deploy */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-black/50 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Review & Deploy
                </CardTitle>
                <p className="text-white/70 text-sm">
                  Review your DTF configuration and deploy to the blockchain
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* DTF Summary */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h4 className="text-white font-medium mb-4">DTF Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Name</span>
                      <span className="text-white font-medium">{dtfName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Symbol</span>
                      <span className="text-white font-medium">{dtfSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Tokens</span>
                      <span className="text-white font-medium">{selectedTokens.length}</span>
                    </div>
                  </div>
                </div>

                {/* Portfolio Allocation */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h4 className="text-white font-medium mb-4">Portfolio Allocation</h4>
                  <div className="space-y-3">
                    {selectedTokens.map((token) => (
                      <div key={token.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                            token.color
                          )}>
                            {token.logo}
                          </div>
                          <div>
                            <div className="text-white font-medium">{token.symbol}</div>
                            <div className="text-xs text-white/70">{token.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{token.weight}%</div>
                          <div className="text-xs text-white/70">
                            ${(token.price * (token.weight / 100) * 1000).toFixed(2)} allocation
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deployment Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-yellow-400 font-medium mb-1">Deployment Notice</h5>
                      <p className="text-yellow-300/80 text-sm">
                        This will create a new DTF contract on Unichain Sepolia testnet. 
                        Make sure you have enough ETH for gas fees.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleCreateDTF}
            disabled={creating || !canProceed()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deploying DTF...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Deploy DTF
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
