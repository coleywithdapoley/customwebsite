"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { useCart } from "./cart-provider";
import { Garment, Hanger } from "./garment";

const sizes = ["S", "M", "L", "XL"];

export function ProductView({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);
  const [shot, setShot] = useState(0);
  const shots = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center gap-10 px-5 pt-24 pb-8 sm:px-10 lg:flex-row lg:items-center">
      <div className="relative flex flex-1 flex-col items-center">
        <div className="h-[6px] w-48 rounded-full bg-gradient-to-b from-[#fbfbf8] via-[#c5c5c0] to-[#8d8d88] shadow-[0_2px_3px_rgba(0,0,0,0.22)]" />
        <Hanger className="-mt-3 h-12 w-28" />
        <div className="-mt-6 flex h-[340px] w-full items-start justify-center sm:h-[440px]">
          {shots.length > 0 ? (
            <img
              src={shots[shot]}
              alt={`${product.name}, view ${shot + 1}`}
              className={`h-full bg-transparent object-contain object-top [filter:drop-shadow(0_28px_18px_rgba(0,0,0,0.16))] ${
                shots[shot].endsWith(".webp") ? "" : "mix-blend-multiply"
              }`}
            />
          ) : (
            <Garment product={product} className="h-full w-[240px]" />
          )}
        </div>
        {shots.length > 1 ? (
          <button
            type="button"
            onClick={() => setShot((n) => (n + 1) % shots.length)}
            aria-label={`Show ${product.name} view ${((shot + 1) % shots.length) + 1}`}
            className="absolute top-1/2 right-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-lg text-sey-ink shadow-sm"
          >
            →
          </button>
        ) : null}
      </div>

      <aside className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <p className="text-[11px] tracking-[0.16em] text-sey-muted uppercase">
          {product.category}
        </p>
        <h1 className="mt-2 text-2xl leading-tight font-medium text-sey-ink">
          {product.name}
        </h1>
        <p className="mt-3 text-lg text-sey-ink">{formatPrice(product.price)}</p>
        <p className="mt-1 text-sm text-sey-muted">{product.color}</p>

        <p className="mt-6 text-xs text-sey-muted">Select size</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`h-11 border text-sm ${
                size === s
                  ? "border-sey-ink bg-sey-ink text-white"
                  : "border-[#e4e4e0] bg-white text-sey-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`mt-5 w-full rounded-full py-3 text-sm tracking-wide ${
            added ? "bg-[#1f9d55] text-white" : "bg-sey-ink text-white"
          }`}
          onClick={() => {
            add(product, size);
            setAdded(true);
          }}
        >
          {added ? "Added to cart" : "Add to cart"}
        </button>
        {added ? (
          <Link
            href="/?cat=clothing"
            className="mt-3 block text-center text-xs text-sey-muted underline"
          >
            Back to the rack
          </Link>
        ) : (
          <Link
            href="/?cat=clothing"
            className="mt-4 block text-xs text-sey-muted hover:text-sey-ink"
          >
            ← Back to the rack
          </Link>
        )}
      </aside>
    </div>
  );
}
