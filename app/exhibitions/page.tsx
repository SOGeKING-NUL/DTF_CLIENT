"use client";

import Header from "@/components/header";
import ShaderBackground from "@/components/shader-background";

const exhibitions = [
  { title: "Silent Dialogues", venue: "Dehradun Art Collective", year: "2023" },
  { title: "Nature & Duality", venue: "Rishikesh Riverside Gallery", year: "2022" },
  { title: "Shades of Oneness", venue: "Maatrika Art Studio", year: "2021" },
];

export default function ExhibitionsPage() {
  return (
    <ShaderBackground>
        <Header />
      <main className="relative z-20 px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-light text-white">Exhibitions</h1>
            <p className="text-white/70 text-sm md:text-base mt-2 font-light">Selected showcases and appearances.</p>
          </header>

          <ul className="space-y-3">
            {exhibitions.map((e, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-xl bg-white/5 ring-1 ring-white/10 p-4 hover:bg-white/10 transition-colors"
                style={{ filter: "url(#glass-effect)" }}
              >
                <div>
                  <p className="text-white/90 text-sm">{e.title}</p>
                  <p className="text-white/60 text-xs">{e.venue}</p>
                </div>
                <span className="text-white/70 text-xs">{e.year}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </ShaderBackground>
  );
}
