"use client";

import React from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, RefreshCw, AlertTriangle } from 'lucide-react';

interface WalletConnectionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WalletConnectionGuard({ children, fallback }: WalletConnectionGuardProps) {
  const wallet = useWallet();

  // Show fallback if provided and wallet is not connected
  if (!wallet.isConnected && fallback) {
    return <>{fallback}</>;
  }

  // Default wallet connection prompt
  if (!wallet.isConnected) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Connect your wallet to interact with DTF contracts and manage your portfolio.
          </p>
          <Button 
            onClick={wallet.connect} 
            disabled={wallet.isLoading}
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {wallet.isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show children when wallet is connected
  return (
    <div className="space-y-4">
      {/* Wallet Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Wallet Connected</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {wallet.account?.slice(0, 6)}...{wallet.account?.slice(-4)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {parseFloat(wallet.balance).toFixed(4)} ETH
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={wallet.disconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {children}
    </div>
  );
}

interface NetworkGuardProps {
  children: React.ReactNode;
  allowedChains?: number[];
}

export function NetworkGuard({ children, allowedChains = [1, 42161, 111] }: NetworkGuardProps) {
  const wallet = useWallet();

  // If no specific chain is required, show children
  if (allowedChains.length === 0) {
    return <>{children}</>;
  }

  // If wallet is not connected, show wallet connection prompt
  if (!wallet.isConnected) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-2xl font-semibold mb-2">Wrong Network</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Please connect your wallet and switch to a supported network.
          </p>
          <Button 
            onClick={wallet.connect} 
            disabled={wallet.isLoading}
            size="lg"
          >
            {wallet.isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check if current chain is allowed
  const isAllowedChain = wallet.chainId ? allowedChains.includes(wallet.chainId) : false;

  if (!isAllowedChain) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-2xl font-semibold mb-2">Wrong Network</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Please switch to one of the supported networks:
            <br />
            <span className="font-mono text-sm">
              {allowedChains.map(chainId => {
                switch (chainId) {
                  case 1: return 'Ethereum Mainnet';
                  case 42161: return 'Arbitrum';
                  case 111: return 'Unichain Sepolia';
                  default: return `Chain ID ${chainId}`;
                }
              }).join(', ')}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Current: Chain ID {wallet.chainId}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show children if network is correct
  return <>{children}</>;
}
