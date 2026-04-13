import { type Circuit, displayNum, formatR } from '@/lib/ohm-circuit'

interface Props {
    circuit: Circuit
}

// Layout constants
const W = 700
const H = 230
const Y_TOP = 65 // top wire y
const Y_BOT = 175 // bottom wire y
const X_BAT = 60 // battery x (left junction of circuit)
const X_RIGHT = 650 // right junction
const RES_W = 80
const RES_H = 30

export function CircuitSchematic({ circuit }: Props) {
    const { resistors, supplyVoltage } = circuit
    const n = resistors.length

    // Evenly distribute resistors across the top wire
    const segW = (X_RIGHT - X_BAT) / n
    const centers = resistors.map((_, i) => X_BAT + segW * (i + 0.5))

    const batCy = (Y_TOP + Y_BOT) / 2 // 120

    // Battery cell plate positions (2 cells)
    const p1Long = batCy - 22 // cell 1 positive
    const p1Short = batCy - 12 // cell 1 negative
    const p2Long = batCy - 2 // cell 2 positive
    const p2Short = batCy + 8 // cell 2 negative

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl" aria-label="Series circuit diagram">
            {/* ── Top wire segments around resistors ── */}
            <line x1={X_BAT} y1={Y_TOP} x2={centers[0] - RES_W / 2} y2={Y_TOP} stroke="currentColor" strokeWidth="2" />
            {centers.slice(0, -1).map((cx, i) => (
                <line
                    key={cx}
                    x1={cx + RES_W / 2}
                    y1={Y_TOP}
                    x2={centers[i + 1] - RES_W / 2}
                    y2={Y_TOP}
                    stroke="currentColor"
                    strokeWidth="2"
                />
            ))}
            <line
                x1={centers[n - 1] + RES_W / 2}
                y1={Y_TOP}
                x2={X_RIGHT}
                y2={Y_TOP}
                stroke="currentColor"
                strokeWidth="2"
            />

            {/* ── Right wire ── */}
            <line x1={X_RIGHT} y1={Y_TOP} x2={X_RIGHT} y2={Y_BOT} stroke="currentColor" strokeWidth="2" />

            {/* ── Bottom wire ── */}
            <line x1={X_BAT} y1={Y_BOT} x2={X_RIGHT} y2={Y_BOT} stroke="currentColor" strokeWidth="2" />

            {/* ── Battery wires (vertical segments flanking the symbol) ── */}
            <line x1={X_BAT} y1={Y_TOP} x2={X_BAT} y2={p1Long} stroke="currentColor" strokeWidth="2" />
            <line x1={X_BAT} y1={p1Short} x2={X_BAT} y2={p2Long} stroke="currentColor" strokeWidth="2" />
            <line x1={X_BAT} y1={p2Short} x2={X_BAT} y2={Y_BOT} stroke="currentColor" strokeWidth="2" />

            {/* ── Battery symbol: 2 cells (long = positive, short+thick = negative) ── */}
            {/* Cell 1 */}
            <line x1={X_BAT - 17} y1={p1Long} x2={X_BAT + 17} y2={p1Long} stroke="currentColor" strokeWidth="2.5" />
            <line x1={X_BAT - 10} y1={p1Short} x2={X_BAT + 10} y2={p1Short} stroke="currentColor" strokeWidth="4" />
            {/* Cell 2 */}
            <line x1={X_BAT - 17} y1={p2Long} x2={X_BAT + 17} y2={p2Long} stroke="currentColor" strokeWidth="2.5" />
            <line x1={X_BAT - 10} y1={p2Short} x2={X_BAT + 10} y2={p2Short} stroke="currentColor" strokeWidth="4" />

            {/* ── Battery terminal labels ── */}
            <text x={X_BAT} y={Y_TOP - 7} textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">
                +
            </text>
            <text x={X_BAT} y={Y_BOT + 16} textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">
                −
            </text>

            {/* ── Supply voltage label ── */}
            <text x={X_BAT - 24} y={batCy + 5} textAnchor="end" fontSize="13" fontWeight="600" fill="currentColor">
                {displayNum(supplyVoltage)}V
            </text>

            {/* ── Resistors ── */}
            {centers.map((cx, i) => (
                <g key={resistors[i].id}>
                    <rect
                        x={cx - RES_W / 2}
                        y={Y_TOP - RES_H / 2}
                        width={RES_W}
                        height={RES_H}
                        fill="var(--background)"
                        stroke="currentColor"
                        strokeWidth="2"
                        rx="3"
                    />
                    {/* Component label above */}
                    <text
                        x={cx}
                        y={Y_TOP - RES_H / 2 - 6}
                        textAnchor="middle"
                        fontSize="11"
                        fill="currentColor"
                        opacity="0.55"
                    >
                        R{i + 1}
                    </text>
                    {/* Resistance value inside box */}
                    <text x={cx} y={Y_TOP + 5} textAnchor="middle" fontSize="12" fontWeight="500" fill="currentColor">
                        {formatR(resistors[i].resistance)}
                    </text>
                </g>
            ))}
        </svg>
    )
}
