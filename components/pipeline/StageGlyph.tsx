/*
  Abstract per-stage diagrams in the site's survey language:
  dotted strokes, hairlines, cerulean data accents, one coral registration mark.
  Decorative only — always aria-hidden.
*/

const DOT_STROKE = { strokeDasharray: "0.1 6", strokeLinecap: "round" as const };

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true" fill="none">
      <rect x="1" y="1" width="398" height="298" stroke="var(--color-line-dark)" />
      {/* corner ticks */}
      {[
        [10, 10],
        [390, 10],
        [10, 290],
        [390, 290],
      ].map(([x, y], i) => (
        <g key={i} stroke="var(--color-steel)" strokeWidth="1">
          <line x1={x - 5} y1={y} x2={x + 5} y2={y} />
          <line x1={x} y1={y - 5} x2={x} y2={y + 5} />
        </g>
      ))}
      {children}
    </svg>
  );
}

export default function StageGlyph({ index }: { index: number }) {
  switch (index) {
    case 0: {
      // Reality Capture — terrestrial station scans the facade, drone scans the roof
      const scanner: [number, number] = [88, 208];
      const drone: [number, number] = [158, 52];
      const facadeHits: Array<[number, number]> = [
        [252, 146],
        [252, 172],
        [252, 198],
        [252, 224],
      ];
      const roofHits: Array<[number, number]> = [
        [262, 130],
        [284, 117],
        [306, 104],
        [327, 116],
        [348, 129],
      ];
      return (
        <Frame>
          {/* ground */}
          <line x1="50" y1="242" x2="370" y2="242" stroke="var(--color-steel)" strokeWidth="1" opacity="0.6" {...DOT_STROKE} />

          {/* the building being captured — same gabled massing as the hero */}
          <path
            d="M252 242 L252 140 L305 102 L358 140 L358 242"
            stroke="var(--color-cerulean)"
            strokeWidth="1.5"
            fill="none"
          />
          {/* window openings */}
          {[160, 196].map((y) =>
            [268, 300, 332].map((x) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="14" height="18" stroke="var(--color-cerulean)" strokeWidth="1" opacity="0.5" />
            )),
          )}

          {/* terrestrial scan station (coral registration mark + tripod) */}
          <g stroke="#d52b1e" strokeWidth="1.5">
            <circle cx={scanner[0]} cy={scanner[1]} r="12" />
            <line x1={scanner[0]} y1={scanner[1] - 20} x2={scanner[0]} y2={scanner[1] - 8} />
            <line x1={scanner[0]} y1={scanner[1] + 8} x2={scanner[0]} y2={scanner[1] + 20} />
            <line x1={scanner[0] - 20} y1={scanner[1]} x2={scanner[0] - 8} y2={scanner[1]} />
            <line x1={scanner[0] + 8} y1={scanner[1]} x2={scanner[0] + 20} y2={scanner[1]} />
          </g>
          <g stroke="var(--color-steel)" strokeWidth="1">
            <line x1={scanner[0]} y1={scanner[1] + 12} x2={scanner[0] - 15} y2="242" />
            <line x1={scanner[0]} y1={scanner[1] + 12} x2={scanner[0] + 15} y2="242" />
            <line x1={scanner[0]} y1={scanner[1] + 12} x2={scanner[0]} y2="242" />
          </g>

          {/* drone — quadcopter in side view */}
          <g stroke="var(--color-steel)" strokeWidth="1.5">
            <line x1={drone[0] - 26} y1={drone[1]} x2={drone[0] + 26} y2={drone[1]} />
            <line x1={drone[0] - 22} y1={drone[1]} x2={drone[0] - 22} y2={drone[1] - 6} />
            <line x1={drone[0] + 22} y1={drone[1]} x2={drone[0] + 22} y2={drone[1] - 6} />
            <line x1={drone[0] - 34} y1={drone[1] - 6} x2={drone[0] - 10} y2={drone[1] - 6} />
            <line x1={drone[0] + 10} y1={drone[1] - 6} x2={drone[0] + 34} y2={drone[1] - 6} />
            <rect x={drone[0] - 8} y={drone[1] - 3} width="16" height="8" />
          </g>

          {/* scan rays: station → facade, drone → roof */}
          {facadeHits.map(([x, y], i) => (
            <line key={`f-${i}`} x1={scanner[0] + 12} y1={scanner[1]} x2={x} y2={y} stroke="var(--color-cerulean)" strokeWidth="1" opacity="0.55" {...DOT_STROKE} />
          ))}
          {roofHits.map(([x, y], i) => (
            <line key={`r-${i}`} x1={drone[0]} y1={drone[1] + 6} x2={x} y2={y} stroke="var(--color-cerulean)" strokeWidth="1" opacity="0.55" {...DOT_STROKE} />
          ))}
          {/* returns landing on the surfaces */}
          {[...facadeHits, ...roofHits].map(([x, y], i) => (
            <circle key={`h-${i}`} cx={x} cy={y} r="1.8" fill="var(--color-cerulean)" opacity="0.9" />
          ))}
        </Frame>
      );
    }
    case 1:
      // Point Cloud — dot lattice under registration
      return (
        <Frame>
          {Array.from({ length: 9 }).map((_, r) =>
            Array.from({ length: 13 }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={52 + c * 25}
                cy={54 + r * 24}
                r={1.6}
                fill="var(--color-cerulean)"
                opacity={0.25 + ((r * 13 + c * 7) % 10) * 0.06}
              />
            )),
          )}
          <g stroke="#d52b1e" strokeWidth="1.2">
            <circle cx="202" cy="150" r="26" />
            <line x1="202" y1="112" x2="202" y2="132" />
            <line x1="202" y1="168" x2="202" y2="188" />
            <line x1="164" y1="150" x2="184" y2="150" />
            <line x1="220" y1="150" x2="240" y2="150" />
          </g>
          <rect x="52" y="54" width="300" height="192" stroke="var(--color-line-dark)" />
        </Frame>
      );
    case 2:
      // BIM Production — a modeller at the workstation, model taking shape on screen
      return (
        <Frame>
          {/* floor */}
          <line x1="55" y1="258" x2="360" y2="258" stroke="var(--color-steel)" strokeWidth="1" opacity="0.6" {...DOT_STROKE} />

          {/* desk */}
          <g stroke="var(--color-steel)" strokeWidth="1.5">
            <line x1="95" y1="216" x2="350" y2="216" />
            <line x1="108" y1="216" x2="108" y2="258" />
            <line x1="338" y1="216" x2="338" y2="258" />
          </g>

          {/* monitor on stand */}
          <g stroke="var(--color-steel)" strokeWidth="1.5" fill="none">
            <rect x="198" y="82" width="136" height="100" />
            <line x1="266" y1="182" x2="266" y2="206" />
            <line x1="244" y1="208" x2="288" y2="208" />
          </g>

          {/* on screen: point cloud resolving into the model */}
          <line x1="198" y1="96" x2="334" y2="96" stroke="var(--color-steel)" strokeWidth="1" opacity="0.6" />
          <line x1="318" y1="96" x2="318" y2="182" stroke="var(--color-steel)" strokeWidth="1" opacity="0.6" />
          {[104, 112, 120].map((y) => (
            <line key={y} x1="322" y1={y} x2="330" y2={y} stroke="var(--color-cerulean)" strokeWidth="1" opacity="0.6" />
          ))}
          <path
            d="M216 168 L216 133 L253 108 L290 133 L290 168 Z"
            stroke="var(--color-cerulean)"
            strokeWidth="1.5"
            fill="none"
          />
          {[[226, 141], [246, 141], [266, 141], [226, 155], [246, 155], [266, 155]].map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="9" height="10" stroke="var(--color-cerulean)" strokeWidth="1" opacity="0.5" />
          ))}
          {/* stray cloud points still to be modelled */}
          {[[222, 116], [235, 106], [258, 100], [276, 112], [284, 122], [210, 128], [296, 140]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="var(--color-cerulean)" opacity="0.6" />
          ))}
          {/* cursor — the coral registration mark, placed on the ridge */}
          <g stroke="#d52b1e" strokeWidth="1.2">
            <circle cx="253" cy="108" r="6" />
            <line x1="253" y1="98" x2="253" y2="104" />
            <line x1="253" y1="112" x2="253" y2="118" />
            <line x1="243" y1="108" x2="249" y2="108" />
            <line x1="257" y1="108" x2="263" y2="108" />
          </g>

          {/* keyboard */}
          <line x1="160" y1="210" x2="212" y2="210" stroke="var(--color-steel)" strokeWidth="1.5" />

          {/* the modeller, seated */}
          <g stroke="var(--color-steel)" strokeWidth="1.5" fill="none">
            <circle cx="128" cy="126" r="10" />
            <path d="M128 136 L124 178" />
            <path d="M126 150 L168 206" />
            <path d="M124 178 L154 186 L154 252" />
            <line x1="154" y1="252" x2="172" y2="252" />
          </g>
          {/* chair */}
          <g stroke="var(--color-steel)" strokeWidth="1" opacity="0.8">
            <line x1="106" y1="184" x2="134" y2="184" />
            <path d="M106 184 L103 146" />
            <line x1="120" y1="184" x2="120" y2="238" />
            <line x1="104" y1="250" x2="136" y2="250" />
            <line x1="104" y1="250" x2="120" y2="238" />
            <line x1="136" y1="250" x2="120" y2="238" />
          </g>
        </Frame>
      );
    case 3:
      // QA/QC — three-stage check chain
      return (
        <Frame>
          <line x1="70" y1="150" x2="330" y2="150" stroke="var(--color-line-dark)" strokeWidth="1" />
          {[110, 200, 290].map((x, i) => (
            <g key={i}>
              <rect x={x - 28} y={122} width="56" height="56" stroke={i === 2 ? "#d52b1e" : "var(--color-cerulean)"} strokeWidth="1.5" fill="var(--color-ground)" />
              <path
                d={`M${x - 12} 150 l8 9 l16 -18`}
                stroke={i === 2 ? "#d52b1e" : "var(--color-cerulean)"}
                strokeWidth="1.5"
              />
              <line x1={x} y1="178" x2={x} y2="196" stroke="var(--color-steel)" strokeWidth="1" {...DOT_STROKE} />
            </g>
          ))}
          <line x1="138" y1="150" x2="172" y2="150" stroke="var(--color-cerulean)" strokeWidth="1.5" />
          <line x1="228" y1="150" x2="262" y2="150" stroke="var(--color-cerulean)" strokeWidth="1.5" />
        </Frame>
      );
    default:
      // Delivery — stacked file plates
      return (
        <Frame>
          {[
            { y: 70, label: ".RVT / .PLN" },
            { y: 124, label: ".IFC" },
            { y: 178, label: ".PDF / .DWG" },
          ].map((file, i) => (
            <g key={i}>
              <rect x="90" y={file.y} width="180" height="40" stroke="var(--color-cerulean)" strokeWidth="1.5" fill="var(--color-ground)" />
              <path d={`M270 ${file.y} l14 14 v26 h-14 z`} stroke="var(--color-cerulean)" strokeWidth="1.5" fill="var(--color-ground)" />
              <text
                x="106"
                y={file.y + 25}
                fill="var(--color-mist)"
                fontFamily="var(--font-mono)"
                fontSize="13"
              >
                {file.label}
              </text>
            </g>
          ))}
          <line x1="304" y1="90" x2="340" y2="90" stroke="var(--color-steel)" strokeWidth="1" {...DOT_STROKE} />
          <line x1="304" y1="144" x2="340" y2="144" stroke="var(--color-steel)" strokeWidth="1" {...DOT_STROKE} />
          <line x1="304" y1="198" x2="340" y2="198" stroke="var(--color-steel)" strokeWidth="1" {...DOT_STROKE} />
        </Frame>
      );
  }
}
