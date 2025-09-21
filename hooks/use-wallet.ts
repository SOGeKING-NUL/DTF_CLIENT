import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { ethers } from 'ethers';
import { useAppKit } from '@reown/appkit/react';

export interface WalletState {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
  connect: () => void;
  disconnect: () => void;
  isLoading: boolean;
}

export function useWallet(): WalletState {
  const { address, isConnected, chainId } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { open } = useAppKit();
  
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update provider and signer when wallet connection changes
  useEffect(() => {
    const updateProviderAndSigner = async () => {
      if (isConnected && address) {
        // Add a small delay to ensure wallet is fully connected
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          // Try to get provider from window.ethereum first (for MetaMask and other injected wallets)
          if (typeof window !== 'undefined' && window.ethereum) {
            const ethersProvider = new ethers.BrowserProvider(window.ethereum as any);
            const ethersSigner = await ethersProvider.getSigner();
            
            setProvider(ethersProvider);
            setSigner(ethersSigner);
            console.log('Provider set from window.ethereum');
            return;
          }

          // Fallback: try to get provider from connectors
          if (connectors && connectors.length > 0) {
            const connector = connectors.find(c => 
              c.accounts && Array.isArray(c.accounts) && c.accounts.includes(address)
            );
            if (connector) {
              const provider = await connector.getProvider();
              if (provider && typeof provider === 'object' && 'request' in provider) {
                const ethersProvider = new ethers.BrowserProvider(provider as any);
                const ethersSigner = await ethersProvider.getSigner();
                
                setProvider(ethersProvider);
                setSigner(ethersSigner);
                console.log('Provider set from connector');
              }
            }
          }
        } catch (error) {
          console.error('Failed to update provider and signer:', error);
        }
      } else {
        setProvider(null);
        setSigner(null);
      }
    };

    updateProviderAndSigner();
  }, [isConnected, address, connectors]);

  const connect = () => {
    setIsLoading(true);
    open();
  };

  const disconnect = () => {
    wagmiDisconnect();
  };

  return {
    account: address || null,
    provider,
    signer,
    isConnected,
    chainId: chainId || null,
    balance: balance ? ethers.formatEther(balance.value) : '0',
    connect,
    disconnect,
    isLoading
  };
}
