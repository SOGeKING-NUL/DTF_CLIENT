"use client";

import React from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  PieChart, 
  BarChart3,
  Zap,
  Plus,
  Bell,
  Calendar,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import PriceTicker from "@/components/web3/price-ticker";

interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  balance: number;
  value: number;
  logo: string;
  color: string;
}

const mockTokens: Token[] = [
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    price: 3245.67,
    change24h: 2.45,
    balance: 1.25,
    value: 4057.09,
    logo: "🔷",
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    price: 67234.89,
    change24h: -1.23,
    balance: 0.045,
    value: 3025.57,
    logo: "🟠",
    color: "from-orange-500 to-orange-600"
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    price: 98.45,
    change24h: 5.67,
    balance: 25.5,
    value: 2510.48,
    logo: "🟣",
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    price: 1.00,
    change24h: 0.01,
    balance: 1500.00,
    value: 1500.00,
    logo: "🔵",
    color: "from-blue-400 to-blue-500"
  }
];

export default function DTFPortfolioDashboard() {
  const totalValue = mockTokens.reduce((sum, token) => sum + token.value, 0);
  const totalChange24h = mockTokens.reduce((sum, token) => {
    return sum + (token.value * (token.change24h / 100));
  }, 0);
  const totalChangePercent = (totalChange24h / totalValue) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Price Ticker */}
      <div className="sticky top-0 z-40">
        <PriceTicker />
      </div>
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Portfolio Section */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold text-foreground">Web3 Portfolio</h1>
              <p className="text-muted-foreground">Manage your DTF investments</p>
            </motion.div>

            {/* Portfolio Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Total Portfolio Value</p>
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl font-bold text-foreground mb-2"
                      >
                        {formatCurrency(totalValue)}
                      </motion.div>
                      <div className={cn(
                        "flex items-center gap-2 text-sm font-medium",
                        totalChangePercent >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {totalChangePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {formatPercentage(totalChangePercent)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Active DTFs</p>
                          <p className="text-2xl font-bold">3</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                      >
                        View All DTFs
                      </Button>
                    </div>
                  </div>
                  
                  <Progress value={75} className="h-2" />
                </CardContent>
              </Card>
            </motion.div>

            {/* Token Holdings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <PieChart className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Token Holdings</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {mockTokens.map((token, index) => (
                      <motion.div
                        key={token.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-accent/20 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-full bg-gradient-to-r flex items-center justify-center text-2xl shadow-lg",
                            token.color
                          )}>
                            {token.logo}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{token.symbol}</div>
                            <div className="text-sm text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-foreground">{formatCurrency(token.value)}</div>
                          <div className="text-sm text-muted-foreground">
                            {token.balance} {token.symbol}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-foreground">{formatCurrency(token.price)}</div>
                          <div className={cn(
                            "text-sm font-medium",
                            token.change24h >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {formatPercentage(token.change24h)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Quick Actions</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-16 flex-col gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                      <DollarSign className="w-6 h-6" />
                      <span className="font-medium">Create DTF</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col gap-2 border-primary/30 hover:bg-primary/5">
                      <TrendingUp className="w-6 h-6" />
                      <span className="font-medium">Earn Yields</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col gap-2 border-primary/30 hover:bg-primary/5">
                      <PieChart className="w-6 h-6" />
                      <span className="font-medium">Analytics</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Floating Notification Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 cursor-pointer shadow-lg">
              <X className="w-4 h-4 mr-2" />
              9 Issues
            </Badge>
          </motion.div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Date & Time */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">SEPTEMBER SUNDAY 21, 2025</div>
                    <div className="text-2xl font-bold text-primary">1:33</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">NOTIFICATIONS</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { title: "PAYMENT RECEIVED", desc: "Your payment to Rampant Studio has been processed successfully.", date: "7/10/2024" },
                      { title: "INTRO: JOYCO STUDIO", desc: "About us - We're a healthcare company focused on accessibility.", date: "7/10/2024" },
                      { title: "SYSTEM UPDATE", desc: "Security patches have been applied to all guard bots.", date: "7/10/2024" }
                    ].map((notification, index) => (
                      <div key={index} className="p-3 rounded-lg bg-accent/20 border border-border/30">
                        <div className="text-xs font-medium text-primary mb-1">{notification.title}</div>
                        <div className="text-xs text-muted-foreground mb-2 line-clamp-2">{notification.desc}</div>
                        <div className="text-xs text-muted-foreground">{notification.date}</div>
                      </div>
        ))}
      </div>

                  <Button variant="ghost" size="sm" className="w-full mt-4">
                    Show All (4)
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Dashboard Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">ISSUES COMPLETED</span>
                        <span className="text-sm font-medium">49%</span>
                      </div>
                      <Progress value={49} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">MINUTES LOST</div>
                      <div className="text-lg font-semibold">642'</div>
      </div>

                    <div>
                      <div className="text-sm text-muted-foreground">ACCIDENTS</div>
                      <div className="text-lg font-semibold">0</div>
                      <div className="text-xs text-muted-foreground">4 WEEKS</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* New Message */}
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                1 NEW MESSAGE
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
