import { ethers } from 'ethers';

/**
 * Get a custom provider using the RPC URL from environment variables
 */
export function getCustomProvider() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.unichain.org';
  console.log('Using RPC URL:', rpcUrl);
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Get a provider instance for the current network
 */
export function getProvider(network?: string) {
  if (typeof window !== 'undefined') {
    // Client-side: use the browser provider (wallet)
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum as any);
    }
  }
  
  // Server-side or fallback: use custom RPC
  return getCustomProvider();
}
