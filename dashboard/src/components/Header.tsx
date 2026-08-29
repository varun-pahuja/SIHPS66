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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-sand-50/80 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-800 text-[9px] font-bold tracking-wider text-sand-50">
              OE
            </div>
            <span className="text-sm font-semibold tracking-tight text-sand-800">
              OceanEmbed
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="rounded-lg px-3 py-2 text-[13px] font-medium text-sand-500 transition-colors hover:bg-sand-100 hover:text-sand-800"
              >
                {item}
              </a>
            ))}
            <div className="mx-2 h-4 w-px bg-sand-200" />
            <a
              href="https://github.com/varun-pahuja/SIHPS66"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-sand-500 transition-colors hover:bg-sand-100 hover:text-sand-800"
            >
              GitHub
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-sand-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {mobileOpen ? (
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6H13M3 10H13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-sand-200/40 bg-sand-50/95 backdrop-blur-xl md:hidden"
            >
              <div className="px-5 py-3">
                {NAV_ITEMS.map((item, i) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-sand-600 transition-colors hover:bg-sand-100 hover:text-sand-800"
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
                  className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-sand-600 transition-colors hover:bg-sand-100 hover:text-sand-800"
                >
                  GitHub
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
