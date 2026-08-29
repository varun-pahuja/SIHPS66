"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-warm-200/60 bg-warm-50/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl ocean-gradient text-sm font-bold text-white shadow-lg shadow-ocean-500/20">
            OE
          </div>
          <span className="text-lg font-semibold tracking-tight text-warm-900">
            OceanEmbed
          </span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {["Models", "Depth Analysis", "Metrics", "Architecture"].map(
            (item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-medium text-warm-600 transition-colors hover:text-ocean-600"
              >
                {item}
              </a>
            )
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-warm-200 bg-white px-4 py-2 text-sm font-medium text-warm-700 transition-all hover:border-ocean-300 hover:bg-ocean-50 hover:text-ocean-700"
          >
            GitHub
          </a>
        </nav>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X size={20} className="text-warm-700" />
          ) : (
            <Menu size={20} className="text-warm-700" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-warm-200/60 bg-warm-50/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-4">
            {["Models", "Depth Analysis", "Metrics", "Architecture"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium text-warm-600 transition-colors hover:text-ocean-600"
                >
                  {item}
                </a>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
