"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import SceneArt from "./SceneArt";

type Props = {
  /** A real piece to lead with, when one exists — falls back to the drawn
      interior otherwise. This one needs a true alpha-transparent cutout
      (not a studio shot on white); it's shown as-is with a drop shadow,
      no background to mask out. */
  photo?: { url: string; alt: string };
};

/**
 * The hero plate drifts against the scroll and leans a few pixels toward the
 * cursor. Both are switched off on coarse pointers and reduced motion.
 */
export default function HeroArt({ photo }: Props) {
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
      className="relative order-2 aspect-4/5 w-full max-h-[min(620px,66vh)] overflow-hidden rounded-lg bg-forest-deep"
      style={{
        boxShadow: "0 40px 90px -46px rgba(0,0,0,.75)",
        transition:
          "transform 1.2s cubic-bezier(.16,.84,.24,1), opacity .9s ease",
      }}
    >
      {photo ? (
        <div className="absolute inset-[10%]">
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 36vw, 72vw"
            priority
            className="object-contain"
            style={{ filter: "drop-shadow(0 16px 18px rgba(0,0,0,.45))" }}
          />
        </div>
      ) : (
        <SceneArt scene="interior" className="size-full" />
      )}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]"
        style={{
          background:
            "linear-gradient(180deg,rgba(49,78,36,0),rgba(49,78,36,.55))",
        }}
      />
    </div>
  );
}
