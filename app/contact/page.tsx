"use client";

import Header from "@/components/header";
import ShaderBackground from "@/components/shader-background";
import Link from "next/link";

export default function ContactPage() {
  const EMAIL_URL = process.env.NEXT_PUBLIC_EMAIL_URL;
  const IG_URL = process.env.NEXT_PUBLIC_IG_URL;
  const FB_URL = process.env.NEXT_PUBLIC_FB_URL;
  const YT_URL = process.env.NEXT_PUBLIC_YT_URL;

  return (
    <ShaderBackground>
      <Header />
      <main className="relative z-20 px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-light text-white">
              Contact
            </h1>
            <p className="text-white/70 text-sm md:text-base mt-2 font-light">
              Get in touch for commissions, exhibitions, or collaborations.
            </p>
          </header>

          <section className="space-y-4">
            <Link
              href={EMAIL_URL || "#"}
              className="flex items-center justify-between rounded-xl bg-white/5 ring-1 ring-white/10 p-4 hover:bg-white/10 transition-colors"
              style={{ filter: "url(#glass-effect)" }}
            >
              <span className="text-white/90 text-sm">Email</span>
              <span className="text-white/70 text-xs">
                prakash.papnai3@gmail.com
              </span>
            </Link>
            <Link
              href={IG_URL || "#"}
              target={IG_URL ? "_blank" : undefined}
              rel={IG_URL ? "noopener noreferrer" : undefined}
              className="flex items-center justify-between rounded-xl bg-white/5 ring-1 ring-white/10 p-4 hover:bg-white/10 transition-colors"
              style={{ filter: "url(#glass-effect)" }}
            >
              <span className="text-white/90 text-sm">Instagram</span>
              <span className="text-white/70 text-xs truncate max-w-[50%]">
                Send a DM on Instagram
              </span>
            </Link>
            <Link
              href={FB_URL || "#"}
              className="flex items-center justify-between rounded-xl bg-white/5 ring-1 ring-white/10 p-4 hover:bg-white/10 transition-colors"
              style={{ filter: "url(#glass-effect)" }}
            >
              <span className="text-white/90 text-sm">Facebook</span>
              <span className="text-white/70 text-xs">
                Send a message on Facebook
              </span>
            </Link>
             <Link
              href={YT_URL || "#"}
              className="flex items-center justify-between rounded-xl bg-white/5 ring-1 ring-white/10 p-4 hover:bg-white/10 transition-colors"
              style={{ filter: "url(#glass-effect)" }}
            >
              <span className="text-white/90 text-sm">YouTube</span>
              <span className="text-white/70 text-xs">
                Watch us exclusively on YouTube
              </span>
            </Link>
          </section>
        </div>
      </main>
    </ShaderBackground>
  );
}
