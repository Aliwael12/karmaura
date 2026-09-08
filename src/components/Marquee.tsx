/**
 * A slow ticker of what the pieces are made of. Two identical copies of one
 * track sit side by side; the whole thing slides left by exactly one copy and
 * snaps back, so the seam always lands on a seam and it reads as endless.
 *
 * Constant motion, so it runs linear. It fades at both edges, pauses under
 * a pointer so a word can be read, and stops entirely under reduced motion —
 * all of that lives in globals.css beside the keyframe. No client code: it
 * is CSS the whole way down.
 */

const ITEMS = [
  "Hand-thrown clay",
  "Undyed linen",
  "Woven reed",
  "Aged brass",
  "Egyptian cotton",
  "Stoneware glazes",
  "Small runs",
  "Mended for life",
];

function Track({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-[clamp(28px,4cqw,56px)] pr-[clamp(28px,4cqw,56px)]"
    >
      {ITEMS.map((item) => (
        <li
          key={item}
          className="flex items-center gap-[clamp(28px,4cqw,56px)] font-serif text-[clamp(18px,2.2cqw,26px)] whitespace-nowrap text-cream/85 italic"
        >
          {item}
          <span aria-hidden className="size-1.5 rounded-full bg-gold-bright/80" />
        </li>
      ))}
    </ul>
  );
}

export default function Marquee() {
  return (
    <div
      className="km-marquee overflow-hidden border-y border-gold/20 bg-forest-deep py-[clamp(14px,1.8cqw,22px)]"
      aria-label="Materials and promises"
    >
      <div className="km-marquee-track flex w-max animate-marquee">
        <Track />
        <Track hidden />
      </div>
    </div>
  );
}
