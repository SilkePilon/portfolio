"use client";
/**
 * Option 9 — isometric architecture. A faint iso ground grid fades in, then 13 blocks (cdn, queue, db slab, cache,
 * web stack, api stack) drop into place back-to-front with a staggered translateY + fade. Dashed iso-aligned
 * connectors draw between groups, mono labels appear with a leader line, and finally the whole diagram settles
 * (rotate -3° → 0, scale .95 → 1) while "STACK" / "IT UP" slide in from the sides.
 */
import { useRef } from "react";
import { LabOption, seg, lerp, easeOut } from "../LabOption";

const U = 40;
const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;
const OX = 500;
const OY = 380;

/** Iso projection (30°, 40px unit): world (x, y, z) → screen "sx,sy". */
const pt = (x: number, y: number, z = 0): [number, number] => [
  +(OX + (x - y) * COS * U).toFixed(1),
  +(OY + (x + y) * SIN * U - z * U).toFixed(1),
];
const P = (x: number, y: number, z = 0) => pt(x, y, z).join(",");

/** Three faces of a box at (x, y, z) with footprint w×d and height h: [top, left, right] point strings. */
function cube(
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
) {
  const t = z + h;
  const top = [
    P(x, y, t),
    P(x + w, y, t),
    P(x + w, y + d, t),
    P(x, y + d, t),
  ].join(" ");
  const left = [
    P(x, y + d, t),
    P(x + w, y + d, t),
    P(x + w, y + d, z),
    P(x, y + d, z),
  ].join(" ");
  const right = [
    P(x + w, y, t),
    P(x + w, y + d, t),
    P(x + w, y + d, z),
    P(x + w, y, z),
  ].join(" ");
  return [top, left, right] as const;
}

type Block = {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
};
// Render order = array order = back to front so overlaps paint correctly.
const BLOCKS: Block[] = [
  { x: -4, y: -4, z: 0, w: 1, d: 1, h: 1 }, // cdn
  { x: -2.6, y: -4, z: 0, w: 1, d: 1, h: 1 }, // cdn
  { x: 2, y: -4, z: 0, w: 0.8, d: 0.8, h: 0.8 }, // queue
  { x: 3.4, y: -4, z: 0, w: 0.8, d: 0.8, h: 0.8 },
  { x: 4.8, y: -4, z: 0, w: 0.8, d: 0.8, h: 0.8 },
  { x: -1, y: -1, z: 0, w: 3, d: 3, h: 0.5 }, // db slab
  { x: 3.2, y: -1.4, z: 0, w: 0.8, d: 0.8, h: 0.8 }, // cache
  { x: -5, y: 1, z: 0, w: 1, d: 1, h: 1 }, // web ×3
  { x: -5, y: 1, z: 1, w: 1, d: 1, h: 1 },
  { x: -5, y: 1, z: 2, w: 1, d: 1, h: 1 },
  { x: 4, y: 1.2, z: 0, w: 1, d: 1, h: 1 }, // api ×2
  { x: 4, y: 1.2, z: 1, w: 1, d: 1, h: 1 },
  { x: 1, y: 3.4, z: 0, w: 1, d: 1, h: 0.6 }, // edge slab
];
const DROP = 0.12;
const dropAt = (i: number) =>
  0.1 + (i / (BLOCKS.length - 1)) * (0.75 - 0.1 - DROP);

// Ground-level dashed connectors, iso-aligned (move along x, then y).
const LINKS: string[][] = [
  [P(-3, -3), P(-3, -0.5), P(-1, -0.5)], // cdn → db
  [P(2.4, -3.2), P(2.4, -1), P(3.2, -1)], // queue → cache
  [P(3.6, -0.6), P(3.6, 1.7), P(4, 1.7)], // cache → api
  [P(2, 0.5), P(4, 0.5), P(4, 1.2)], // db → api
  [P(-1, 0.5), P(-4.5, 0.5), P(-4.5, 1)], // db → web
  [P(0.5, 2), P(0.5, 3.4), P(1, 3.4)], // db → edge
];

const LABELS: {
  text: string;
  from: [number, number];
  dx: number;
  dy: number;
}[] = [
  { text: "cdn", from: pt(-3.5, -3.5, 1), dx: -70, dy: -40 },
  { text: "queue", from: pt(3.4, -3.6, 0.8), dx: 60, dy: -50 },
  { text: "db", from: pt(0.5, -1, 0.5), dx: 50, dy: -60 },
  { text: "cache", from: pt(4, -1, 0.8), dx: 70, dy: -20 },
  { text: "web", from: pt(-4.5, 1.5, 3), dx: -70, dy: -30 },
  { text: "api", from: pt(4.5, 1.7, 2), dx: 70, dy: -10 },
  { text: "edge", from: pt(1.5, 4.4, 0.6), dx: 60, dy: 30 },
];

const GRID = Array.from({ length: 21 }, (_, i) => i - 10);
const DASH = 600;

