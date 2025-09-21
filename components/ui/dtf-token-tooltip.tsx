"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
} from "motion/react";
import { X, TrendingUp, TrendingDown } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const displayTokens = tokens.slice(0, maxDisplay);
  const remainingCount = tokens.length - maxDisplay;

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

  const handleTokenHover = () => {
    // Clear any existing close timeout
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    
    // Clear any existing hover timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    
    // Set a small delay before opening modal to prevent accidental triggers
    const timeout = setTimeout(() => {
      setIsModalOpen(true);
    }, 200);
    
    setHoverTimeout(timeout);
  };

  const handleTokenLeave = () => {
    // Clear hover timeout if user leaves before modal opens
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    
    // Set close timeout to allow user to move to modal
    const timeout = setTimeout(() => {
      setIsModalOpen(false);
    }, 300);
    
    setCloseTimeout(timeout);
  };

  const handleModalHover = () => {
    // Clear close timeout when hovering over modal
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
  };

  const handleModalLeave = () => {
    // Set a short delay before closing when leaving modal
    const timeout = setTimeout(() => {
      setIsModalOpen(false);
    }, 200);
    setCloseTimeout(timeout);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [hoverTimeout, closeTimeout]);

  return (
    <div className="relative group">
      {/* Token circles */}
      <div 
        className="flex items-center gap-1 group"
        onMouseEnter={handleTokenHover}
        onMouseLeave={handleTokenLeave}
      >
        {displayTokens.map((token, idx) => (
          <div
            key={token.id}
            className={`w-10 h-10 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-sm font-bold text-white border-2 border-white/20 hover:scale-110 transition-all duration-300 cursor-pointer hover:border-white/40`}
            style={{ marginLeft: idx > 0 ? '-6px' : '0', zIndex: displayTokens.length - idx }}
          >
            {token.logo}
          </div>
        ))}
        
        {/* Show remaining count if there are more tokens */}
        {remainingCount > 0 && (
          <div 
            className="w-10 h-10 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-sm font-bold text-white/70 hover:bg-white/20 transition-colors cursor-pointer"
            style={{ marginLeft: '-6px', zIndex: 0 }}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* All Tokens Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleModalClose}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[500px] max-w-[95vw] sm:max-w-[90vw] max-h-[80vh] overflow-hidden"
              onMouseEnter={handleModalHover}
              onMouseLeave={handleModalLeave}
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col">
                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="space-y-4">
                    {tokens.map((token, index) => (
                      <div key={token.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/8 transition-colors">
                        {/* Token Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-sm font-bold text-white border border-white/20`}>
                            {token.logo}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{token.name}</h4>
                            <p className="text-white/70 text-sm">{token.symbol}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-400 font-bold">{token.weight.toFixed(2)}%</div>
                            <div className="text-white/70 text-xs">Weight</div>
                          </div>
                        </div>

                        {/* Token Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-white/70 text-xs mb-1">Current Price</p>
                            <p className="text-white font-semibold">{formatCurrency(token.price || 0)}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-white/70 text-xs mb-1">24h Change</p>
                            {token.change24h !== undefined ? formatChange(token.change24h) : (
                              <p className="text-white/70 text-sm">--</p>
                            )}
                          </div>
                        </div>

                        {/* Weight Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(token.weight, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
