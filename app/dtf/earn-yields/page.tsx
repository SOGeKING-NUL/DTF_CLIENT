"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import DashboardPageLayout from "@/components/dashboard/layout";
import GearIcon from "@/components/icons/gear";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Zap, 
  DollarSign,
  Users,
  BarChart3,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DTFIntegration } from "@/components/dtf/dtf-integration";

interface YieldDTF {
  id: string;
  name: string;
  description: string;
  apy: number;
  apyChange: number;
  risk: "Low" | "Medium" | "High";
  fee: number;
  tvl: number;
  investors: number;
  rating: number;
  tokens: string[];
  color: string;
  gradient: string;
}

const yieldDTFs: YieldDTF[] = [
  {
    id: "1",
    name: "DeFi Blue Chips",
    description: "Top-performing DeFi tokens with proven track records",
    apy: 12.5,
    apyChange: 2.3,
    risk: "Medium",
    fee: 0.5,
    tvl: 2500000,
    investors: 1247,
    rating: 4.8,
    tokens: ["ETH", "UNI", "AAVE", "COMP"],
    color: "from-blue-500 to-blue-600",
    gradient: "from-blue-500/20 to-blue-600/20"
  },
  {
    id: "2", 
    name: "Layer 1 Leaders",
    description: "Leading blockchain networks and their native tokens",
    apy: 8.9,
    apyChange: -1.2,
    risk: "Low",
    fee: 0.3,
    tvl: 4200000,
    investors: 2156,
    rating: 4.6,
    tokens: ["BTC", "ETH", "SOL", "AVAX"],
    color: "from-purple-500 to-purple-600",
    gradient: "from-purple-500/20 to-purple-600/20"
  },
  {
    id: "3",
    name: "Yield Farming Max",
    description: "High-yield farming strategies with automated compounding",
    apy: 24.7,
    apyChange: 5.8,
    risk: "High",
    fee: 1.2,
    tvl: 890000,
    investors: 567,
    rating: 4.2,
    tokens: ["CRV", "CVX", "BAL", "SUSHI"],
    color: "from-green-500 to-green-600",
    gradient: "from-green-500/20 to-green-600/20"
  },
  {
    id: "4",
    name: "Stablecoin Garden",
    description: "Low-risk stablecoin strategies with consistent returns",
    apy: 6.2,
    apyChange: 0.4,
    risk: "Low",
    fee: 0.2,
    tvl: 1800000,
    investors: 3421,
    rating: 4.9,
    tokens: ["USDC", "USDT", "DAI", "FRAX"],
    color: "from-orange-500 to-orange-600",
    gradient: "from-orange-500/20 to-orange-600/20"
  },
  {
    id: "5",
    name: "AI & Gaming",
    description: "Emerging AI and gaming tokens with growth potential",
    apy: 18.3,
    apyChange: 7.2,
    risk: "High",
    fee: 0.8,
    tvl: 650000,
    investors: 892,
    rating: 4.1,
    tokens: ["FET", "AGIX", "AXS", "SAND"],
    color: "from-pink-500 to-pink-600",
    gradient: "from-pink-500/20 to-pink-600/20"
  },
  {
    id: "6",
    name: "Infrastructure",
    description: "Web3 infrastructure and middleware solutions",
    apy: 15.1,
    apyChange: 3.1,
    risk: "Medium",
    fee: 0.6,
    tvl: 1100000,
    investors: 1456,
    rating: 4.4,
    tokens: ["LINK", "GRT", "RNDR", "FIL"],
    color: "from-cyan-500 to-cyan-600",
    gradient: "from-cyan-500/20 to-cyan-600/20"
  }
];

export default function EarnYieldsPage() {
  const [selectedRisk, setSelectedRisk] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("apy");

  const filteredDTFs = yieldDTFs
    .filter(dtf => selectedRisk === "all" || dtf.risk === selectedRisk)
    .sort((a, b) => {
      switch (sortBy) {
        case "apy":
          return b.apy - a.apy;
        case "tvl":
          return b.tvl - a.tvl;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-500 bg-green-500/20";
      case "Medium":
        return "text-yellow-500 bg-yellow-500/20";
      case "High":
        return "text-red-500 bg-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Earn Yields",
        description: "Deploy into diversified, rules‑based baskets",
        icon: GearIcon,
      }}
    >
      <div className="space-y-6">
        {/* Filters and Sorting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {["all", "Low", "Medium", "High"].map((risk) => (
                    <Button
                      key={risk}
                      variant={selectedRisk === risk ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRisk(risk)}
                      className={cn(
                        "capitalize",
                        selectedRisk === risk && "bg-primary text-primary-foreground"
                      )}
                    >
                      {risk === "all" ? "All Risks" : `${risk} Risk`}
                    </Button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 rounded-md border border-border bg-background text-sm"
                  >
                    <option value="apy">APY</option>
                    <option value="tvl">TVL</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* DTF Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDTFs.map((dtf, index) => (
              <motion.div
                key={dtf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{dtf.name}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {dtf.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{dtf.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Token Pills */}
                    <div className="flex flex-wrap gap-1">
                      {dtf.tokens.map((token) => (
                        <Badge
                          key={token}
                          variant="secondary"
                          className="text-xs px-2 py-1"
                        >
                          {token}
                        </Badge>
                      ))}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-muted-foreground">APY</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{dtf.apy}%</span>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            dtf.apyChange >= 0 ? "text-green-500 bg-green-500/20" : "text-red-500 bg-red-500/20"
                          )}>
                            {dtf.apyChange >= 0 ? "+" : ""}{dtf.apyChange}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span className="text-muted-foreground">Risk</span>
                        </div>
                        <Badge className={cn("text-xs", getRiskColor(dtf.risk))}>
                          {dtf.risk}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="text-muted-foreground">TVL</span>
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(dtf.tvl)}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="text-muted-foreground">Investors</span>
                        </div>
                        <span className="text-sm font-medium">{dtf.investors.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Fee */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Management Fee</span>
                      <span className="font-medium">{dtf.fee}% APY</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        size="sm"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Invest
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Platform Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">15.2%</div>
                  <div className="text-sm text-muted-foreground">Average APY</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">$11.2M</div>
                  <div className="text-sm text-muted-foreground">Total TVL</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">9,739</div>
                  <div className="text-sm text-muted-foreground">Active Investors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.5</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* DTF Investment Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Invest in Your DTF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DTFIntegration 
                dtfAddress="0x0fba25a09dafe7a22fb51fc83d342034034e2cfd"
                showInvest={true}
                showPortfolio={true}
                showCreate={false}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardPageLayout>
  );
}


