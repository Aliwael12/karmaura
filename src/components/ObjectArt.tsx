import type { ArtKind } from "@/lib/products";

type Tone = "light" | "dark";

type Props = {
  kind: ArtKind;
  tone?: Tone;
  className?: string;
};

/**
 * The gradients and the grain filter every piece of artwork shares. Rendered
 * once, in the layout, so fifteen product cards do not each ship their own.
 */
export function ArtDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <linearGradient id="km-ground-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9d5b0" />
          <stop offset="100%" stopColor="#d2b78e" />
        </linearGradient>
        <linearGradient id="km-ground-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f4a24" />
          <stop offset="100%" stopColor="#1e2f15" />
        </linearGradient>

        <radialGradient id="km-bloom-light" cx="26%" cy="18%" r="70%">
          <stop offset="0%" stopColor="#fff6e4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fff6e4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="km-bloom-dark" cx="26%" cy="18%" r="70%">
          <stop offset="0%" stopColor="#8fa05c" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#8fa05c" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="km-clay-light" x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#c2a377" />
          <stop offset="100%" stopColor="#8b7350" />
        </linearGradient>
        <linearGradient id="km-clay-dark" x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#b39a70" />
          <stop offset="100%" stopColor="#6a5a3c" />
        </linearGradient>

        <radialGradient id="km-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <filter id="km-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Stand-in artwork for the catalogue photography — a warm ground, a bloom of
 * light, and a silhouette of the piece itself. Deterministic, so a given
 * object looks the same everywhere it appears.
 */
export default function ObjectArt({ kind, tone = "light", className }: Props) {
  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
    >
      <rect width="400" height="500" fill={`url(#km-ground-${tone})`} />
      <rect width="400" height="500" fill={`url(#km-bloom-${tone})`} />

      {/* the piece pools a little shade before it is drawn */}
      <ellipse cx="200" cy="432" rx="132" ry="26" fill="url(#km-pool)" />

      <g fill={`url(#km-clay-${tone})`}>
        <Silhouette kind={kind} />
      </g>

      {/* a whisper of grain, so the fill reads as clay and not as vector */}
      <rect
        width="400"
        height="500"
        filter="url(#km-grain)"
        opacity={tone === "light" ? 0.09 : 0.14}
        style={{ mixBlendMode: "overlay" }}
      />
    </svg>
  );
}

const HAIRLINE = {
  stroke: "rgba(255,246,228,0.22)",
  strokeWidth: 2,
  fill: "none",
} as const;

