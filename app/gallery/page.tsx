"use client";

import Image from "next/image";
import ShaderBackground from "@/components/shader-background";
import Header from "@/components/header";

const paintings = [
  { src: "/placeholder.jpg", alt: "Painting 1 by Prakash Papnai" },
  { src: "/placeholder-user.jpg", alt: "Painting 2 by Prakash Papnai" },
  { src: "/placeholder-logo.png", alt: "Painting 3 by Prakash Papnai" },
  { src: "/placeholder.svg", alt: "Painting 4 by Prakash Papnai" },
];

export default function GalleryPage() {
  const MAATRIKA_URL = process.env.NEXT_PUBLIC_MAATRIKA_ART_URL;

  return (
    <ShaderBackground>
        <Header />
      <main className="relative z-20 px-6 py-14 md:py-16">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-light text-white">Gallery</h1>
            <p className="text-white/70 text-sm md:text-base mt-2 font-light">A glimpse into select works by Prakash Papnai.</p>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {paintings.map((p, idx) => (
              <div
                key={idx}
                className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 shadow-lg group"
                style={{ filter: "url(#glass-effect)" }}
              >
                <Image src={p.src} alt={p.alt} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </section>

          <div className="flex justify-center mt-10">
            <a
              href={MAATRIKA_URL || "#"}
              target={MAATRIKA_URL ? "_blank" : undefined}
              rel={MAATRIKA_URL ? "noopener noreferrer" : undefined}
              className="px-6 py-3 rounded-full bg-white text-black text-sm font-normal hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              Explore All Art
            </a>
          </div>
        </div>
      </main>
    </ShaderBackground>
  );
}
