"use client";

import Link from "next/link";
import {
  PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { GalleryCanvas, type FocusedLook, type GalleryView } from "./gallery-scene";

export function CurvedGallery() {
  const progressRef = useRef(0.06);
  const targetProgressRef = useRef(0.06);
  const viewRef = useRef<GalleryView>(null);
  const [dragging, setDragging] = useState(false);
  const [hint, setHint] = useState(true);
  const [progress, setProgress] = useState(0.06);
  const [focused, setFocused] = useState<FocusedLook | null>(null);
  const drag = useRef({ y: 0, progress: 0 });

  const onPointerDown = useCallback((e: PointerEvent) => {
    if (focused) return; // don't start a drag while shopping a look
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setHint(false);
    drag.current = { y: e.clientY, progress: targetProgressRef.current };
    document.body.style.cursor = "grabbing";
  }, [focused]);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging) return;
      const dy = e.clientY - drag.current.y;
      targetProgressRef.current = Math.min(
        1,
        Math.max(0, drag.current.progress + -dy * 0.00064),
      );
    },
    [dragging],
  );

  const endDrag = useCallback(() => {
    setDragging(false);
    document.body.style.cursor = focused ? "pointer" : "grab";
  }, [focused]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setHint(false);
      if (viewRef.current) {
        viewRef.current = null;
        setFocused(null);
      }
      targetProgressRef.current = Math.min(
        1,
        Math.max(0, targetProgressRef.current + e.deltaY * 0.00052),
      );
    };
    const el = document.getElementById("sey-gallery-stage");
    el?.addEventListener("wheel", onWheel, { passive: false });
    return () => el?.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    document.body.style.cursor = "grab";
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const p = progressRef.current;
      // Only re-render UI when the bar actually moves (~1%)
      if (Math.abs(p - last) > 0.01) {
        last = p;
        setProgress(p);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#3d3832]">
      <div
        id="sey-gallery-stage"
        className="absolute inset-0 z-[1] touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <GalleryCanvas
          progressRef={progressRef}
          targetProgressRef={targetProgressRef}
          viewRef={viewRef}
          onFocusLook={setFocused}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-5 pt-[4.75rem] sm:px-8 sm:pt-24">
        <p className="text-[10px] tracking-[0.4em] text-white uppercase">
          Gallery
        </p>
        <p
          className={`text-[10px] tracking-[0.22em] text-white/70 uppercase ${
            hint ? "opacity-100" : "opacity-0"
          }`}
        >
          Scroll to walk
        </p>
      </div>

      {/* Walk progress — hides when a look is focused */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-36 z-20 flex justify-center sm:bottom-40 ${
          focused ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="h-px w-24 bg-white/30">
          <div
            className="h-full bg-white"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Shop look — pristine focus card */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-36 z-30 flex justify-center px-6 sm:bottom-40 ${
          focused
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {focused ? (
          <div className="pointer-events-auto flex max-w-sm flex-col items-center gap-3 text-center">
            <p className="font-display text-sm tracking-[0.12em] text-white uppercase sm:text-base">
              {focused.title}
            </p>
            <p className="text-[10px] tracking-[0.22em] text-white/70 uppercase">
              {focused.subtitle}
            </p>
            {focused.productSlug ? (
              <Link
                href={`/product/${focused.productSlug}`}
                className="mt-1 border border-[#1c1b19] bg-[#1c1b19] px-7 py-2.5 text-[10px] tracking-[0.28em] text-[#f7f6f2] uppercase transition-colors hover:bg-transparent hover:text-[#1c1b19]"
              >
                Shop look
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
