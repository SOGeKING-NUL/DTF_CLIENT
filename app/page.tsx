"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import Header from "@/components/header"
import HeroContent from "@/components/hero-content"
import ShaderBackground from "@/components/shader-background"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  PieChart,
  BarChart3,
  ArrowRight,
  Play,
  Star,
  Users,
  Activity,
  Globe,
  Lock,
  ChevronRight,
  Sparkles,
  Target,
  Layers
} from "lucide-react"
import Link from "next/link"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "DeFi Investor",
    content: "OSMO transformed my portfolio management. The automated rebalancing alone increased my returns by 40%.",
    avatar: "👩‍💼",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Crypto Trader",
    content: "Finally, a platform that makes complex DeFi strategies accessible. The UI is intuitive and the results speak for themselves.",
    avatar: "👨‍💻",
    rating: 5
  },
  {
    name: "Elena Volkov",
    role: "Portfolio Manager",
    content: "Professional-grade tools with an interface that doesn't require a PhD in crypto. Perfect for both beginners and experts.",
    avatar: "👩‍🎓",
    rating: 5
  }
]

export default function Web3LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <ShaderBackground>
      <Header />
      <HeroContent />

      {/* Minimal Branding Badge */}
      <section className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white px-6 py-2 text-sm font-medium rounded-full">
              <Sparkles className="w-4 h-4 mr-2" />
              OSMO - Your Decentralized Token Folio
            </Badge>
          </motion.div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Target,
                color: "from-blue-500 to-cyan-500",
                title: "Diversify in Seconds",
                description: "Build balanced portfolios across majors, stables, and themes without the hassle.",
                subtitle: "Portfolio Builder"
              },
              {
                icon: Layers,
                color: "from-purple-500 to-violet-500",
                title: "Track Any Theme",
                description: "Monitor ecosystems, L2s, RWAs, or AI—bundle into self-updating assets.",
                subtitle: "Theme Tracking"
              },
              {
                icon: Zap,
                color: "from-green-500 to-emerald-500",
                title: "Automate Everything",
                description: "Set rules for rebalancing and safety with transparent on-chain execution.",
                subtitle: "Auto-Rebalancing"
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 h-full overflow-hidden">
                    <CardContent className="p-6 space-y-6">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color}/10 border border-white/20 group-hover:bg-gradient-to-r group-hover:${feature.color}/20 transition-colors duration-300`}>
                        <Icon className={`w-6 h-6 ${feature.color.split(' ')[0].replace('from-', 'text-')}/400`} />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xl font-medium text-white">{feature.title}</h3>
                        <p className="text-white/80 leading-relaxed text-sm">{feature.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-xs text-white/60">{feature.subtitle}</span>
                        <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-medium">
                Ready to Build Your <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">DTF</span>?
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">Join thousands managing DeFi portfolios with OSMO's secure, multi-chain platform.</p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full"
            >
              <Link href="/dtf" className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Create Your First DTF</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-white/60">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Non-Custodial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Multi-Chain</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Audited</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </ShaderBackground>
  )
}