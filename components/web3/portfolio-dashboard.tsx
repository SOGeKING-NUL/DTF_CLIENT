"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface PortfolioStats {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent: number;
  tokens: Token[];
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

export default function PortfolioDashboard() {
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalChange24h: 0,
    totalChangePercent: 0,
    tokens: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and calculating portfolio stats
    const timer = setTimeout(() => {
      const totalValue = mockTokens.reduce((sum, token) => sum + token.value, 0);
      const totalChange24h = mockTokens.reduce((sum, token) => {
        return sum + (token.value * (token.change24h / 100));
      }, 0);
      const totalChangePercent = (totalChange24h / totalValue) * 100;

      setPortfolioStats({
        totalValue,
        totalChange24h,
        totalChangePercent,
        tokens: mockTokens
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold"
                >
                  {formatCurrency(portfolioStats.totalValue)}
                </motion.div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  portfolioStats.totalChangePercent >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {portfolioStats.totalChangePercent >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatPercentage(portfolioStats.totalChangePercent)}
                </div>
                <p className="text-xs text-muted-foreground">24h change</p>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active DTFs</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              View All DTFs
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Token Holdings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Token Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tokens" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="allocation">Allocation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tokens" className="space-y-4">
                <AnimatePresence>
                  {portfolioStats.tokens.map((token, index) => (
                    <motion.div
                      key={token.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-full bg-gradient-to-r flex items-center justify-center text-xl",
                          token.color
                        )}>
                          {token.logo}
                        </div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-muted-foreground">{token.name}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(token.value)}</div>
                        <div className="text-sm text-muted-foreground">
                          {token.balance} {token.symbol}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(token.price)}</div>
                        <div className={cn(
                          "text-sm font-medium",
                          token.change24h >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {formatPercentage(token.change24h)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </TabsContent>
              
              <TabsContent value="allocation">
                <div className="space-y-4">
                  {portfolioStats.tokens.map((token, index) => {
                    const percentage = (token.value / portfolioStats.totalValue) * 100;
                    return (
                      <motion.div
                        key={token.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full bg-gradient-to-r flex items-center justify-center text-sm",
                              token.color
                            )}>
                              {token.logo}
                            </div>
                            <span className="font-medium">{token.symbol}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className="h-2"
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-16 flex-col gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <DollarSign className="w-6 h-6" />
                <span>Create DTF</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <TrendingUp className="w-6 h-6" />
                <span>Earn Yields</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <PieChart className="w-6 h-6" />
                <span>Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
