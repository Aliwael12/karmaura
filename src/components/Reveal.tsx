"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  children?: ReactNode;
  /** stagger, in milliseconds — the source design's data-reveal value */
  delay?: number;
  /** rules wipe open from the left instead of rising */
  mode?: "rise" | "rule";
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "li" | "article" | "header";
};

const EASE = "cubic-bezier(.16,.84,.24,1)";

/**
 * Fades a block in the first time it crosses into view, once and for good.
 * Rises 28px by default; rules scale open from their left edge instead.
 */
export default function Reveal({
  children,
  delay = 0,
  mode = "rise",
  className,
  style,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Reduced motion is handled in CSS — globals.css collapses the transition
       to nothing, so the block still appears the moment it scrolls in. */
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden: CSSProperties =
    mode === "rule"
      ? { opacity: 0, transform: "scaleX(0)", transformOrigin: "left center" }
      : { opacity: 0, transform: "translateY(28px)" };

  const visible: CSSProperties =
    mode === "rule"
      ? { opacity: 1, transform: "none", transformOrigin: "left center" }
      : { opacity: 1, transform: "none" };

  const transitionDuration = mode === "rule" ? "1.45s" : "1.25s";

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        ...(shown ? visible : hidden),
        transition: `opacity 1.1s ${EASE} ${delay}ms, transform ${transitionDuration} ${EASE} ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
