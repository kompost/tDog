import { type Circuit, displayNum, formatR } from '@/lib/ohm-circuit'

interface Props {
    circuit: Circuit
}

const W = 700
const H = 230
const Y_TOP = 65
const Y_BOT = 175
const X_BAT = 60
const BOX_W = 50
const BOX_H = 44
const Y_MID = (Y_TOP + Y_BOT) / 2 // 120

export function ParallelSchematic({ circuit }: Props) {
    const { resistors, supplyVoltage } = circuit
    const n = resistors.length

    // Distribute branches evenly between x=180 and x=620
    const segW = (620 - 180) / n
    const centers = resistors.map((_, i) => 180 + segW * (i + 0.5))

    // Battery symbol positions (same convention as series schematic)
    const batCy = Y_MID
    const p1Long = batCy - 22
    const p1Short = batCy - 12
    const p2Long = batCy - 2
    const p2Short = batCy + 8

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl" aria-label="Parallel circuit diagram">
            {/* ── Top and bottom rails ── */}
            <line x1={X_BAT} y1={Y_TOP} x2={640} y2={Y_TOP} stroke="currentColor" strokeWidth="2" />
            <line x1={X_BAT} y1={Y_BOT} x2={640} y2={Y_BOT} stroke="currentColor" strokeWidth="2" />

            {/* ── Battery wires ── */}
            <line x1={X_BAT} y1={Y_TOP} x2={X_BAT} y2={p1Long} stroke="currentColor" strokeWidth="2" />
            <line x1={X_BAT} y1={p1Short} x2={X_BAT} y2={p2Long} stroke="currentColor" strokeWidth="2" />
            <line x1={X_BAT} y1={p2Short} x2={X_BAT} y2={Y_BOT} stroke="currentColor" strokeWidth="2" />

            {/* ── Battery symbol: 2 cells ── */}
            <line x1={X_BAT - 17} y1={p1Long} x2={X_BAT + 17} y2={p1Long} stroke="currentColor" strokeWidth="2.5" />
            <line x1={X_BAT - 10} y1={p1Short} x2={X_BAT + 10} y2={p1Short} stroke="currentColor" strokeWidth="4" />
            <line x1={X_BAT - 17} y1={p2Long} x2={X_BAT + 17} y2={p2Long} stroke="currentColor" strokeWidth="2.5" />
            <line x1={X_BAT - 10} y1={p2Short} x2={X_BAT + 10} y2={p2Short} stroke="currentColor" strokeWidth="4" />

            {/* ── Battery labels ── */}
            <text x={X_BAT} y={Y_TOP - 7} textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">
                +
            </text>
            <text x={X_BAT} y={Y_BOT + 16} textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">
                −
            </text>
            <text x={X_BAT - 24} y={batCy + 5} textAnchor="end" fontSize="13" fontWeight="600" fill="currentColor">
                {displayNum(supplyVoltage)}V
            </text>

            {/* ── Resistor branches ── */}
            {centers.map((cx, i) => (
                <g key={resistors[i].id}>
                    {/* Branch wires */}
                    <line x1={cx} y1={Y_TOP} x2={cx} y2={Y_MID - BOX_H / 2} stroke="currentColor" strokeWidth="2" />
                    <line x1={cx} y1={Y_MID + BOX_H / 2} x2={cx} y2={Y_BOT} stroke="currentColor" strokeWidth="2" />

                    {/* Junction dots where branch meets rails */}
                    <circle cx={cx} cy={Y_TOP} r="3.5" fill="currentColor" />
                    <circle cx={cx} cy={Y_BOT} r="3.5" fill="currentColor" />

                    {/* Resistor box */}
                    <rect
                        x={cx - BOX_W / 2}
                        y={Y_MID - BOX_H / 2}
                        width={BOX_W}
                        height={BOX_H}
                        fill="var(--background)"
                        stroke="currentColor"
                        strokeWidth="2"
                        rx="3"
                    />

                    {/* R label — above top rail */}
                    <text x={cx} y={Y_TOP - 8} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.55">
                        R{i + 1}
                    </text>

                    {/* Resistance value inside box */}
                    <text x={cx} y={Y_MID + 5} textAnchor="middle" fontSize="11" fontWeight="500" fill="currentColor">
                        {formatR(resistors[i].resistance)}
                    </text>
                </g>
            ))}
        </svg>
    )
}
