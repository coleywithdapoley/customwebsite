"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  formatPrice,
  getByCategory,
  type Product,
  type ProductCategory,
} from "@/lib/products";
import { Garment, Hanger } from "./garment";
import { springSoft } from "@/lib/motion";

type Props = {
  category: ProductCategory | "store";
};

const ITEM_WIDTH = 140;
const GAP = 28;

export function VirtualRack({ category }: Props) {
  const items = useMemo(() => getByCategory(category), [category]);
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 28, mass: 0.8 });
  const velocity = useMotionValue(0);
  const blurPx = useTransform(velocity, [-1600, 0, 1600], [7, 0, 7]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const [focused, setFocused] = useState<string | null>(items[0]?.slug ?? null);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef({ startX: 0, startVal: 0 });

  const minX = useMemo(() => {
    const total = items.length * (ITEM_WIDTH + GAP) + 200;
    if (typeof window === "undefined") return -400;
    return Math.min(40, window.innerWidth - total);
  }, [items.length]);

  const clamp = useCallback(
    (v: number) => Math.max(minX, Math.min(60, v)),
    [minX],
  );

  useEffect(() => {
    x.set(40);
    setFocused(items[0]?.slug ?? null);
  }, [category, items, x]);

  useEffect(() => {
    if (reduce) return;
    let frame = 0;
    let prev = x.get();
    let prevT = performance.now();
    const tick = (t: number) => {
      const cur = springX.get();
      const dt = Math.max(16, t - prevT);
      velocity.set(((cur - prev) / dt) * 1000);
      prev = cur;
      prevT = t;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduce, springX, velocity, x]);

  const updateFocus = () => {
    const center = window.innerWidth / 2;
    let best: string | null = null;
    let bestDist = Infinity;
    trackRef.current
      ?.querySelectorAll<HTMLElement>("[data-slug]")
      .forEach((el) => {
        const rect = el.getBoundingClientRect();
        const mid = rect.left + rect.width / 2;
        const d = Math.abs(mid - center);
        if (d < bestDist) {
          bestDist = d;
          best = el.dataset.slug ?? null;
        }
      });
    if (best) setFocused(best);
  };

  const onPointerDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragState.current = { startX: e.clientX, startVal: x.get() };
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragState.current.startX;
    x.set(clamp(dragState.current.startVal + dx));
    updateFocus();
  };

  const onPointerUp = () => setDragging(false);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    x.set(clamp(x.get() - e.deltaY - e.deltaX));
    updateFocus();
  };

  if (items.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sey-muted">
        Coming soon to this rack.
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[100svh] flex-col justify-center bg-[#f3f1ec] pb-28 pt-16 [background-image:radial-gradient(#d5d0c8_0.7px,transparent_0.8px)] [background-size:8px_8px]">
      <div className="pointer-events-none relative z-10 mb-6 px-6 text-center">
        <p className="text-[10px] tracking-[0.42em] text-sey-muted uppercase">
          Virtual store
        </p>
        <Link
          href="/"
          className="pointer-events-auto mt-2 block font-display text-4xl tracking-[0.22em] text-sey-ink uppercase sm:text-6xl"
        >
          Seydehwon
        </Link>
      </div>

      <div
        className="relative z-10 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div className="relative mx-auto h-[440px] overflow-hidden sm:h-[500px]">
          <div className="absolute top-[34px] right-[4%] left-[4%] z-20 h-[7px] rounded-full bg-gradient-to-b from-[#fbfbf8] via-[#c5c5c0] to-[#8a8a86] shadow-[0_2px_3px_rgba(0,0,0,0.28)]" />
          <div className="absolute top-[30px] left-[6%] z-20 h-4 w-4 rounded-full bg-gradient-to-b from-[#eee] to-[#8d8d89] shadow-sm" />
          <div className="absolute top-[30px] right-[6%] z-20 h-4 w-4 rounded-full bg-gradient-to-b from-[#eee] to-[#8d8d89] shadow-sm" />

          <motion.div
            ref={trackRef}
            className="absolute top-[22px] left-0 flex h-full items-start will-change-transform"
            style={{
              x: reduce ? x : springX,
              filter: reduce ? "none" : filter,
              gap: GAP,
              paddingLeft: "10vw",
              paddingRight: "10vw",
            }}
          >
            {items.map((product, i) => (
              <RackItem
                key={product.slug}
                product={product}
                index={i}
                focused={focused === product.slug}
                reduce={!!reduce}
                onFocus={() => setFocused(product.slug)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] tracking-[0.25em] text-sey-muted uppercase">
        Drag the rack · Scroll · Tap to open
      </p>
    </div>
  );
}

function RackItem({
  product,
  index,
  focused,
  reduce,
  onFocus,
}: {
  product: Product;
  index: number;
  focused: boolean;
  reduce: boolean;
  onFocus: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = focused || hovered;

  return (
    <motion.div
      data-slug={product.slug}
      className="relative flex shrink-0 flex-col items-center"
      initial={reduce ? false : { y: -36, opacity: 0 }}
      animate={{
        y: active ? 6 : 0,
        opacity: focused ? 1 : 0.7,
        scale: active ? 1.05 : 1,
      }}
      transition={springSoft}
      style={{ width: ITEM_WIDTH }}
      onMouseEnter={() => {
        setHovered(true);
        onFocus();
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <Hanger className="relative z-30 -mb-1 h-9 w-20" />

      <motion.div
        className="origin-top"
        animate={
          reduce
            ? undefined
            : { rotate: active ? [-1.4, 1.4, -1.4] : [-0.35, 0.35, -0.35] }
        }
        transition={
          reduce
            ? undefined
            : {
                duration: active ? 2.2 : 4.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.1,
              }
        }
      >
        <Link href={`/product/${product.slug}`} className="block" draggable={false}>
          <motion.div layoutId={`garment-${product.slug}`}>
            <Garment
              product={product}
              className="h-[280px] w-[130px] sm:h-[320px]"
            />
          </motion.div>
        </Link>
      </motion.div>

      <motion.div
        className="mt-3 text-center"
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 8 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-sm font-medium text-sey-ink">{product.name}</p>
        <p className="text-xs text-sey-muted">{formatPrice(product.price)}</p>
      </motion.div>
    </motion.div>
  );
}
