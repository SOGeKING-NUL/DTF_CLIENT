"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
}

const mockPriceData: PriceData[] = [
  { symbol: "BTC", price: 67234.89, change24h: -1234.56, changePercent24h: -1.8 },
  { symbol: "ETH", price: 3245.67, change24h: 89.23, changePercent24h: 2.8 },
  { symbol: "SOL", price: 98.45, change24h: 5.67, changePercent24h: 6.1 },
  { symbol: "BNB", price: 315.23, change24h: -2.45, changePercent24h: -0.8 },
  { symbol: "ADA", price: 0.4550, change24h: 0.02, changePercent24h: 4.7 },
  { symbol: "DOT", price: 6.78, change24h: -0.23, changePercent24h: -3.3 },
  { symbol: "MATIC", price: 0.89, change24h: 0.05, changePercent24h: 5.9 },
  { symbol: "AVAX", price: 25.67, change24h: 1.23, changePercent24h: 5.0 },
];

export default function PriceTicker() {
  const [prices, setPrices] = useState<PriceData[]>(mockPriceData);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate price updates
      setPrices(prevPrices => 
        prevPrices.map(price => ({
          ...price,
          price: price.price * (1 + (Math.random() - 0.5) * 0.02),
          change24h: price.change24h * (1 + (Math.random() - 0.5) * 0.1),
          changePercent24h: price.changePercent24h * (1 + (Math.random() - 0.5) * 0.1),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % prices.length);
    }, 3000);

    return () => clearInterval(tickerInterval);
  }, [prices.length]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (changePercent: number) => {
    const sign = changePercent >= 0 ? "+" : "";
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  return (
    <div className="w-full overflow-hidden bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center gap-8 animate-marquee py-3">
        {prices.map((price, index) => (
          <motion.div
            key={price.symbol}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-3 whitespace-nowrap"
          >
            <span className="font-mono text-sm font-semibold text-foreground">{price.symbol}</span>
            <span className="text-sm font-medium text-foreground">{formatPrice(price.price)}</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs px-2 py-1 font-medium",
                price.changePercent24h >= 0
                  ? "bg-green-500/20 text-green-600 border-green-500/30"
                  : "bg-red-500/20 text-red-600 border-red-500/30"
              )}
            >
              <div className="flex items-center gap-1">
                {price.changePercent24h >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{formatChangePercent(price.changePercent24h)}</span>
              </div>
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
