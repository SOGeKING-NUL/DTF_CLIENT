// Import necessary modules and types
import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, unichainSepolia } from '@reown/appkit/networks'

// Custom Unichain Sepolia configuration with custom RPC
const customUnichainSepolia = {
  ...unichainSepolia,
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.unichain.org'] },
    public: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.unichain.org'] }
  }
}

// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [mainnet, arbitrum, customUnichainSepolia]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig