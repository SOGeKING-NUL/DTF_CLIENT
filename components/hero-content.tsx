"use client";
import Link from "next/link";

export default function HeroContent() {
  const APP_URL = "/dtf";

  return (
    <main className="relative z-20 max-w-6xl mx-auto px-4 pt-24 pb-16 md:pt-28">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl tracking-tight font-semibold text-white mb-4">
          Build index-grade crypto exposure
        </h1>
        <p className="text-lg md:text-xl text-white/85 max-w-3xl mx-auto">
          OSMO lets you compose tokens into smart, rebalanced baskets. One click to diversify, automate, and stay on‑chain.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href={APP_URL} className="inline-flex items-center gap-1 px-5 py-2.5 rounded-md border border-white/40 text-white text-sm hover:bg-white/10">
            Launch App ↗
          </Link>
        </div>
      </div>
    </main>
  );
}
