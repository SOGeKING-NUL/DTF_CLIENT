"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useWallet } from '@/hooks/use-wallet'
import Link from 'next/link'
import { 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  TrendingUp,
  Shield,
  Zap,
  Target,
  DollarSign,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DTFIntegration } from "@/components/dtf/dtf-integration"

interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  weight: number;
  logo: string;
  color: string;
}

const availableTokens: Token[] = [
  { id: "eth", symbol: "ETH", name: "Ethereum", price: 3245.67, weight: 0, logo: "🔷", color: "from-blue-500 to-blue-600" },
  { id: "btc", symbol: "BTC", name: "Bitcoin", price: 67234.89, weight: 0, logo: "🟠", color: "from-orange-500 to-orange-600" },
  { id: "sol", symbol: "SOL", name: "Solana", price: 98.45, weight: 0, logo: "🟣", color: "from-purple-500 to-purple-600" },
  { id: "bnb", symbol: "BNB", name: "BNB", price: 315.23, weight: 0, logo: "🟡", color: "from-yellow-500 to-yellow-600" },
  { id: "usdc", symbol: "USDC", name: "USD Coin", price: 1.00, weight: 0, logo: "🔵", color: "from-blue-400 to-blue-500" },
  { id: "usdt", symbol: "USDT", name: "Tether", price: 1.00, weight: 0, logo: "🟢", color: "from-green-400 to-green-500" },
];

interface RebalanceRule {
  threshold: number;
  frequency: string;
  maxWeight: number;
  fee: number;
}

