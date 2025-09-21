"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from '@/hooks/use-wallet'
import Link from 'next/link'
import { 
  Target,
  Search
} from "lucide-react"
import { ModernDTFCreator } from "@/components/dtf/modern-dtf-creator"

export default function CreateDTFPage() {
  const wallet = useWallet()
  const [createdDTF, setCreatedDTF] = useState<string | null>(null)

  const handleDTFCreated = (dtfAddress: string) => {
    setCreatedDTF(dtfAddress);
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 sm:gap-8">
                <Link href="/">
                  <h1 className="text-xl sm:text-2xl font-bold">OSMO</h1>
                </Link>
                <nav className="hidden lg:flex items-center gap-6">
                  <Link href="/dtf" className="text-white/70 hover:text-white transition-colors">Discover DTFs</Link>
                  <Link href="/dtf/earn-yields" className="text-white/70 hover:text-white transition-colors">Earn Yield</Link>
                  <Link href="/dtf/create" className="text-blue-400 font-medium">Create New DTF</Link>
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 text-white/70 flex items-center justify-center">
                <Target className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Connect Your Wallet</h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Connect your wallet to create and deploy your own DTF with custom token allocations and rebalancing rules.
              </p>
              <Button 
                onClick={wallet.connect} 
                disabled={wallet.isLoading}
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {wallet.isLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link href="/">
                <h1 className="text-xl sm:text-2xl font-bold">OSMO</h1>
              </Link>
              <nav className="hidden lg:flex items-center gap-6">
                <Link href="/dtf" className="text-white/70 hover:text-white transition-colors">Discover DTFs</Link>
                <Link href="/dtf/earn-yields" className="text-white/70 hover:text-white transition-colors">Earn Yield</Link>
                <Link href="/dtf/create" className="text-blue-400 font-medium">Create New DTF</Link>
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Create Your DTF
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Design and deploy your own Decentralized Token Fund with custom allocations and automated rebalancing.
          </p>
        </motion.div>

        <ModernDTFCreator onDTFCreated={handleDTFCreated} />
      </main>
    </div>
  )
}