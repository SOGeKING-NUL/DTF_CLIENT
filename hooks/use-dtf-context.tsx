"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useWallet } from './use-wallet';
import { useDTFFactory } from '@/lib/dtf-contract';
import { ethers } from 'ethers';
import DTFFACTORY_ABI from '@/DTF/abi/DTFFactory';

// DTF data interface
export interface DTFData {
  dtfAddress: string;
  creator: string;
  name: string;
  symbol: string;
  tokens: string[];
  weights: number[];
  createdAt: number;
  active: boolean;
}

// Enhanced token data interface
export interface TokenData {
  id: number;
  symbol: string;
  name: string;
  weight: number;
  price?: number;
  change24h?: number;
  logo: string;
  color: string;
}

// Context state interface
interface DTFContextState {
  dtfs: DTFData[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  refreshDTFs: () => Promise<void>;
  getDTFByAddress: (address: string) => DTFData | undefined;
  getDTFTokens: (address: string) => TokenData[];
  isInitialized: boolean;
}

// Create the context
const DTFContext = createContext<DTFContextState | undefined>(undefined);

// Helper function to get token symbol
const getTokenSymbol = (tokenAddress: string) => {
  if (tokenAddress === '0x0000000000000000000000000000000000000000') return 'ETH';
  const tokenMap: { [key: string]: string } = {
    '0xA0b86a33E6441d8e3C0d0a3b8d0b8d0b8d0b8d0b': 'USDC',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
  };
  return tokenMap[tokenAddress] || tokenAddress.slice(0, 6) + '...';
};

// Enhanced token data with dynamic pricing
const getTokenData = (tokenAddress: string, weight: number): TokenData => {
  const tokenMap: { [key: string]: { name: string; symbol: string; logo: string; color: string; price: number; change24h: number } } = {
    '0x0000000000000000000000000000000000000000': { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      logo: 'Ξ', 
      color: 'from-blue-500 to-blue-600',
      price: 3245.67,
      change24h: -1.2
    },
    '0xA0b86a33E6441d8e3C0d0a3b8d0b8d0b8d0b8d0b': { 
      name: 'USD Coin', 
      symbol: 'USDC', 
      logo: '$', 
      color: 'from-green-500 to-green-600',
      price: 1.00,
      change24h: 0.01
    },
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': { 
      name: 'Tether', 
      symbol: 'USDT', 
      logo: '₮', 
      color: 'from-teal-500 to-teal-600',
      price: 1.00,
      change24h: -0.01
    }
  };

  const tokenInfo = tokenMap[tokenAddress] || {
    name: 'Unknown Token',
    symbol: tokenAddress.slice(0, 6) + '...',
    logo: '?',
    color: 'from-gray-500 to-gray-600',
    price: 0,
    change24h: 0
  };

  return {
    id: Math.random(),
    symbol: tokenInfo.symbol,
    name: tokenInfo.name,
    weight: weight,
    price: tokenInfo.price,
    change24h: tokenInfo.change24h,
    logo: tokenInfo.logo,
    color: tokenInfo.color
  };
};

