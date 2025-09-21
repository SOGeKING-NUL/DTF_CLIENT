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
import { 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  TrendingUp,
  Shield,
  Zap,
  Target
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

  return (
    <main className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-6xl font-semibold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Create new DTF
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
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
            <Card>
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
                          ? "bg-primary text-primary-foreground shadow-lg" 
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        step >= s ? "bg-primary-foreground/20" : "bg-muted-foreground/20"
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Select Assets & Set Weights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Available Tokens */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Available Tokens</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableTokens.map((token) => (
                          <motion.button
                            key={token.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addToken(token)}
                            disabled={!!selectedTokens.find(t => t.id === token.id)}
                            className={cn(
                              "p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-200 text-left",
                              selectedTokens.find(t => t.id === token.id) 
                                ? "opacity-50 cursor-not-allowed" 
                                : "hover:bg-accent/50"
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
                                <div className="font-medium">{token.symbol}</div>
                                <div className="text-sm text-muted-foreground">{token.name}</div>
                                <div className="text-sm font-medium">${token.price.toLocaleString()}</div>
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
                          <h3 className="text-lg font-semibold">Portfolio Allocation</h3>
                          <Badge variant={totalWeight === 100 ? "default" : "destructive"}>
                            {totalWeight}% Total
                          </Badge>
                        </div>
                        <div className="space-y-4">
                          {selectedTokens.map((token) => (
                            <motion.div
                              key={token.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 rounded-lg border border-border bg-accent/20"
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
                                    <div className="font-medium">{token.symbol}</div>
                                    <div className="text-sm text-muted-foreground">{token.name}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold">{token.weight}%</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeToken(token.id)}
                                    className="text-destructive hover:text-destructive"
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      DTF Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="dtfName">DTF Name</Label>
                        <Input
                          id="dtfName"
                          value={dtfName}
                          onChange={(e) => setDtfName(e.target.value)}
                          placeholder="e.g., DeFi Blue Chips"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dtfSymbol">DTF Symbol</Label>
                        <Input
                          id="dtfSymbol"
                          placeholder="e.g., DBC"
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dtfDescription">Description</Label>
                      <Input
                        id="dtfDescription"
                        value={dtfDescription}
                        onChange={(e) => setDtfDescription(e.target.value)}
                        placeholder="Describe your DTF strategy and goals..."
                        className="w-full"
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
                    showPortfolio={false}
                  />
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
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">DTF Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Diversification</p>
                      <p className="text-xs text-muted-foreground">Use diversified sectors to reduce idiosyncratic risk</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Turnover</p>
                      <p className="text-xs text-muted-foreground">Keep turnover reasonable to minimize costs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Testing</p>
                      <p className="text-xs text-muted-foreground">Test rebalancing rules against past volatility</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Selected Assets:</span>
                  <span className="font-medium">{selectedTokens.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Weight:</span>
                  <span className="font-medium">{totalWeight}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Fee:</span>
                  <span className="font-medium">{rebalanceRules.fee}% APY</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  )
}