export function Option9Iso() {
  const grid = useRef<SVGGElement>(null);
  const scene = useRef<SVGGElement>(null);
  const blocks = useRef<(SVGGElement | null)[]>([]);
  const links = useRef<(SVGPolylineElement | null)[]>([]);
  const labels = useRef<(SVGGElement | null)[]>([]);
  const words = useRef<(HTMLSpanElement | null)[]>([]);

  const draw = (p: number) => {
    if (grid.current) grid.current.style.opacity = `${seg(p, 0, 0.15)}`;
    BLOCKS.forEach((_, i) => {
      const g = blocks.current[i];
      if (!g) return;
      const a = dropAt(i);
      const t = easeOut(seg(p, a, a + DROP));
      g.setAttribute("transform", `translate(0 ${lerp(-120, 0, t)})`);
      g.style.opacity = `${t}`;
    });
    const draw = seg(p, 0.6, 0.85);
    links.current.forEach(
      (l) => l && (l.style.strokeDashoffset = `${DASH * (1 - draw)}`),
    );
    labels.current.forEach((l, i) => {
      if (!l) return;
      const t = easeOut(seg(p, 0.7 + i * 0.015, 0.88 + i * 0.015));
      l.style.opacity = `${t}`;
      l.setAttribute("transform", `translate(0 ${lerp(8, 0, t)})`);
    });
    const end = easeOut(seg(p, 0.85, 1));
    if (scene.current) {
      const s = lerp(0.95, 1, end);
      scene.current.setAttribute(
        "transform",
        `rotate(${lerp(-3, 0, end)} 500 350) translate(500 350) scale(${s}) translate(-500 -350)`,
      );
    }
    words.current.forEach((w, i) => {
      if (!w) return;
      w.style.opacity = `${end}`;
      w.style.transform = `translateX(${lerp(i ? 700 : -700, 0, end)}px)`;
    });
  };

  // Initial state lives in the JSX (opacity 0 / dashoffset); LabOption reports progress in its own layout effect,
  // which runs before this component's, so a draw(0) here would clobber the reduced-motion / test end state.
  return (
    <LabOption id="iso" heightVh={350} onProgress={draw}>
      <div className="relative flex w-[92vw] max-w-[1000px] flex-col items-center justify-center gap-2">
        <span
          ref={(el) => {
            words.current[0] = el;
          }}
          className="text-display text-white will-change-transform tablet:absolute tablet:left-0 tablet:top-0 tablet:-translate-y-1/2"
          style={{ opacity: 0 }}
        >
          STACK
        </span>
        {/* Phone: the section is viewport-wide and clips overflow, so the diagram is deliberately wider than the
            viewport (centred by the flex parent) to stay legible; words stay in flow above/below. */}
        <div className="w-[140vw] max-w-[1000px] shrink-0 -translate-x-[2%] tablet:w-full tablet:translate-x-0">
          <svg
            viewBox="0 0 1000 700"
            className="block h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
            fill="none"
          >
            <g ref={scene}>
              <g
                ref={grid}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
                style={{ opacity: 0 }}
              >
                {GRID.map((k) => (
                  <g key={k}>
                    <line
                      x1={pt(k, -10)[0]}
                      y1={pt(k, -10)[1]}
                      x2={pt(k, 10)[0]}
                      y2={pt(k, 10)[1]}
                    />
                    <line
                      x1={pt(-10, k)[0]}
                      y1={pt(-10, k)[1]}
                      x2={pt(10, k)[0]}
                      y2={pt(10, k)[1]}
                    />
                  </g>
                ))}
              </g>
              <g
                stroke="#7dd3a0"
                strokeOpacity={0.7}
                strokeWidth={1}
                strokeDasharray="4 6"
              >
                {LINKS.map((pts, i) => (
                  <polyline
                    key={i}
                    ref={(el) => {
                      links.current[i] = el;
                    }}
                    points={pts.join(" ")}
                    pathLength={DASH}
                    style={{ strokeDashoffset: DASH }}
                  />
                ))}
              </g>
              {BLOCKS.map((b, i) => {
                const [top, left, right] = cube(b.x, b.y, b.z, b.w, b.d, b.h);
                return (
                  <g
                    key={i}
                    ref={(el) => {
                      blocks.current[i] = el;
                    }}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth={1}
                    strokeLinejoin="round"
                    style={{ opacity: 0 }}
                  >
                    <polygon points={left} fill="#1a1a1a" />
                    <polygon points={right} fill="#212121" />
                    <polygon points={top} fill="#2a2a2a" />
                  </g>
                );
              })}
              {LABELS.map((l, i) => {
                const [fx, fy] = l.from;
                const lx = fx + l.dx;
                const ly = fy + l.dy;
                const end = l.dx < 0;
                return (
                  <g
                    key={l.text}
                    ref={(el) => {
                      labels.current[i] = el;
                    }}
                    style={{ opacity: 0 }}
                  >
                    <line
                      x1={fx}
                      y1={fy}
                      x2={lx + (end ? 6 : -6)}
                      y2={ly + 4}
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth={1}
                    />
                    <circle cx={fx} cy={fy} r={2} fill="#ababab" />
                    <text
                      x={lx}
                      y={ly + 8}
                      textAnchor={end ? "end" : "start"}
                      fill="#ababab"
                      letterSpacing="0.05em"
                      className="font-mono uppercase text-[17px] tablet:text-[12px]"
                    >
                      {l.text}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <span
          ref={(el) => {
            words.current[1] = el;
          }}
          className="text-display text-white will-change-transform tablet:absolute tablet:bottom-0 tablet:right-0 tablet:translate-y-1/2"
          style={{ opacity: 0 }}
        >
          IT UP
        </span>
      </div>
    </LabOption>
  );
}
