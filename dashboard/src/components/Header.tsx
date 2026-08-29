"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = ["Models", "Depth", "Metrics", "Architecture"];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ${
          scrolled
            ? "w-[calc(100%-2rem)] max-w-5xl"
            : "w-[calc(100%-2rem)] max-w-5xl"
        }`}
      >
        <nav
          className={`flex items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 ${
            scrolled
              ? "bg-sand-50/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl"
              : "bg-transparent"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-800 text-[9px] font-bold tracking-wider text-sand-50">
              OE
            </div>
            <span className="text-sm font-semibold tracking-tight text-sand-800">
              OceanEmbed
            </span>
          </div>

          <div className="hidden items-center gap-0.5 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-sand-500 transition-all duration-200 hover:bg-sand-100 hover:text-sand-800"
              >
                {item}
              </a>
            ))}
            <div className="mx-2 h-4 w-px bg-sand-200" />
            <a
              href="https://github.com/varun-pahuja/SIHPS66"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-sand-500 transition-all duration-200 hover:bg-sand-100 hover:text-sand-800"
            >
              GitHub
            </a>
          </div>

          <button
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-sand-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              {mobileOpen ? (
                <path
                  d="M3 3L11 11M11 3L3 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M2 5H12M2 9H12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 overflow-hidden rounded-2xl border border-sand-200/50 bg-sand-50/95 p-2 shadow-lg backdrop-blur-xl md:hidden"
            >
              {NAV_ITEMS.map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center rounded-xl px-4 py-2.5 text-sm font-medium text-sand-600 transition-colors hover:bg-sand-100 hover:text-sand-800"
                >
                  {item}
                </motion.a>
              ))}
              <motion.a
                href="https://github.com/varun-pahuja/SIHPS66"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: NAV_ITEMS.length * 0.05, duration: 0.3 }}
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-4 py-2.5 text-sm font-medium text-sand-600 transition-colors hover:bg-sand-100 hover:text-sand-800"
              >
                GitHub
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
