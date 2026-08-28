"use client";
/**
 * Option 3 — git graph. A `main` lane with two feature branches (feat/cms, fix/grid) that fork and merge back.
 * Paths draw themselves left→right via stroke-dashoffset as scroll progress advances; commit dots pop in with a
 * mono `sha message` label at their moment in the timeline. Merges are filled white dots. At p ≥ 0.85 a `v1.4.0`
 * tag pill lands on the last main commit and "MERGE / SHIP" rise behind the graph as a faint watermark.
 */
import { useLayoutEffect, useRef } from "react";
import { LabOption, seg, lerp, easeOut } from "../LabOption";

type Lane = "main" | "feat" | "fix";
type Commit = {
  x: number;
  y: number;
  t: number;
  sha: string;
  msg: string;
  merge?: boolean;
  above?: boolean;
};

const Y: Record<Lane, number> = { main: 300, feat: 180, fix: 420 };

// Each path draws over its own sub-range so the story reads main → fork → commits → merge.
const PATHS: { id: Lane; d: string; a: number; b: number; stroke: string }[] = [
  { id: "main", d: `M 60 ${Y.main} H 1140`, a: 0, b: 0.5, stroke: "#ffffff" },
  {
    id: "feat",
    d: `M 300 ${Y.main} C 360 ${Y.main} 360 ${Y.feat} 420 ${Y.feat} H 680 C 750 ${Y.feat} 750 ${Y.main} 820 ${Y.main}`,
    a: 0.16,
    b: 0.56,
    stroke: "#999999",
  },
  {
    id: "fix",
    d: `M 560 ${Y.main} C 620 ${Y.main} 620 ${Y.fix} 680 ${Y.fix} H 920 C 1000 ${Y.fix} 1000 ${Y.main} 1080 ${Y.main}`,
    a: 0.34,
    b: 0.8,
    stroke: "#999999",
  },
];

const COMMITS: Commit[] = [
  // Neighbours on a lane never share a label row: `row` alternates below (+26) / above (-18) per lane, so labels can
  // overlap horizontally without colliding, whatever the real rendered glyph width is. Messages stay ≤ 18 chars.
  { x: 100, y: Y.main, t: 0.03, sha: "e3b0c4", msg: "chore: init" },
  { x: 260, y: Y.main, t: 0.13, sha: "9f2a71", msg: "feat: app router" },
  { x: 400, y: Y.main, t: 0.2, sha: "b82c0d", msg: "fix: hydration" },
  { x: 430, y: Y.feat, t: 0.26, sha: "a1f3c2", msg: "feat(cms): preview" },
  { x: 670, y: Y.feat, t: 0.36, sha: "4d7e19", msg: "feat(cms): getters" },
  { x: 760, y: Y.fix, t: 0.5, sha: "c0ffee", msg: "fix(grid): order" },
  {
    x: 820,
    y: Y.main,
    t: 0.57,
    sha: "7a1b2c",
    msg: "merge feat/cms",
    merge: true,
  },
  {
    x: 1080,
    y: Y.main,
    t: 0.8,
    sha: "f00dad",
    msg: "merge fix/grid",
    merge: true,
  },
].reduce<Commit[]>((acc, c) => {
  const nth = acc.filter((o) => o.y === c.y).length;
  return [...acc, { ...c, above: nth % 2 === 1 }];
}, []);

const POP = 0.06;
const FALLBACK_LEN = 1400;

