"use client";

import { useEffect, useState } from "react";

/**
 * Home background. Photo: empty gallery at the Leeum Museum of Art, Seoul,
 * by Drey Santesson on Unsplash (Unsplash License — commercial use allowed,
 * attribution not required). Files: /images/museum.webp and museum-mobile.webp.
 */
export function MuseumBackdrop() {
  const [failed, setFailed] = useState(false);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setShift(Math.min(window.scrollY, 400) * 0.04);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#1a1814]"
      aria-hidden
    >
      {!failed && (
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/images/museum-mobile.webp"
            type="image/webp"
          />
          <img
            alt=""
            src="/images/museum.webp"
            width={1920}
            height={1344}
            className="absolute top-[-3%] left-0 h-[106%] w-full object-cover object-center"
            style={{ transform: `translate3d(0, ${shift}px, 0)` }}
            onError={() => setFailed(true)}
          />
        </picture>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/55" />
    </div>
  );
}
