"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { PointerEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { getByCategory, type Product } from "@/lib/products";
import { Garment, Hanger } from "./garment";

const ITEM_WIDTH = 210;
const GAP = 32;
const STRIDE = ITEM_WIDTH + GAP;
const VIEW = 700;
const STEP = 160;
const TURN = 560;
// Eye sits `P` pixels in front of the screen. `D` is how far each wall stands from that eye.
const P = 540;
const D = 860;
const ROOM = D * 2;
const FLOOR = 460;
const CEILING = 300;
const WALL_H = FLOOR + CEILING;

const ORDER = ["clothing", "caps", "bags", "shoes"] as const;
type Wall = (typeof ORDER)[number];

type Seg = { kind: "look" | "turn"; wall: number; units: number };
type Pose = { degrees: number; wall: number; look: number; turning: number };

const COUNTS = ORDER.map((category) => getByCategory(category).length);

function segmentsFor(counts: number[]): Seg[] {
  return counts.flatMap((count, wall) => [
    { kind: "look" as const, wall, units: Math.max(1, count <= 1 ? 1 : count - 1) * STEP },
    { kind: "turn" as const, wall, units: TURN },
  ]);
}

const SEGS = segmentsFor(COUNTS);
const LOOP = SEGS.reduce((sum, seg) => sum + seg.units, 0);

function asWall(value: string | null): Wall {
  if (value === "caps" || value === "bags" || value === "shoes") return value;
  return "clothing";
}

function poseAt(t: number): Pose {
  const cycles = Math.floor(t / LOOP);
  let x = t - cycles * LOOP;
  let cursor = 0;
  for (let i = 0; i < SEGS.length; i++) {
    const seg = SEGS[i];
    const end = cursor + seg.units;
    if (x < end || i === SEGS.length - 1) {
      const u = Math.min(1, Math.max(0, (x - cursor) / seg.units));
      if (seg.kind === "look") {
        return { degrees: (cycles * 4 + seg.wall) * 90, wall: seg.wall, look: u, turning: 0 };
      }
      return {
        degrees: (cycles * 4 + seg.wall + u) * 90,
        wall: seg.wall,
        look: 1,
        turning: u,
      };
    }
    cursor = end;
  }
  return { degrees: cycles * 360, wall: 0, look: 0, turning: 0 };
}

function facingOf(pose: Pose): Wall {
  const index = pose.turning > 0.5 ? (pose.wall + 1) % 4 : pose.wall;
  return ORDER[index];
}

function railSpan(count: number) {
  const content = count * ITEM_WIDTH + Math.max(0, count - 1) * GAP;
  return Math.max(0, content - VIEW);
}

function shiftFor(look: number, count: number) {
  return -look * railSpan(count);
}

function focusIndex(look: number, count: number) {
  const center = look * railSpan(count) + VIEW / 2;
  const index = Math.round((center - ITEM_WIDTH / 2) / STRIDE);
  return Math.min(Math.max(0, index), Math.max(0, count - 1));
}

function startOf(wallIndex: number) {
  let cursor = 0;
  for (const seg of SEGS) {
    if (seg.kind === "look" && seg.wall === wallIndex) return cursor;
    cursor += seg.units;
  }
  return 0;
}

function nearest(from: number, targetLocal: number) {
  const current = ((from % LOOP) + LOOP) % LOOP;
  let delta = targetLocal - current;
  if (delta > LOOP / 2) delta -= LOOP;
  if (delta < -LOOP / 2) delta += LOOP;
  return from + delta;
}

