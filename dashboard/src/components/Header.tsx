"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/50 bg-stone-50/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-sm font-semibold text-white">
            OE
          </div>
          <span className="text-lg font-semibold tracking-tight">OceanEmbed</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#models"
            className="text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            Models
          </a>
          <a
            href="#depth"
            className="text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            Depth Analysis
          </a>
          <a
            href="#metrics"
            className="text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            Metrics
          </a>
          <a
            href="#architecture"
            className="text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            Architecture
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            GitHub
          </a>
        </nav>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-stone-200/50 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a
              href="#models"
              className="text-sm text-stone-500 transition-colors hover:text-stone-900"
            >
              Models
            </a>
            <a
              href="#depth"
              className="text-sm text-stone-500 transition-colors hover:text-stone-900"
            >
              Depth Analysis
            </a>
            <a
              href="#metrics"
              className="text-sm text-stone-500 transition-colors hover:text-stone-900"
            >
              Metrics
            </a>
            <a
              href="#architecture"
              className="text-sm text-stone-500 transition-colors hover:text-stone-900"
            >
              Architecture
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
