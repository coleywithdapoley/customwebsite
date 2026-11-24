"use client";

import Link from "next/link";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { useCart } from "./cart-provider";
import { Garment } from "./garment";
import { springSnappy } from "@/lib/motion";

const sizes = ["S", "M", "L", "XL"];

export function ProductView({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState("M");
  const [pulse, setPulse] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
      <motion.div
        layoutId={`garment-${product.slug}`}
        className="flex min-h-[360px] items-center justify-center rounded-sm bg-gradient-to-b from-white to-sey-bg"
      >
        <Garment product={product} className="h-[340px] w-[200px]" />
      </motion.div>

      <div>
        <Link
          href="/?cat=clothing"
          className="text-xs tracking-wide text-sey-muted uppercase hover:text-sey-ink"
        >
          ← Back to rack
        </Link>
        <h1 className="mt-4 font-display text-4xl tracking-tight uppercase">
          {product.name}
        </h1>
        <p className="mt-2 text-sey-muted">
          {product.color} · {formatPrice(product.price)}
        </p>
        <p className="mt-6 max-w-md leading-relaxed text-sey-ink/80">
          {product.description}
        </p>

        <p className="mt-8 text-xs tracking-wide text-sey-muted uppercase">
          Size
        </p>
        <LayoutGroup>
          <div className="mt-2 flex gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className="relative h-10 w-12 text-sm"
              >
                {size === s ? (
                  <motion.span
                    layoutId={reduce ? undefined : "size-pill"}
                    className="absolute inset-0 rounded-full bg-sey-ink"
                    transition={springSnappy}
                  />
                ) : (
                  <span className="absolute inset-0 rounded-full border border-sey-line" />
                )}
                <span
                  className={`relative z-10 ${
                    size === s ? "text-sey-white" : "text-sey-ink"
                  }`}
                >
                  {s}
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>

        <motion.button
          type="button"
          className="mt-8 rounded-full bg-sey-ink px-8 py-3 text-sm tracking-wide text-sey-white uppercase"
          animate={pulse && !reduce ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={
            pulse && !reduce
              ? { duration: 0.35, ease: "easeInOut" }
              : springSnappy
          }
          onClick={() => {
            add(product, size);
            setPulse(true);
            setTimeout(() => setPulse(false), 400);
          }}
        >
          Add to cart
        </motion.button>
        <p className="mt-3 text-xs text-sey-muted">Demo cart — no payment yet.</p>
      </div>
    </div>
  );
}