export function ClothingRoom() {
  const clothing = useMemo(() => getByCategory("clothing"), []);
  const caps = useMemo(() => getByCategory("caps"), []);
  const bags = useMemo(() => getByCategory("bags"), []);
  const shoes = useMemo(() => getByCategory("shoes"), []);
  const params = useSearchParams();
  const router = useRouter();
  const wall = asWall(params.get("cat"));
  const reduce = useReducedMotion();
  const travel = useMotionValue(startOf(ORDER.indexOf(wall)));
  const smooth = useSpring(travel, { stiffness: 90, damping: 26, mass: 0.7 });
  const rotateY = useTransform(smooth, (t) => poseAt(t).degrees);
  const roomTransform = useTransform(
    rotateY,
    (deg) => `translateZ(${P}px) rotateY(${deg}deg)`,
  );
  const clothingX = useTransform(smooth, (t) => {
    const pose = poseAt(t);
    const look = pose.wall === 0 ? pose.look : 0;
    return shiftFor(look, clothing.length);
  });
  const roomRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, y: 0, lastX: 0, moved: false });
  const urlWall = useRef(wall);
  const [label, setLabel] = useState<Wall>(wall);
  const [piece, setPiece] = useState(clothing[focusIndex(0, clothing.length)]?.name ?? "");

  useMotionValueEvent(smooth, "change", (t) => {
    const pose = poseAt(t);
    if (pose.wall === 0 && pose.turning === 0) {
      const index = focusIndex(pose.look, clothing.length);
      const name = clothing[index]?.name ?? "";
      setPiece((prev) => (prev === name ? prev : name));
    }
    const next = facingOf(pose);
    setLabel((prev) => (prev === next ? prev : next));
    if (pose.turning !== 0 || next === urlWall.current) return;
    urlWall.current = next;
    router.replace(`/?cat=${next}`, { scroll: false });
  });

  useEffect(() => {
    if (urlWall.current === wall) return;
    urlWall.current = wall;
    travel.set(nearest(travel.get(), startOf(ORDER.indexOf(wall))));
  }, [travel, wall]);

  useEffect(() => {
    if (!reduce) return;
    return travel.on("change", (value) => smooth.jump(value));
  }, [reduce, smooth, travel]);

  useEffect(() => {
    const el = roomRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Scroll up turns the room to the right.
      travel.set(travel.get() - (e.deltaY + e.deltaX) * 1.15);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [travel]);

  const onPointerDown = (e: PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, lastX: e.clientX, moved: false };
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.buttons !== 1 || drag.current.lastX === 0) return;
    const dx = e.clientX - drag.current.lastX;
    if (Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y) > 14) {
      drag.current.moved = true;
    }
    drag.current.lastX = e.clientX;
    if (drag.current.moved) travel.set(travel.get() - dx * 1.4);
  };

  const onPointerUp = () => {
    drag.current.lastX = 0;
  };

  const openPiece = (slug: string) => {
    if (drag.current.moved) return;
    router.push(`/product/${slug}`);
  };

  const faces: { wall: Wall; deg: number; node: ReactNode }[] = [
    {
      wall: "clothing",
      deg: 0,
      node: <ClothingWall items={clothing} shift={clothingX} name={piece} onOpen={openPiece} />,
    },
    { wall: "caps", deg: -90, node: <CapsWall items={caps} onOpen={openPiece} /> },
    { wall: "bags", deg: 180, node: <ShelfWall title="Bags" items={bags} onOpen={openPiece} /> },
    { wall: "shoes", deg: 90, node: <ShelfWall title="Shoes" items={shoes} onOpen={openPiece} /> },
  ];

  return (
    <div
      ref={roomRef}
      className="relative h-[100svh] cursor-grab touch-none overflow-hidden bg-[#e4dfd6] select-none active:cursor-grabbing"
      style={{ perspective: `${P}px`, perspectiveOrigin: "50% 42%" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <motion.div
        className="absolute top-[42%] left-1/2"
        style={{ transformStyle: "preserve-3d", transform: roomTransform }}
      >
        <div
          className="absolute bg-[#e7e2d8]"
          style={{
            width: ROOM,
            height: ROOM,
            marginLeft: -D,
            marginTop: -D,
            transform: `rotateX(90deg) translateZ(${-FLOOR}px)`,
            backgroundImage:
              "radial-gradient(ellipse at center, #efeae2 0%, #e3ddd3 62%, #d4cdc2 100%)",
          }}
        />
        <div
          className="absolute bg-[#f6f4ef]"
          style={{
            width: ROOM,
            height: ROOM,
            marginLeft: -D,
            marginTop: -D,
            transform: `rotateX(-90deg) translateZ(${-CEILING}px)`,
          }}
        />
        {faces.map((face) => (
          <div
            key={face.wall}
            className="absolute"
            style={{
              width: ROOM,
              height: WALL_H,
              marginLeft: -D,
              marginTop: -CEILING,
              transform: `rotateY(${face.deg}deg) translateZ(${-D}px)`,
              backfaceVisibility: "hidden",
            }}
          >
            <div className="relative flex h-full flex-col items-center bg-[#f3f1ec] px-8 pt-8 [background-image:radial-gradient(#d5d0c8_0.7px,transparent_0.8px)] [background-size:8px_8px]">
              {face.node}
              <div className="absolute inset-x-0 bottom-0 h-3 bg-[#e3ddd4]" />
            </div>
          </div>
        ))}
      </motion.div>

      <p className="pointer-events-none absolute inset-x-0 bottom-28 z-10 text-center text-[11px] tracking-[0.22em] text-[#6f6f6b] uppercase">
        {label} · Scroll up to turn
      </p>
    </div>
  );
}

function ClothingWall({
  items,
  shift,
  name,
  onOpen,
}: {
  items: Product[];
  shift: MotionValue<number>;
  name: string;
  onOpen: (slug: string) => void;
}) {
  return (
    <section className="mt-4 flex origin-top scale-150 flex-col items-center">
      <div className="mb-6 text-center">
        <p className="text-[10px] tracking-[0.42em] text-[#8a8a86] uppercase">Virtual store</p>
        <p className="mt-2 font-display text-4xl tracking-[0.18em] text-sey-ink uppercase sm:text-5xl">
          Seydehwon
        </p>
      </div>
      <div className="overflow-hidden" style={{ width: VIEW }}>
        <motion.div className="relative flex items-start" style={{ x: shift, gap: GAP, width: items.length * STRIDE }}>
          <div className="absolute top-[10px] right-2 left-2 z-0 h-[6px] rounded-full bg-gradient-to-b from-[#fbfbf8] via-[#c5c5c0] to-[#8d8d88] shadow-[0_2px_3px_rgba(0,0,0,0.22)]" />
          {items.map((product) => (
            <Piece key={product.slug} product={product} onOpen={() => onOpen(product.slug)} />
          ))}
        </motion.div>
      </div>
      <p className="mt-3 h-5 text-[13px] tracking-wide text-[#8d8d88]">{name}</p>
    </section>
  );
}

function CapsWall({ items, onOpen }: { items: Product[]; onOpen: (slug: string) => void }) {
  return (
    <section className="mt-10 flex w-[640px] origin-top scale-150 flex-col items-center">
      <p className="mb-8 text-[11px] tracking-[0.38em] text-[#8a8a86] uppercase">Caps</p>
      <div
        className="grid h-[340px] w-full place-items-center bg-[#e7d3b8] shadow-[0_14px_30px_rgba(0,0,0,0.06)]"
        style={{
          backgroundImage: "radial-gradient(#c4aa8c 1.3px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      >
        {items.map((product) => (
          <button key={product.slug} type="button" onClick={() => onOpen(product.slug)} className="cursor-pointer">
            <Garment product={product} className="h-28 w-48" />
          </button>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-[#8d8d88]">{items[0]?.name}</p>
    </section>
  );
}

function ShelfWall({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: Product[];
  onOpen: (slug: string) => void;
}) {
  const wide = title === "Shoes";
  return (
    <section className="mt-16 flex w-[520px] origin-top scale-150 flex-col items-center">
      <p className="mb-8 text-[11px] tracking-[0.38em] text-[#8a8a86] uppercase">{title}</p>
      <div className="flex items-end justify-center">
        {items.map((product) => (
          <button key={product.slug} type="button" onClick={() => onOpen(product.slug)} className="cursor-pointer">
            <Garment
              product={product}
              className={wide ? "h-24 w-56" : "h-52 w-36"}
            />
          </button>
        ))}
      </div>
      <div className="mt-1 h-[10px] w-full rounded-sm bg-[#d8d2c8] shadow-[0_8px_16px_rgba(0,0,0,0.06)]" />
      <p className="mt-4 text-[13px] text-[#8d8d88]">{items[0]?.name}</p>
    </section>
  );
}

function Piece({ product, onOpen }: { product: Product; onOpen: () => void }) {
  return (
    <div
      className="relative flex shrink-0 cursor-pointer flex-col items-center"
      style={{ width: ITEM_WIDTH }}
      onClick={onOpen}
    >
      <Hanger className="relative z-10 h-10 w-20" />
      <Garment
        product={product}
        className="pointer-events-none -mt-1 h-[280px] w-[150px]"
      />
    </div>
  );
}
