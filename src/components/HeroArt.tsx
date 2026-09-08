"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * The hero band drifts against the scroll and leans a few pixels toward the
 * cursor. Both are switched off on coarse pointers and reduced motion.
 *
 * It carries the one photograph in the house that has a room in it rather
 * than a seamless backdrop — the packaging on a linen runner, morning light,
 * a vase out of focus behind. A single product cutout can only say "here is
 * one object"; the headline promises a calm home, and this is the only frame
 * that holds one.
 *
 * On a phone it breaks the gutter and runs edge to edge, fading up into the
 * section's green so it reads as the room opening rather than a picture set
 * into a frame. From sm it returns to its column, boxed and rounded.
 */
export default function HeroArt() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const still =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
    if (still) return;

    let dx = 0;
    let dy = 0;
    let frame = 0;

    const paint = () => {
      frame = 0;
      const base = Math.max(-70, window.scrollY * -0.07);
      el.style.transform = `translate(${(dx * -10).toFixed(1)}px, ${(dy * -8 + base).toFixed(1)}px)`;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const onMove = (e: MouseEvent) => {
      dx = e.clientX / window.innerWidth - 0.5;
      dy = e.clientY / window.innerHeight - 0.5;
      schedule();
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    paint();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("mousemove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="km-bleed relative order-2 aspect-3/2 w-auto overflow-hidden bg-forest-deep sm:w-full sm:rounded-lg"
      style={{
        transition:
          "transform 1.2s cubic-bezier(.16,.84,.24,1), opacity .9s ease",
      }}
    >
      <Image
        src="/brand/kraft.png"
        alt="A Karmaura tube on a linen runner, morning light across the table"
        fill
        sizes="(min-width: 1024px) 45vw, 100vw"
        priority
        className="object-cover"
      />

      {/* on the phone the band has no frame, so it is dissolved into the
          green above it instead of stopping at a hard edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[26%] sm:hidden"
        style={{
          background: "linear-gradient(180deg,#3d5c2b,rgba(61,92,43,0))",
        }}
      />
    </div>
  );
}
