"use client";

import React, { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
} from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TokenData {
  id: number;
  symbol: string;
  name: string;
  weight: number;
  price?: number;
  change24h?: number;
  logo: string;
  color: string;
}

interface DTFTokenTooltipProps {
  tokens: TokenData[];
  maxDisplay?: number;
}

export const DTFTokenTooltip = ({ tokens, maxDisplay = 5 }: DTFTokenTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const displayTokens = tokens.slice(0, maxDisplay);
  const remainingCount = tokens.length - maxDisplay;

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1) {
      return `$${value.toFixed(2)}`;
    } else {
      return `$${value.toFixed(6)}`;
    }
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    const icon = isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
    const color = isPositive ? "text-green-400" : "text-red-400";
    
    return (
      <span className={`flex items-center gap-1 ${color}`}>
        {icon}
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="relative inline-block group">
      {/* Token circles */}
      <div 
        className="flex items-center gap-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {displayTokens.map((token, idx) => (
          <motion.div
            key={token.id}
            whileHover={{ scale: 1.1 }}
            className={`w-8 h-8 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-xs font-bold text-white border-2 border-white/20 transition-all duration-200 cursor-pointer hover:border-white/40 relative`}
            style={{ 
              marginLeft: idx > 0 ? '-4px' : '0',
              zIndex: displayTokens.length - idx 
            }}
          >
            {token.logo}
          </motion.div>
        ))}
        
        {remainingCount > 0 && (
          <div 
            className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white/70 hover:bg-white/20 transition-colors cursor-pointer relative z-0"
            style={{ marginLeft: '-4px' }}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Dropdown Tooltip */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-40"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="p-4 max-h-64 overflow-y-auto space-y-3">
              {tokens.map((token, idx) => (
                <motion.div
                  key={token.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group/item flex items-center gap-3 p-3 rounded-lg bg-white/2 border border-white/5 hover:bg-white/5 transition-all duration-200"
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-sm font-bold text-white border border-white/20 flex-shrink-0`}>
                    {token.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate text-sm">{token.name}</h4>
                        <p className="text-white/70 text-xs truncate">{token.symbol}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-blue-400 font-bold text-xs">{token.weight.toFixed(2)}%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 rounded p-1.5 group-hover/item:bg-white/10 transition-colors">
                        <p className="text-white/70 mb-0.5">Price</p>
                        <p className="text-white font-medium">{formatCurrency(token.price || 0)}</p>
                      </div>
                      <div className="bg-white/5 rounded p-1.5 group-hover/item:bg-white/10 transition-colors">
                        <p className="text-white/70 mb-0.5">24h Change</p>
                        {token.change24h !== undefined ? formatChange(token.change24h) : (
                          <p className="text-white/70">--</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Arrow */}
            <div className="absolute top-[-4px] left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-white/5"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};