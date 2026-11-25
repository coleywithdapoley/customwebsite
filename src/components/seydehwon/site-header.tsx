"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useState } from "react";
import { useCart } from "./cart-provider";
import { springSnappy } from "@/lib/motion";

export function SiteHeader() {
  const { count, setOpen } = useCart();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [path, setPath] = useState<string | null>(null);
  useLayoutEffect(() => {
    setPath(pathname);
  }, [pathname]);
  const inGallery = path === "/collection";
  const inStore = path === "/";

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-20 sm:px-8">
        {inStore ? (
          <span />
        ) : (
          <Link
            href="/"
            className={`pointer-events-auto font-display text-lg tracking-[0.18em] uppercase sm:text-xl ${
              inGallery ? "text-white" : "text-sey-ink"
            }`}
          >
            Seydehwon
            <span className="align-super text-[0.55em]">®</span>
          </Link>
        )}
        {!inGallery && !inStore ? (
          <p className="pointer-events-none hidden text-[10px] tracking-[0.28em] text-sey-muted uppercase sm:block">
            Virtual store
          </p>
        ) : (
          <span className="hidden sm:block" />
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`pointer-events-auto flex items-center gap-2 text-sm tracking-wide ${
            inGallery ? "text-white" : "text-sey-ink"
          }`}
          aria-label={`Open cart, ${count} items`}
        >
          Cart
          <motion.span
            key={count}
            initial={reduce ? false : { scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={springSnappy}
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-sey-ink px-1.5 text-xs text-sey-white"
          >
            {count}
          </motion.span>
        </button>
      </div>
    </header>
  );
}