export default function CreateDTFPage() {
  const wallet = useWallet()
  const [step, setStep] = useState(1)
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([])
  const [dtfName, setDtfName] = useState("")
  const [dtfDescription, setDtfDescription] = useState("")
  const [rebalanceRules, setRebalanceRules] = useState<RebalanceRule>({
    threshold: 5,
    frequency: "weekly",
    maxWeight: 40,
    fee: 0.5
  })
  const [totalWeight, setTotalWeight] = useState(0)

  const addToken = (token: Token) => {
    if (!selectedTokens.find(t => t.id === token.id)) {
      const newToken = { ...token, weight: 0 }
      setSelectedTokens([...selectedTokens, newToken])
    }
  }

  const removeToken = (tokenId: string) => {
    setSelectedTokens(selectedTokens.filter(t => t.id !== tokenId))
    updateWeights(selectedTokens.filter(t => t.id !== tokenId))
  }

  const updateWeight = (tokenId: string, weight: number) => {
    const updated = selectedTokens.map(t => 
      t.id === tokenId ? { ...t, weight } : t
    )
    setSelectedTokens(updated)
    updateWeights(updated)
  }

  const updateWeights = (tokens: Token[]) => {
    const total = tokens.reduce((sum, token) => sum + token.weight, 0)
    setTotalWeight(total)
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedTokens.length > 0 && totalWeight === 100
      case 2:
        return dtfName.length > 0 && dtfDescription.length > 0
      case 3:
        return true
      default:
        return false
    }
  }

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
                  <Link href="/dtf/discover-yield" className="text-white/70 hover:text-white transition-colors">Discover DTFs</Link>
                  <Link href="/dtf/earn-yields" className="text-white/70 hover:text-white transition-colors">Earn Yield</Link>
                  <Link href="/dtf/create" className="text-blue-400 font-medium">Create New DTF</Link>
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 text-white/70 flex items-center justify-center">
                <Target className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Connect Your Wallet</h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Connect your wallet to create and deploy your own DTF with custom token allocations and rebalancing rules.
              </p>
              <Button 
                onClick={wallet.connect} 
                disabled={wallet.isLoading}
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {wallet.isLoading ? "Connecting..." : "Connect Wallet"}
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
                <Link href="/dtf/discover-yield" className="text-white/70 hover:text-white transition-colors">Discover DTFs</Link>
                <Link href="/dtf/earn-yields" className="text-white/70 hover:text-white transition-colors">Earn Yield</Link>
                <Link href="/dtf/create" className="text-blue-400 font-medium">Create New DTF</Link>
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-semibold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Create new DTF
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Design a token folio in minutes. Pick assets, set weights and rules, then preview and deploy on‑chain.
          </p>
        </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {[1, 2, 3, 4].map((s) => (
                    <motion.div
                      key={s}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 + s * 0.1 }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                        step >= s 
                          ? "bg-blue-600 text-white shadow-lg" 
                          : "bg-white/10 text-white/70"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        step >= s ? "bg-white/20" : "bg-white/20"
                      )}>
                        {s}
                      </div>
                      <span className="text-sm font-medium">
                        {s === 1 && "Assets & Weights"}
                        {s === 2 && "DTF Details"}
                        {s === 3 && "Rules & Settings"}
                        {s === 4 && "Deploy"}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <Progress value={(step / 4) * 100} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 1: Assets & Weights */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target className="w-5 h-5" />
                      Select Assets & Set Weights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Available Tokens */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white">Available Tokens</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableTokens.map((token) => (
                          <motion.button
                            key={token.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addToken(token)}
                            disabled={!!selectedTokens.find(t => t.id === token.id)}
                            className={cn(
                              "p-4 rounded-lg border border-white/20 hover:border-blue-500/50 transition-all duration-200 text-left bg-white/5",
                              selectedTokens.find(t => t.id === token.id) 
                                ? "opacity-50 cursor-not-allowed" 
                                : "hover:bg-white/10"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center text-lg",
                                token.color
                              )}>
                                {token.logo}
                              </div>
                              <div>
                                <div className="font-medium text-white">{token.symbol}</div>
                                <div className="text-sm text-white/70">{token.name}</div>
                                <div className="text-sm font-medium text-white">${token.price.toLocaleString()}</div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Tokens with Weight Sliders */}
                    {selectedTokens.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Portfolio Allocation</h3>
                          <Badge variant={totalWeight === 100 ? "default" : "destructive"} className={totalWeight === 100 ? "bg-green-600" : "bg-red-600"}>
                            {totalWeight}% Total
                          </Badge>
                        </div>
                        <div className="space-y-4">
                          {selectedTokens.map((token) => (
                            <motion.div
                              key={token.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 rounded-lg border border-white/20 bg-white/10"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center text-lg",
                                    token.color
                                  )}>
                                    {token.logo}
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">{token.symbol}</div>
                                    <div className="text-sm text-white/70">{token.name}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold text-white">{token.weight}%</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeToken(token.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <Slider
                                value={[token.weight]}
                                onValueChange={(value) => updateWeight(token.id, value[0])}
                                max={100}
                                step={1}
                                className="w-full"
                              />
                            </motion.div>
                          ))}
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
                className="space-y-6"
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="w-5 h-5" />
                      DTF Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="dtfName" className="text-white">DTF Name</Label>
                        <Input
                          id="dtfName"
                          value={dtfName}
                          onChange={(e) => setDtfName(e.target.value)}
                          placeholder="e.g., DeFi Blue Chips"
                          className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dtfSymbol" className="text-white">DTF Symbol</Label>
                        <Input
                          id="dtfSymbol"
                          placeholder="e.g., DBC"
                          className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dtfDescription" className="text-white">Description</Label>
                      <Input
                        id="dtfDescription"
                        value={dtfDescription}
                        onChange={(e) => setDtfDescription(e.target.value)}
                        placeholder="Describe your DTF strategy and goals..."
                        className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Initial Investment</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select amount" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100">$100</SelectItem>
                            <SelectItem value="500">$500</SelectItem>
                            <SelectItem value="1000">$1,000</SelectItem>
                            <SelectItem value="5000">$5,000</SelectItem>
                            <SelectItem value="10000">$10,000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Risk Level</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Strategy Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="momentum">Momentum</SelectItem>
                            <SelectItem value="value">Value</SelectItem>
                            <SelectItem value="yield">Yield Farming</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Rebalance Rules */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Rebalance Rules & Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium">Rebalance Threshold</Label>
                          <div className="mt-2 space-y-2">
                            <Slider
                              value={[rebalanceRules.threshold]}
                              onValueChange={(value) => setRebalanceRules(prev => ({ ...prev, threshold: value[0] }))}
                              max={20}
                              step={1}
                              className="w-full"
                            />
                            <div className="text-center text-2xl font-bold">{rebalanceRules.threshold}%</div>
                            <p className="text-sm text-muted-foreground text-center">
                              Trigger rebalancing when any asset deviates by this amount
                            </p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-medium">Rebalance Frequency</Label>
                          <Select 
                            value={rebalanceRules.frequency}
                            onValueChange={(value) => setRebalanceRules(prev => ({ ...prev, frequency: value }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="threshold">Threshold Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium">Max Asset Weight</Label>
                          <div className="mt-2 space-y-2">
                            <Slider
                              value={[rebalanceRules.maxWeight]}
                              onValueChange={(value) => setRebalanceRules(prev => ({ ...prev, maxWeight: value[0] }))}
                              max={80}
                              step={5}
                              className="w-full"
                            />
                            <div className="text-center text-2xl font-bold">{rebalanceRules.maxWeight}%</div>
                            <p className="text-sm text-muted-foreground text-center">
                              Maximum weight any single asset can have
                            </p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-medium">Management Fee</Label>
                          <div className="mt-2 space-y-2">
                            <Slider
                              value={[rebalanceRules.fee]}
                              onValueChange={(value) => setRebalanceRules(prev => ({ ...prev, fee: value[0] }))}
                              max={2}
                              step={0.1}
                              className="w-full"
                            />
                            <div className="text-center text-2xl font-bold">{rebalanceRules.fee}%</div>
                            <p className="text-sm text-muted-foreground text-center">
                              Annual management fee
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Preview & Deploy */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Preview & Deploy DTF
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">DTF Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{dtfName || "Unnamed DTF"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Assets:</span>
                            <span className="font-medium">{selectedTokens.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rebalance:</span>
                            <span className="font-medium">{rebalanceRules.frequency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Threshold:</span>
                            <span className="font-medium">{rebalanceRules.threshold}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fee:</span>
                            <span className="font-medium">{rebalanceRules.fee}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Portfolio Allocation</h3>
                        <div className="space-y-2">
                          {selectedTokens.map((token) => (
                            <div key={token.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-6 h-6 rounded-full bg-gradient-to-r flex items-center justify-center text-sm",
                                  token.color
                                )}>
                                  {token.logo}
                                </div>
                                <span className="text-sm">{token.symbol}</span>
                              </div>
                              <span className="font-medium">{token.weight}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="w-full aspect-[16/9] rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                          <Zap className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-muted-foreground">DTF Preview Visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DTF Creation Integration */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Deploy Your DTF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DTFIntegration 
                    showCreate={true}
                    showInvest={false}
                    showPortfolio={false} dtfAddress={"0x0000000000000000000000000000000000000000"}                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-between"
          >
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {step === 4 ? "Deploy DTF" : "Next"}
              {step !== 4 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="sticky top-6 space-y-6"
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-lg text-white">DTF Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="w-3 h-3 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Diversification</p>
                      <p className="text-xs text-white/70">Use diversified sectors to reduce idiosyncratic risk</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Turnover</p>
                      <p className="text-xs text-white/70">Keep turnover reasonable to minimize costs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Testing</p>
                      <p className="text-xs text-white/70">Test rebalancing rules against past volatility</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-lg text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">Selected Assets:</span>
                  <span className="font-medium text-white">{selectedTokens.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">Total Weight:</span>
                  <span className="font-medium text-white">{totalWeight}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">Estimated Fee:</span>
                  <span className="font-medium text-white">{rebalanceRules.fee}% APY</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      </main>
    </div>
  )
}