function Silhouette({ kind }: { kind: ArtKind }) {
  switch (kind) {
    case "vessel":
      return (
        <>
          <path d="M172 132 C130 194 104 270 116 342 C126 402 158 426 200 426 C242 426 274 402 284 342 C296 270 270 194 228 132 Z" />
          <ellipse cx="200" cy="132" rx="28" ry="10" />
          <path d="M150 200 C132 260 128 330 142 392" {...HAIRLINE} />
        </>
      );

    case "bowl":
      return (
        <>
          <path d="M84 262 C92 356 138 400 200 400 C262 400 308 356 316 262 Z" />
          <ellipse cx="200" cy="262" rx="116" ry="28" />
          <ellipse cx="200" cy="262" rx="96" ry="22" fill="rgba(255,246,228,0.16)" />
          <path d="M112 300 C132 356 164 382 200 388" {...HAIRLINE} />
        </>
      );

    case "carafe":
      return (
        <>
          <path d="M180 116 L180 214 C140 244 118 296 118 340 C118 390 154 422 200 422 C246 422 282 390 282 340 C282 296 260 244 220 214 L220 116 Z" />
          <path d="M168 104 L232 104 L220 118 L180 118 Z" />
          <ellipse cx="200" cy="214" rx="26" ry="7" fill="rgba(255,246,228,0.18)" />
          <path d="M146 268 C130 312 132 366 158 396" {...HAIRLINE} />
        </>
      );

    case "planter":
      return (
        <>
          <path d="M122 214 L144 384 C146 404 160 414 178 414 L222 414 C240 414 254 404 256 384 L278 214 Z" />
          <ellipse cx="200" cy="214" rx="78" ry="20" />
          <ellipse cx="200" cy="214" rx="62" ry="14" fill="rgba(60,40,20,0.28)" />
          <rect x="168" y="412" width="64" height="12" rx="4" />
        </>
      );

    case "throw":
      return (
        <>
          <path d="M92 214 C150 196 250 196 308 214 L308 268 C250 250 150 250 92 268 Z" />
          <path d="M92 278 C150 260 250 260 308 278 L308 332 C250 314 150 314 92 332 Z" />
          <path d="M92 342 C150 324 250 324 308 342 L308 396 C250 378 150 378 92 396 Z" />
          <g stroke="rgba(255,246,228,0.28)" strokeWidth="2">
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={i}
                x1={104 + i * 24}
                y1={398}
                x2={104 + i * 24}
                y2={422}
              />
            ))}
          </g>
        </>
      );

    case "cushion":
      return (
        <>
          <path d="M96 178 C150 160 250 160 304 178 C322 232 322 340 304 394 C250 412 150 412 96 394 C78 340 78 232 96 178 Z" />
          <path d="M124 206 C170 194 230 194 276 206" {...HAIRLINE} />
          <path d="M124 366 C170 378 230 378 276 366" {...HAIRLINE} />
        </>
      );

    case "runner":
      return (
        <>
          <path d="M148 128 L252 128 L268 404 L132 404 Z" />
          <path
            d="M141 168 L259 168"
            stroke="rgba(255,246,228,0.3)"
            strokeWidth="10"
            fill="none"
          />
          <path
            d="M137 246 L263 246"
            stroke="rgba(60,40,20,0.22)"
            strokeWidth="14"
            fill="none"
          />
          <path
            d="M133 344 L267 344"
            stroke="rgba(255,246,228,0.24)"
            strokeWidth="8"
            fill="none"
          />
          <g stroke="rgba(255,246,228,0.28)" strokeWidth="2">
            {Array.from({ length: 7 }, (_, i) => (
              <line
                key={i}
                x1={140 + i * 20}
                y1={404}
                x2={138 + i * 20}
                y2={424}
              />
            ))}
          </g>
        </>
      );

    case "platter":
      return (
        <>
          <ellipse cx="200" cy="300" rx="156" ry="92" />
          <ellipse cx="200" cy="296" rx="128" ry="70" fill="rgba(255,246,228,0.16)" />
          <ellipse cx="200" cy="296" rx="96" ry="48" fill="rgba(60,40,20,0.1)" />
        </>
      );

    case "cups":
      return (
        <>
          {[0, 1, 2, 3].map((i) => {
            const x = 92 + i * 74;
            const y = 268 + (i % 2) * 16;
            return (
              <g key={i}>
                <path
                  d={`M${x} ${y} C${x} ${y + 62} ${x + 8} ${y + 78} ${x + 27} ${y + 78} C${x + 46} ${y + 78} ${x + 54} ${y + 62} ${x + 54} ${y} Z`}
                />
                <ellipse cx={x + 27} cy={y} rx="27" ry="9" />
                <ellipse cx={x + 27} cy={y} rx="20" ry="6" fill="rgba(60,40,20,0.3)" />
              </g>
            );
          })}
        </>
      );

    case "board":
      return (
        <>
          <rect x="80" y="196" width="240" height="184" rx="26" />
          <circle cx="292" cy="228" r="13" fill="rgba(60,40,20,0.34)" />
          <g stroke="rgba(60,40,20,0.16)" strokeWidth="3" fill="none">
            <path d="M112 220 C160 260 160 316 112 356" />
            <path d="M152 210 C204 260 204 316 152 366" />
            <path d="M196 206 C250 260 250 318 196 372" />
          </g>
        </>
      );

    case "disc":
      return (
        <>
          <circle cx="200" cy="272" r="132" />
          <g stroke="rgba(255,246,228,0.24)" strokeWidth="2" fill="none">
            <circle cx="200" cy="272" r="106" />
            <circle cx="200" cy="272" r="78" />
            <circle cx="200" cy="272" r="48" />
          </g>
          <circle cx="158" cy="228" r="42" fill="rgba(255,246,228,0.2)" />
        </>
      );

    case "mirror":
      return (
        <>
          <path d="M104 424 L104 226 C104 148 147 106 200 106 C253 106 296 148 296 226 L296 424 Z" />
          <path
            d="M124 414 L124 230 C124 162 158 126 200 126 C242 126 276 162 276 230 L276 414 Z"
            fill="rgba(255,246,228,0.24)"
          />
          <path
            d="M140 400 C160 320 200 250 262 190"
            stroke="rgba(255,246,228,0.4)"
            strokeWidth="12"
            fill="none"
          />
          <rect x="104" y="382" width="192" height="16" rx="6" />
        </>
      );

    case "basket":
      return (
        <>
          <path d="M108 202 L128 396 C130 412 142 422 158 422 L242 422 C258 422 270 412 272 396 L292 202 Z" />
          <ellipse cx="200" cy="202" rx="92" ry="24" />
          <ellipse cx="200" cy="202" rx="76" ry="18" fill="rgba(60,40,20,0.3)" />
          <g stroke="rgba(255,246,228,0.24)" strokeWidth="3" fill="none">
            <path d="M116 262 L284 262" />
            <path d="M120 314 L280 314" />
            <path d="M125 366 L275 366" />
          </g>
        </>
      );

    case "tray":
      return (
        <>
          <ellipse cx="200" cy="300" rx="150" ry="86" />
          <ellipse cx="200" cy="296" rx="124" ry="66" fill="rgba(255,246,228,0.18)" />
          <g stroke="rgba(60,40,20,0.16)" strokeWidth="3" fill="none">
            <ellipse cx="200" cy="296" rx="96" ry="50" />
            <ellipse cx="200" cy="296" rx="64" ry="32" />
            <ellipse cx="200" cy="296" rx="32" ry="15" />
          </g>
        </>
      );

    case "hamper":
      return (
        <>
          <path d="M112 176 L128 396 C130 412 142 422 158 422 L242 422 C258 422 270 412 272 396 L288 176 Z" />
          <rect x="100" y="146" width="200" height="38" rx="12" />
          <rect x="176" y="128" width="48" height="24" rx="10" />
          <g stroke="rgba(255,246,228,0.22)" strokeWidth="3" fill="none">
            <path d="M120 244 L280 244" />
            <path d="M124 306 L276 306" />
            <path d="M128 368 L272 368" />
          </g>
          <rect x="132" y="252" width="18" height="34" rx="7" fill="rgba(60,40,20,0.4)" />
          <rect x="250" y="252" width="18" height="34" rx="7" fill="rgba(60,40,20,0.4)" />
        </>
      );
  }
}
