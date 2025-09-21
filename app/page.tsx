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
import {BentoCard} from "@/components/demo" 

const features = [
  {
    icon: TrendingUp,
    title: "Smart Rebalancing",
    description: "AI-powered portfolio optimization that adapts to market conditions in real-time.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30"
  },
  {
    icon: Shield,
    title: "Non-Custodial",
    description: "Your keys, your coins. Full control with institutional-grade security.",
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30"
  },
  {
    icon: Zap,
    title: "Gas Optimized",
    description: "Batch transactions and smart routing for minimal fees and maximum efficiency.",
    gradient: "from-purple-500/20 to-violet-500/20",
    border: "border-purple-500/30"
  },
  {
    icon: PieChart,
    title: "Diversified Baskets",
    description: "Access professionally curated token baskets across multiple sectors and themes.",
    gradient: "from-orange-500/20 to-amber-500/20",
    border: "border-orange-500/30"
  }
]

const stats = [
  { label: "Total Value Locked", value: "$2.4M", change: "+12.5%", icon: DollarSign },
  { label: "Active DTFs", value: "156", change: "+8.2%", icon: Activity },
  { label: "Average APY", value: "18.7%", change: "+2.1%", icon: TrendingUp },
  { label: "Happy Users", value: "2.1K", change: "+15.3%", icon: Users }
]

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

      {/* Enhanced Hero Section with Web3 Focus */}
      <section className="relative z-20 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            {/* OSMO Branding */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-violet-500/30 text-white px-6 py-2 text-sm font-medium mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                OSMO - Your Friendly DTF
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/20 hover:border-violet-500/50 transition-all duration-300 h-full">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-semibold">Start here:<br />diversify in seconds.</h3>
                  </div>
                  <p className="text-white/90 leading-relaxed">Spin up a portfolio with balanced exposure across majors, stables, and themes — no spreadsheets, no guesswork.</p>
                  <div className="mt-6 aspect-[4/3] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 mx-auto flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-sm text-white/70">Portfolio Builder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/20 hover:border-purple-500/50 transition-all duration-300 h-full">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30">
                      <Layers className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-semibold">Go further:<br />track any theme.</h3>
                  </div>
                  <p className="text-white/90 leading-relaxed">Follow ecosystems, L2s, RWAs, or AI — bundle tokens into a single asset that updates itself.</p>
                  <div className="mt-6 aspect-[4/3] bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-lg border border-purple-500/20 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 mx-auto flex items-center justify-center">
                        <PieChart className="w-6 h-6 text-purple-400" />
                      </div>
                      <p className="text-sm text-white/70">Theme Tracking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/20 hover:border-green-500/50 transition-all duration-300 h-full">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                      <Zap className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-semibold">Automate:<br />rules, rebalances, safety.</h3>
                  </div>
                  <p className="text-white/90 leading-relaxed">Set guardrails and let the basket manage itself with transparent on‑chain execution.</p>
                  <div className="mt-6 aspect-[4/3] bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 mx-auto flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-400" />
                      </div>
                      <p className="text-sm text-white/70">Auto-Rebalancing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="w-full bg-background h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 grow h-full">
        <div className="md:col-span-2">
          <BentoCard
            title="Total Revenue"
            value="$1,234,567"
            subtitle="15% increase from last month"
            colors={["#3B82F6", "#60A5FA", "#93C5FD"]}
            delay={0.2}
          />
        </div>
        <BentoCard
          title="New Users"
          value={1234}
          subtitle="Daily signups"
          colors={["#60A5FA", "#34D399", "#93C5FD"]}
          delay={0.4}
        />
        <BentoCard
          title="Conversion Rate"
          value="3.45%"
          subtitle="0.5% increase from last week"
          colors={["#F59E0B", "#A78BFA", "#FCD34D"]}
          delay={0.6}
        />
        <div className="md:col-span-2">
          <BentoCard
            title="Active Projects"
            value={42}
            subtitle="8 completed this month"
            colors={["#3B82F6", "#A78BFA", "#FBCFE8"]}
            delay={0.8}
          />
        </div>
        <div className="md:col-span-3">
          <BentoCard
            title="Customer Satisfaction"
            value="4.8/5"
            subtitle="Based on 1,000+ reviews from verified customers across all product categories"
            colors={["#EC4899", "#F472B6", "#3B82F6"]}
            delay={1}
          />
        </div>
      </div>
    </div>

      {/* Web3 Features Section */}
      <section className="relative z-10 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-16"
          >
            <div className="space-y-1">
              <h2 className="text-4xl md:text-6xl font-semibold">
                Built for the <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">DeFi</span>
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Experience the next generation of portfolio management with cutting-edge Web3 technology.
              </p>
            </div>
            <section className="relative z-10 text-white">
              <div className="max-w-4xl mx-auto px-4 py-16">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="text-center space-y-8"
                >
                  <Card className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 backdrop-blur-sm border-white/20">
                    <CardContent className="p-12 space-y-8">
                      <div className="space-y-4">
                        <h2 className="text-4xl md:text-6xl font-semibold">
                          Ready to Start Your <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">DTF Journey</span>?
                        </h2>
                        <p className="text-xl text-white/90">
                          Join thousands of investors who trust OSMO for their DeFi portfolio management.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 cursor-pointer"
                        >
                          <DollarSign className="w-5 h-5 mr-2" />
                          Create Your First DTF
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-center space-x-8 text-sm text-white/70">
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
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </section>
          </motion.div>
        </div>
      </section>

    </ShaderBackground>
  )
}
