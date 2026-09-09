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

type Props = {
  /** dark: cream text on the forest green that runs through the rest of
      the page. light: the reverse — a cream band breaking up two dark
      sections, so hero and "Quietly new" don't run together unbroken. */
  tone?: "dark" | "light";
};

function Track({
  hidden = false,
  textClass,
  dotClass,
}: {
  hidden?: boolean;
  textClass: string;
  dotClass: string;
}) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-[clamp(28px,4cqw,56px)] pr-[clamp(28px,4cqw,56px)]"
    >
      {ITEMS.map((item) => (
        <li
          key={item}
          className={`flex items-center gap-[clamp(28px,4cqw,56px)] font-serif text-[clamp(18px,2.2cqw,26px)] whitespace-nowrap italic ${textClass}`}
        >
          {item}
          <span aria-hidden className={`size-1.5 rounded-full ${dotClass}`} />
        </li>
      ))}
    </ul>
  );
}

export default function Marquee({ tone = "dark" }: Props) {
  const light = tone === "light";
  return (
    <div
      className={`km-marquee overflow-hidden border-y py-[clamp(14px,1.8cqw,22px)] ${
        light
          ? "border-forest/12 bg-cream"
          : "border-gold/20 bg-forest-deep"
      }`}
      aria-label="Materials and promises"
    >
      <div className="km-marquee-track flex w-max animate-marquee">
        <Track
          textClass={light ? "text-olive" : "text-cream/85"}
          dotClass={light ? "bg-gold" : "bg-gold-bright/80"}
        />
        <Track
          hidden
          textClass={light ? "text-olive" : "text-cream/85"}
          dotClass={light ? "bg-gold" : "bg-gold-bright/80"}
        />
      </div>
    </div>
  );
}