export function Option3GitGraph() {
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const lens = useRef<number[]>([]);
  const dots = useRef<(SVGGElement | null)[]>([]);
  const labels = useRef<(SVGTextElement | null)[]>([]);
  const tag = useRef<SVGGElement>(null);
  const marks = useRef<(HTMLSpanElement | null)[]>([]);

  const draw = (p: number) => {
    PATHS.forEach((path, i) => {
      const el = paths.current[i];
      if (!el) return;
      const L = lens.current[i] ?? FALLBACK_LEN;
      el.style.strokeDasharray = `${L}`;
      el.style.strokeDashoffset = `${L * (1 - seg(p, path.a, path.b))}`;
    });
    COMMITS.forEach((c, i) => {
      const s = easeOut(seg(p, c.t, c.t + POP));
      const g = dots.current[i];
      if (g)
        g.setAttribute("transform", `translate(${c.x} ${c.y}) scale(${s})`);
      const l = labels.current[i];
      if (l) {
        const f = easeOut(seg(p, c.t + 0.02, c.t + POP + 0.04));
        l.style.opacity = `${f}`;
        l.setAttribute(
          "transform",
          `translate(0 ${lerp(c.above ? 6 : -6, 0, f)})`,
        );
      }
    });
    const end = easeOut(seg(p, 0.85, 0.95));
    if (tag.current) {
      tag.current.style.opacity = `${end}`;
      tag.current.setAttribute(
        "transform",
        `translate(1080 ${lerp(250, 258, end)}) scale(${lerp(0.9, 1, end)})`,
      );
    }
    marks.current.forEach((m, i) => {
      if (!m) return;
      m.style.opacity = `${0.15 * end}`;
      m.style.transform = `translateY(${lerp(i ? -40 : 40, 0, end)}px)`;
    });
  };

  useLayoutEffect(() => {
    lens.current = paths.current.map((el) =>
      el && typeof el.getTotalLength === "function"
        ? el.getTotalLength()
        : FALLBACK_LEN,
    );
    draw(0);
  }, []);

  return (
    <LabOption id="gitgraph" heightVh={300} onProgress={draw}>
      <div className="relative flex h-full w-full items-center justify-center">
        {/* Watermark is real text positioned against the viewport (not the wide SVG) so it stays inside 390px. */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 text-display text-white"
          aria-hidden
        >
          {["MERGE", "SHIP"].map((w, i) => (
            <span
              key={w}
              ref={(el) => {
                marks.current[i] = el;
              }}
              className="will-change-transform"
              style={{ opacity: 0 }}
            >
              {w}
            </span>
          ))}
        </div>
        {/* `shrink-0` keeps the phone width at 220vw inside the flex parent; the sticky stage clips the overflow. */}
        <div className="relative w-[220vw] max-w-[1200px] shrink-0 tablet:w-[92vw]">
          <svg
            viewBox="0 0 1200 600"
            className="relative block h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
            fill="none"
          >
            {(Object.keys(Y) as Lane[]).map((lane) => (
              <text
                key={lane}
                x={60}
                y={Y[lane] - 14}
                fill="#999999"
                fontSize={11}
                letterSpacing="0.05em"
                className="font-mono uppercase"
              >
                {lane === "main"
                  ? "main"
                  : lane === "feat"
                    ? "feat/cms"
                    : "fix/grid"}
              </text>
            ))}
            {PATHS.map((path, i) => (
              <path
                key={path.id}
                ref={(el) => {
                  paths.current[i] = el;
                }}
                d={path.d}
                stroke={path.stroke}
                strokeWidth={1.5}
                strokeLinecap="round"
                style={{
                  strokeDasharray: FALLBACK_LEN,
                  strokeDashoffset: FALLBACK_LEN,
                }}
              />
            ))}
            {COMMITS.map((c, i) => (
              <g key={c.sha}>
                <g
                  ref={(el) => {
                    dots.current[i] = el;
                  }}
                  transform={`translate(${c.x} ${c.y}) scale(0)`}
                >
                  <circle
                    r={5}
                    fill={c.merge ? "#ffffff" : "#0e0e0e"}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                </g>
                <text
                  ref={(el) => {
                    labels.current[i] = el;
                  }}
                  x={c.x}
                  y={c.above ? c.y - 18 : c.y + 26}
                  textAnchor="middle"
                  fill="#ababab"
                  fontSize={13}
                  className="font-mono"
                  style={{ opacity: 0 }}
                >
                  <tspan fill="#ffffff">{c.sha}</tspan> {c.msg}
                </text>
              </g>
            ))}
            <g ref={tag} transform="translate(1080 250)" style={{ opacity: 0 }}>
              <rect
                x={-32}
                y={-24}
                width={64}
                height={22}
                rx={11}
                fill="#212121"
                stroke="rgba(255,255,255,0.15)"
              />
              <text
                y={-9}
                textAnchor="middle"
                fill="#7dd3a0"
                fontSize={11}
                letterSpacing="0.05em"
                className="font-mono"
              >
                v1.4.0
              </text>
            </g>
          </svg>
        </div>
      </div>
    </LabOption>
  );
}