// Provider component
export function DTFProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const factoryService = useDTFFactory(wallet.provider, wallet.signer || undefined);
  
  const [dtfs, setDtfs] = useState<DTFData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref to track if we've already fetched data to prevent multiple calls
  const hasFetchedData = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all DTFs from factory
  const fetchDTFs = async () => {
    if (hasFetchedData.current || loading) {
      console.log('Skipping fetch - already fetched or currently loading');
      return;
    }

    console.log('Starting DTF fetch from context...');
    
    try {
      hasFetchedData.current = true;
      setIsInitialized(true);
      setLoading(true);
      setError(null);

      console.log('Fetching all DTFs from factory...');
      
      // Create contract instance directly with timeout
      const DTF_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_DTF_FACTORY_ADDRESS || "0xDA099Db187399f501bA3Dccf688DEd37fc66dF6e";
      
      // Use wallet provider or fallback to custom RPC
      let provider: any = wallet.provider;
      if (!provider) {
        console.log('Using fallback provider...');
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.unichain.org';
        provider = new ethers.JsonRpcProvider(rpcUrl);
      }
      
      const factoryContract = new ethers.Contract(DTF_FACTORY_ADDRESS, DTFFACTORY_ABI, provider);
      
      console.log('Contract created, calling getAllDTFs...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        fetchTimeoutRef.current = setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });
      
      const dtfsPromise = factoryContract.getAllDTFs();
      const rawDtfs = await Promise.race([dtfsPromise, timeoutPromise]);
      
      console.log('Raw DTFs from contract:', rawDtfs);
      
      // Transform the data
      const allDTFs = rawDtfs.map((dtf: any) => ({
        dtfAddress: dtf.dtfAddress,
        creator: dtf.creator,
        name: dtf.name,
        symbol: dtf.symbol,
        tokens: dtf.tokens,
        weights: dtf.weights.map((weight: any) => Number(weight) / 100), // Convert from basis points to percentage
        createdAt: Number(dtf.createdAt),
        active: dtf.active
      }));
      
      console.log('Transformed DTFs:', allDTFs);
      console.log('Number of DTFs found:', allDTFs.length);
      
      setDtfs(allDTFs);
      setLastFetchTime(Date.now());
    } catch (err: any) {
      console.error('Error fetching DTFs:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      setError(err.message || 'Failed to fetch DTF data');
      hasFetchedData.current = false; // Reset on error so user can retry
    } finally {
      setLoading(false);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    }
  };

  // Manual refresh function
  const refreshDTFs = async () => {
    hasFetchedData.current = false; // Reset the flag to allow refetch
    await fetchDTFs();
  };

  // Get DTF by address
  const getDTFByAddress = (address: string): DTFData | undefined => {
    return dtfs.find(dtf => dtf.dtfAddress.toLowerCase() === address.toLowerCase());
  };

  // Get enhanced token data for a DTF
  const getDTFTokens = (address: string): TokenData[] => {
    const dtf = getDTFByAddress(address);
    if (!dtf) return [];
    
    return dtf.tokens.map((token, index) => getTokenData(token, dtf.weights[index]));
  };

  // Fetch DTFs on mount and when wallet changes
  useEffect(() => {
    if (wallet.provider && !hasFetchedData.current) {
      fetchDTFs();
    }
  }, [wallet.provider, wallet.isConnected]);

  // Reset fetch state when wallet disconnects
  useEffect(() => {
    if (!wallet.isConnected) {
      hasFetchedData.current = false;
      setIsInitialized(false);
      setDtfs([]);
      setLastFetchTime(null);
      setError(null);
    }
  }, [wallet.isConnected]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const contextValue: DTFContextState = {
    dtfs,
    loading,
    error,
    lastFetchTime,
    refreshDTFs,
    getDTFByAddress,
    getDTFTokens,
    isInitialized
  };

  return (
    <DTFContext.Provider value={contextValue}>
      {children}
    </DTFContext.Provider>
  );
}

// Custom hook to use DTF context
export function useDTF() {
  const context = useContext(DTFContext);
  if (context === undefined) {
    throw new Error('useDTF must be used within a DTFProvider');
  }
  return context;
}

// Additional helper hook for transformed DTF data (for backward compatibility)
export function useTransformedDTFs() {
  const { dtfs, loading, error } = useDTF();
  
  const transformedDtfData = dtfs.map((dtf, index) => ({
    id: index + 1,
    name: dtf.name,
    ticker: `$${dtf.symbol}`,
    backing: dtf.tokens.map(token => getTokenSymbol(token)),
    tokens: dtf.tokens.map((token, tokenIndex) => getTokenData(token, dtf.weights[tokenIndex])),
    tags: ['DTF'],
    performance: 0, // Placeholder
    price: 1.0, // Placeholder
    marketCap: 0, // Placeholder
    icon: dtf.name.charAt(0).toUpperCase(),
    color: `bg-${['blue', 'green', 'purple', 'red', 'yellow', 'indigo', 'pink', 'teal'][index % 8]}-500`,
    dtfAddress: dtf.dtfAddress,
    creator: dtf.creator,
    createdAt: dtf.createdAt,
    active: dtf.active
  }));

  return {
    transformedDtfData,
    loading,
    error,
    rawDtfs: dtfs
  };
}
