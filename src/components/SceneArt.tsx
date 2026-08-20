type Props = {
  scene: "interior" | "atelier";
  className?: string;
};

/**
 * The two full-bleed scenes — the calm interior behind the hero, and the
 * atelier band on the story page. Stand-ins for photography, drawn in the
 * house palette so the page reads finished rather than empty.
 */
export default function SceneArt({ scene, className }: Props) {
  return scene === "interior" ? (
    <Interior className={className} />
  ) : (
    <Atelier className={className} />
  );
}

function Interior({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 1000"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A calm interior — clay, linen, low light"
    >
      <defs>
        <linearGradient id="km-wall" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#4a4331" />
          <stop offset="55%" stopColor="#332e20" />
          <stop offset="100%" stopColor="#221e14" />
        </linearGradient>
        <linearGradient id="km-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbeccb" />
          <stop offset="60%" stopColor="#e8cf9c" />
          <stop offset="100%" stopColor="#cfae74" />
        </linearGradient>
        <radialGradient id="km-halo" cx="30%" cy="34%" r="52%">
          <stop offset="0%" stopColor="#f7e2b4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f7e2b4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="km-linen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2d3b4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b8a785" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="km-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b2517" />
          <stop offset="100%" stopColor="#191509" />
        </linearGradient>
      </defs>

      <rect width="800" height="1000" fill="url(#km-wall)" />

      {/* the window, and the halo it throws into the room */}
      <path d="M120 620 L120 300 C120 190 200 128 280 128 C360 128 440 190 440 300 L440 620 Z" fill="url(#km-window)" />
      <g stroke="#3a3122" strokeWidth="7" fill="none" opacity="0.55">
        <path d="M280 128 L280 620" />
        <path d="M120 348 L440 348" />
        <path d="M120 486 L440 486" />
      </g>
      <rect width="800" height="1000" fill="url(#km-halo)" />

      {/* light spilling across the floor */}
      <path d="M120 700 L440 700 L620 1000 L200 1000 Z" fill="#f4e0b6" opacity="0.1" />

      <rect y="700" width="800" height="300" fill="url(#km-floor)" />
      <rect y="694" width="800" height="8" fill="#0f0c05" opacity="0.5" />

      {/* linen hung on the right wall */}
      <path
        d="M566 96 L764 96 L764 470 C728 496 700 452 664 478 C628 504 600 460 566 486 Z"
        fill="url(#km-linen)"
      />
      <g stroke="#7d7050" strokeWidth="2" opacity="0.35">
        <path d="M614 100 L614 470" fill="none" />
        <path d="M666 100 L666 480" fill="none" />
        <path d="M718 100 L718 470" fill="none" />
      </g>

      {/* a low table, and what sits on it */}
      <rect x="430" y="636" width="350" height="16" rx="6" fill="#5d4f36" />
      <rect x="456" y="652" width="14" height="66" fill="#4a3f2b" />
      <rect x="740" y="652" width="14" height="66" fill="#4a3f2b" />

      <g fill="#b59a70">
        <path d="M520 500 C498 536 486 580 492 620 C496 640 508 636 528 636 C548 636 560 640 564 620 C570 580 558 536 536 500 Z" />
        <ellipse cx="528" cy="500" rx="16" ry="6" />
      </g>
      <g stroke="#8b9a5e" strokeWidth="4" fill="none" opacity="0.8">
        <path d="M528 500 C516 452 496 424 470 408" />
        <path d="M528 500 C540 456 566 432 594 422" />
        <path d="M528 502 C528 466 530 442 526 418" />
      </g>

      <g fill="#c9ae84">
        <path d="M614 590 C618 620 638 636 664 636 C690 636 710 620 714 590 Z" />
        <ellipse cx="664" cy="590" rx="50" ry="12" />
      </g>

      {/* a basket left on the floor — kept high enough to survive the crop
          the hero's max-height puts on this 4:5 plate */}
      <g fill="#a08b60">
        <path d="M182 762 L196 862 C198 876 208 884 222 884 L290 884 C304 884 314 876 316 862 L330 762 Z" />
        <ellipse cx="256" cy="762" rx="74" ry="19" />
        <ellipse cx="256" cy="762" rx="60" ry="14" fill="#4a3f2b" />
      </g>
    </svg>
  );
}

