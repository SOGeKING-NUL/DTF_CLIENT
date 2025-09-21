"use client";
import App from "next/app";
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
          <div
            id="gooey-btn"
            className="hidden md:flex relative items-center group"
            style={{ filter: "url(#gooey-filter)" }}
          >
            <a
              href={APP_URL || "#"}
              target={APP_URL ? "_blank" : undefined}
              rel={APP_URL ? "noopener noreferrer" : undefined}
              className="absolute right-0 px-6 py-6 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-12 flex items-center justify-center translate-x-5 group-hover:translate-x-12 z-0"
              aria-label="Visit Maatrika Art"
              title="Visit Maatrika Art"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 17L17 7M17 7H7M17 7V17"
                />
              </svg>
            </a>
            <a
              href={APP_URL || "#"}
              target={APP_URL ? "_blank" : undefined}
              rel={APP_URL ? "noopener noreferrer" : undefined}
              className="px-6 py-6 rounded-full bg-white font-bold text-black text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-12 flex items-center z-10 whitespace-nowrap"
              aria-label="Visit Maatrika Art"
            >
              Launch App
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
