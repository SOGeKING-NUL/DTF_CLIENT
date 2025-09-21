"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, X } from "lucide-react";
import { createPortal } from "react-dom";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [dtfOpen, setDtfOpen] = useState(false);
  const dtfRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close DTF dropdown on outside click / ESC
  useEffect(() => {
    if (!dtfOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!dtfRef.current) return;
      if (!dtfRef.current.contains(e.target as Node)) {
        setDtfOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDtfOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [dtfOpen]);

  return (
    <header className="relative z-50 flex items-center justify-between px-4 sm:px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/">
          <span className="text-white text-lg md:text-xl lg:text-2xl font-semibold tracking-wide">
            OSMO
          </span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        <Link href="#about" className="text-white/80 hover:text-white text-sm px-3 py-2 rounded-full hover:bg-white/10 transition-all">About</Link>

        <div className="relative" ref={dtfRef} onMouseEnter={() => setDtfOpen(true)} onMouseLeave={() => setDtfOpen(false)}>
          <button
            onClick={() => setDtfOpen((v) => !v)}
            aria-expanded={dtfOpen}
            aria-haspopup="menu"
            className="inline-flex items-center text-white/90 hover:text-white text-sm px-3 py-2 rounded-full hover:bg-white/10 transition-all"
          >
            DTFs <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${dtfOpen ? "rotate-180" : "rotate-0"}`} />
          </button>

          {dtfOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 z-50 w-[280px] sm:w-[320px] md:w-[360px] lg:w-[400px] max-w-[min(90vw,400px)] p-3 rounded-2xl bg-white/10 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl ring-1 ring-white/20 shadow-[0_10px_50px_rgba(0,0,0,0.45)]"
            >
              <div className="pointer-events-none absolute -inset-6 -z-10 bg-[radial-gradient(closest-side,rgba(255,255,255,0.2),transparent)] opacity-60 blur-2xl" />
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: "Discover Yield", description: "Explore opportunities", href: "/dtf/discover-yield" },
                  { label: "Earn Yields", description: "Start earning rewards", href: "/dtf/earn-yields" },
                  { label: "Create DTF", description: "Build your own basket", href: "/dtf/create" },
                ].map((it) => (
                  <Link
                    key={it.label}
                    href={it.href}
                    className="group rounded-xl p-4 bg-white/5 hover:bg-white/10 transition ring-1 ring-inset ring-white/10 hover:ring-white/20"
                    onClick={() => setDtfOpen(false)}
                  >
                    <div className="text-sm font-medium text-white">{it.label}</div>
                    <div className="text-xs text-white/75">{it.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

      </nav>

      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[10000] md:hidden pointer-events-auto">
            <div
              className="absolute inset-0 bg-blue-900/60 backdrop-blur-md"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
              className="absolute top-0 left-0 h-full w-4/5 max-w-xs text-white p-6 flex flex-col bg-blue-950/70 backdrop-blur-xl border-r border-white/20 shadow-2xl"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-white text-lg font-medium">OSMO</span>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/90 hover:text-white hover:bg-white/10 transition"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                <a href="#about" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10 transition">About</a>
                <a href="/dtf" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/10 transition">DTFs</a>
              </nav>

              <a href="#launch" onClick={() => setOpen(false)} className="mt-6 inline-flex items-center justify-center px-4 py-2 rounded-md border border-white/40 text-white text-sm hover:bg-white/10">Launch App ↗</a>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