function Atelier({ className }: { className?: string }) {
  /* 3.5:1 — close to the band's own ratio, so `slice` barely crops */
  return (
    <svg
      viewBox="0 0 1400 400"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="The atelier — hands at the wheel, low light"
    >
      <defs>
        <linearGradient id="km-atelier-bg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#3b3626" />
          <stop offset="100%" stopColor="#1d1a10" />
        </linearGradient>
        <radialGradient id="km-lamp" cx="50%" cy="8%" r="52%">
          <stop offset="0%" stopColor="#ffeec6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffeec6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1400" height="400" fill="url(#km-atelier-bg)" />

      {/* shelves of drying work, in the dark behind */}
      <g opacity="0.4" fill="#8d7c58">
        <rect x="90" y="112" width="340" height="8" rx="4" />
        <rect x="970" y="112" width="340" height="8" rx="4" />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={`l-${i}`}
            d={`M${132 + i * 78} 66 C${120 + i * 78} 88 ${118 + i * 78} 104 ${128 + i * 78} 112 L${172 + i * 78} 112 C${182 + i * 78} 104 ${180 + i * 78} 88 ${168 + i * 78} 66 Z`}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <g key={`r-${i}`}>
            <ellipse cx={1020 + i * 78} cy={112} rx="27" ry="8" />
            <path
              d={`M${993 + i * 78} 112 L${1000 + i * 78} 74 L${1040 + i * 78} 74 L${1047 + i * 78} 112 Z`}
            />
          </g>
        ))}
      </g>

      <rect width="1400" height="400" fill="url(#km-lamp)" />

      {/* the potter, backlit — head, shoulders, two arms coming down */}
      <g fill="#191609" opacity="0.9">
        <circle cx="700" cy="94" r="36" />
        <path d="M700 138 C758 138 796 178 811 238 C818 268 820 296 817 322 L583 322 C580 296 582 268 589 238 C604 178 642 138 700 138 Z" />
        <path d="M601 196 C562 228 546 268 548 312 C549 327 570 329 573 314 C582 276 596 249 621 229 Z" />
        <path d="M799 196 C838 228 854 268 852 312 C851 327 830 329 827 314 C818 276 804 249 779 229 Z" />
      </g>

      {/* the wheel head */}
      <ellipse cx="700" cy="336" rx="232" ry="46" fill="#241f12" />
      <ellipse cx="700" cy="326" rx="222" ry="42" fill="#6a5b3d" />
      <ellipse cx="700" cy="321" rx="190" ry="34" fill="#82704b" />

      {/* the piece rising under the hands */}
      <path
        d="M652 321 C636 274 643 232 668 200 C681 185 719 185 732 200 C757 232 764 274 748 321 Z"
        fill="#c9ab7d"
      />
      <ellipse cx="700" cy="195" rx="32" ry="10" fill="#dcc199" />
      <ellipse cx="700" cy="195" rx="19" ry="5" fill="#6e5c3c" />

      {/* the hands themselves, closing on the clay */}
      <g fill="#1d1a0d" opacity="0.92">
        <path d="M612 226 C636 210 660 210 671 226 C678 237 674 253 662 260 C640 272 613 265 604 249 C599 238 603 231 612 226 Z" />
        <path d="M788 226 C764 210 740 210 729 226 C722 237 726 253 738 260 C760 272 787 265 796 249 C801 238 797 231 788 226 Z" />
      </g>

      <rect y="358" width="1400" height="42" fill="#15120a" opacity="0.7" />
    </svg>
  );
}
