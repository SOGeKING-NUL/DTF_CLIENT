"use client";

import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
} from "motion/react";
import { ArrowRight } from "lucide-react";

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const displayTokens = tokens.slice(0, maxDisplay);
  const remainingCount = tokens.length - maxDisplay;

  const formatCurrency = (value: number) => {
    if (value >= 1) {
      return `$${value.toFixed(2)}`;
    } else {
      return `$${value.toFixed(6)}`;
    }
  };

  return (
    <div className="relative group">
      {/* Token circles - matching the overlapping design from screenshot */}
      <div className="flex items-center gap-1">
        {displayTokens.map((token, idx) => (
          <div
            key={token.id}
            className={`w-8 h-8 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-xs font-bold text-white border border-white/20 hover:scale-110 transition-transform duration-200 cursor-pointer`}
            style={{ marginLeft: idx > 0 ? '-4px' : '0', zIndex: displayTokens.length - idx }}
            onMouseEnter={() => setHoveredIndex(token.id)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {token.logo}
          </div>
        ))}
        
        {/* Show remaining count if there are more tokens */}
        {remainingCount > 0 && (
          <div 
            className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white/70"
            style={{ marginLeft: '-4px', zIndex: 0 }}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Hover tooltip - exact design from screenshot */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-2 left-0 z-50 w-[320px] p-3 rounded-2xl bg-white/10 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl ring-1 ring-white/20 shadow-[0_10px_50px_rgba(0,0,0,0.45)]"
          >
            {/* Header with overlapping token circles - exactly like screenshot */}
            <div className="flex items-center gap-1 mb-4">
              {displayTokens.slice(0, 5).map((token, idx) => (
                <div
                  key={token.id}
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-xs font-bold text-white border border-white/20`}
                  style={{ marginLeft: idx > 0 ? '-4px' : '0', zIndex: 5 - idx }}
                >
                  {token.logo}
                </div>
              ))}
              {remainingCount > 0 && (
                <div 
                  className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white/70"
                  style={{ marginLeft: '-4px', zIndex: 0 }}
                >
                  +{remainingCount}
                </div>
              )}
            </div>

            {/* Token list - exact layout and styling from screenshot */}
            <div className="space-y-3">
              {tokens.map((token) => (
                <div key={token.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-xs font-bold text-white border border-white/20`}>
                      {token.logo}
                    </div>
                    <div>
                      <div className="text-blue-400 text-sm font-medium">{token.weight.toFixed(2)}%</div>
                      <div className="text-white text-xs">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-white/70 text-sm font-medium">
                    ${token.symbol}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer button - matching screenshot design */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <button className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                View entire basket
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
