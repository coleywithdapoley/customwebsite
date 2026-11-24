"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Suspense } from "react";
import { springSnappy } from "@/lib/motion";

const items = [
  { label: "Store", href: "/?cat=clothing" },
  { label: "Clothing", href: "/?cat=clothing" },
  { label: "Caps", href: "/?cat=caps" },
  { label: "Bags", href: "/?cat=bags" },
  { label: "Shoes", href: "/?cat=shoes" },
  { label: "Info", href: "/about" },
] as const;

function FloatingNavInner() {
  const pathname = usePathname();
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const cat = params.get("cat") ?? "clothing";
  // Only one rack pill active — Store is alias for clothing home
  const rackKey =
    cat === "caps" || cat === "bags" || cat === "shoes" ? cat : "clothing";

  return (
    <nav
      aria-label="Store sections"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
    >
      <LayoutGroup id="sey-pill-nav">
        <ul
          className={`pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border p-1 backdrop-blur-xl ${
            pathname === "/collection"
              ? "border-[#1c1b19]/06 bg-[#f7f6f2]/72 shadow-[0_6px_24px_rgba(0,0,0,0.05)]"
              : "border-[#1c1b19]/08 bg-[#f7f6f2]/90 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
          }`}
        >
          {items.map((item) => {
            const isInfo = item.href === "/about";
            const itemCat = item.href.includes("cat=")
              ? item.href.split("cat=")[1]
              : null;
            const isStoreLabel = item.label === "Store";
            const isClothingLabel = item.label === "Clothing";
            let active = false;
            if (isInfo) active = pathname === "/about";
            else if (pathname === "/") {
              if (isStoreLabel) active = rackKey === "clothing";
              else if (isClothingLabel) active = false; // Store covers clothing home
              else active = itemCat === rackKey;
            }

            return (
              <li key={item.label} className="relative shrink-0">
                <Link
                  href={item.href}
                  className={`relative z-10 block rounded-full px-3.5 py-2 text-xs tracking-wide uppercase sm:px-4 sm:text-sm ${
                    active ? "text-sey-white" : "text-sey-ink/75 hover:text-sey-ink"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId={reduce ? undefined : "pill-active"}
                      className="absolute inset-0 -z-10 rounded-full bg-sey-ink"
                      transition={springSnappy}
                    />
                  ) : null}
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="relative shrink-0">
            <Link
              href="/collection"
              className={`relative z-10 block rounded-full px-3.5 py-2 text-xs tracking-wide uppercase sm:px-4 sm:text-sm ${
                pathname === "/collection"
                  ? "text-sey-white"
                  : "text-sey-ink/75 hover:text-sey-ink"
              }`}
            >
              {pathname === "/collection" ? (
                <motion.span
                  layoutId={reduce ? undefined : "pill-active"}
                  className="absolute inset-0 -z-10 rounded-full bg-sey-ink"
                  transition={springSnappy}
                />
              ) : null}
              Gallery
            </Link>
          </li>
        </ul>
      </LayoutGroup>
    </nav>
  );
}

export function FloatingNav() {
  return (
    <Suspense fallback={null}>
      <FloatingNavInner />
    </Suspense>
  );
}
