"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/products";
import { springSoft } from "@/lib/motion";
import { Garment } from "./garment";

export function CartDrawer() {
  const { open, setOpen, lines, remove, clear, count } = useCart();
  const reduce = useReducedMotion();
  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            className="fixed inset-0 z-50 bg-sey-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-sey-white shadow-2xl"
            initial={reduce ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduce ? undefined : { x: "100%" }}
            transition={springSoft}
          >
            <div className="flex items-center justify-between border-b border-sey-line px-5 py-5">
              <h2 className="font-display text-lg tracking-wide uppercase">
                Cart ({count})
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-sey-muted hover:text-sey-ink"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <p className="text-sey-muted">Your rack is empty. Drag the store and pick a piece.</p>
              ) : (
                <ul className="space-y-4">
                  {lines.map((line) => (
                    <li
                      key={`${line.product.slug}-${line.size}`}
                      className="flex gap-3 border-b border-sey-line/60 pb-4"
                    >
                      <div className="flex h-20 w-16 items-center justify-center bg-sey-bg">
                        <Garment product={line.product} className="h-16 w-12" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{line.product.name}</p>
                        <p className="text-sm text-sey-muted">
                          Size {line.size} · Qty {line.qty}
                        </p>
                        <p className="mt-1 text-sm">
                          {formatPrice(line.product.price * line.qty)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-sey-muted underline"
                        onClick={() => remove(line.product.slug, line.size)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-sey-line px-5 py-5">
              <div className="mb-4 flex justify-between text-sm">
                <span>Total</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <button
                type="button"
                className="w-full rounded-full bg-sey-ink py-3 text-sm tracking-wide text-sey-white uppercase"
                onClick={() => {
                  alert("Demo only — checkout not connected yet.");
                  clear();
                  setOpen(false);
                }}
              >
                Checkout (demo)
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
