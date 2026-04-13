export interface Resistor {
    id: number
    resistance: number // Ω
    voltage: number // V
    current: number // A
    power: number // W
}

export interface Circuit {
    supplyVoltage: number
    current: number
    totalResistance: number
    totalPower: number
    resistors: Resistor[]
}

export type CellCol = 'v' | 'i' | 'r' | 'p'
export type CellKey = `r${number}-${CellCol}` | `total-${CellCol}`

export interface Puzzle {
    circuit: Circuit
    hidden: Set<CellKey>
}

function round(n: number, d = 6): number {
    return Math.round(n * 10 ** d) / 10 ** d
}

function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

const SUPPLY_VOLTAGES = [3, 5, 6, 9, 12, 15, 18, 24] as const

// E12 resistor series
const RESISTOR_VALUES = [
    100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820, 1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700,
    5600, 6800, 8200, 10000,
] as const

export function generatePuzzle(): Puzzle {
    const n = 2 + Math.floor(Math.random() * 2) // 2 or 3 resistors
    const supplyVoltage = pick(SUPPLY_VOLTAGES)
    const rs = Array.from({ length: n }, () => pick(RESISTOR_VALUES))

    const totalResistance = rs.reduce((a, b) => a + b, 0)
    const current = round(supplyVoltage / totalResistance)
    const totalPower = round(supplyVoltage * current)

    const resistors: Resistor[] = rs.map((r, i) => ({
        id: i,
        resistance: r,
        voltage: round(current * r),
        current,
        power: round(current * r * current),
    }))

    const circuit: Circuit = { supplyVoltage, current, totalResistance, totalPower, resistors }

    // Known: supply voltage (total-v) and all resistor resistances (r*-r)
    // Hidden: everything else
    const hidden = new Set<CellKey>([
        'total-r',
        'total-i',
        'total-p',
        ...resistors.flatMap((r): CellKey[] => [`r${r.id}-v`, `r${r.id}-i`, `r${r.id}-p`]),
    ])

    return { circuit, hidden }
}

export function getCellValue(circuit: Circuit, key: CellKey): number {
    if (key === 'total-v') return circuit.supplyVoltage
    if (key === 'total-i') return circuit.current
    if (key === 'total-r') return circuit.totalResistance
    if (key === 'total-p') return circuit.totalPower

    const m = key.match(/^r(\d+)-([virp])$/)
    if (!m) throw new Error(`Invalid key: ${key}`)
    const r = circuit.resistors[parseInt(m[1], 10)]
    if (m[2] === 'v') return r.voltage
    if (m[2] === 'i') return r.current
    if (m[2] === 'r') return r.resistance
    return r.power
}

export function checkAnswer(input: string, correct: number): boolean {
    const n = parseFloat(input.replace(',', '.'))
    if (Number.isNaN(n)) return false
    const tol = Math.max(Math.abs(correct) * 0.01, 1e-7)
    return Math.abs(n - correct) <= tol
}

export function displayNum(value: number): string {
    if (Number.isInteger(value)) return String(value)
    return parseFloat(value.toPrecision(6)).toString()
}

export function formatR(ohms: number): string {
    if (ohms >= 1000) {
        const k = ohms / 1000
        return `${Number.isInteger(k) ? k : k.toFixed(1)}k\u03A9`
    }
    return `${ohms}\u03A9`
}

// ── Calculator solver ──────────────────────────────────────────────────────

export interface SolveResult {
    values: Partial<Record<string, number>>
    error?: string
}

/**
 * Given a partial set of user inputs for a series circuit with `numResistors`
 * resistors, derive as many missing values as possible.
 *
 * Keys follow the same CellKey convention: 'total-v', 'r0-r', 'r1-i', etc.
 */
export function solveFromInputs(rawInputs: Record<string, string>, numResistors: number): SolveResult {
    // Parse valid non-negative numbers from raw string inputs
    const known: Record<string, number> = {}
    for (const [key, val] of Object.entries(rawInputs)) {
        if (!val.trim()) continue
        const n = parseFloat(val.replace(',', '.'))
        if (!Number.isNaN(n) && n >= 0) known[key] = n
    }

    const result: Record<string, number> = { ...known }

    // Individual resistances (null = not provided)
    const indivR = Array.from({ length: numResistors }, (_, i) => known[`r${i}-r`] ?? null)
    const allRKnown = indivR.every((r) => r !== null)

    // ── Step 1: total resistance ──
    let totalR: number | null = known['total-r'] ?? null
    if (totalR === null && allRKnown) {
        totalR = (indivR as number[]).reduce((a, b) => a + b, 0)
        result['total-r'] = totalR
    }

    // ── Step 2: current ──
    let I: number | null = known['total-i'] ?? null

    if (I === null) {
        for (let i = 0; i < numResistors; i++) {
            if (known[`r${i}-i`] != null) {
                I = known[`r${i}-i`]
                break
            }
        }
    }
    if (I === null && known['total-v'] != null && totalR != null && totalR > 0) {
        I = known['total-v'] / totalR
    }
    if (I === null && known['total-p'] != null && known['total-v'] != null && known['total-v'] > 0) {
        I = known['total-p'] / known['total-v']
    }
    if (I === null) {
        for (let i = 0; i < numResistors; i++) {
            const rV = known[`r${i}-v`]
            const rR = known[`r${i}-r`]
            if (rV != null && rR != null && rR > 0) {
                I = rV / rR
                break
            }
        }
    }

    if (I === null) {
        return {
            values: result,
            error: 'Not enough information to solve. Try providing the supply voltage and resistor values, or the current.',
        }
    }

    // ── Step 3: fill totals ──
    result['total-i'] = round(I)

    if (totalR !== null) {
        const Vt = round(I * totalR)
        result['total-v'] = Vt
        result['total-p'] = round(I * Vt)
    } else if (known['total-v'] != null) {
        const Vt = known['total-v']
        result['total-v'] = Vt
        result['total-r'] = round(Vt / I)
        result['total-p'] = round(I * Vt)
    }

    // ── Step 4: fill per-resistor ──
    for (let i = 0; i < numResistors; i++) {
        result[`r${i}-i`] = round(I)
        const r = indivR[i]
        if (r !== null) {
            const v = round(I * r)
            result[`r${i}-v`] = v
            result[`r${i}-p`] = round(I * v)
        }
    }

    return { values: result }
}

// ── Parallel circuit ───────────────────────────────────────────────────────

export function generateParallelPuzzle(): Puzzle {
    const n = 2 + Math.floor(Math.random() * 2) // 2 or 3 resistors
    const supplyVoltage = pick(SUPPLY_VOLTAGES)
    const rs = Array.from({ length: n }, () => pick(RESISTOR_VALUES))

    const conductance = rs.reduce((sum, r) => sum + 1 / r, 0)
    const totalResistance = round(1 / conductance)
    const totalCurrent = round(supplyVoltage * conductance)
    const totalPower = round(supplyVoltage * totalCurrent)

    const resistors: Resistor[] = rs.map((r, i) => {
        const iR = round(supplyVoltage / r)
        return { id: i, resistance: r, voltage: supplyVoltage, current: iR, power: round(supplyVoltage * iR) }
    })

    const circuit: Circuit = { supplyVoltage, current: totalCurrent, totalResistance, totalPower, resistors }

    // Known: supply voltage (total-v) and all resistor resistances (r*-r)
    // Hidden: totals + per-branch V, I, P (students must recognise V_branch = V_supply)
    const hidden = new Set<CellKey>([
        'total-r',
        'total-i',
        'total-p',
        ...resistors.flatMap((r): CellKey[] => [`r${r.id}-v`, `r${r.id}-i`, `r${r.id}-p`]),
    ])

    return { circuit, hidden }
}

export function solveParallelFromInputs(rawInputs: Record<string, string>, numResistors: number): SolveResult {
    const known: Record<string, number> = {}
    for (const [key, val] of Object.entries(rawInputs)) {
        if (!val.trim()) continue
        const n = parseFloat(val.replace(',', '.'))
        if (!Number.isNaN(n) && n >= 0) known[key] = n
    }

    const result: Record<string, number> = { ...known }

    // ── Step 1: determine supply voltage (same across all branches) ──
    let V: number | null = known['total-v'] ?? null
    if (V === null) {
        for (let i = 0; i < numResistors; i++) {
            if (known[`r${i}-v`] != null) {
                V = known[`r${i}-v`]
                break
            }
        }
    }
    if (V === null && known['total-p'] != null && known['total-i'] != null && known['total-i'] > 0) {
        V = known['total-p'] / known['total-i']
    }
    if (V === null && known['total-i'] != null && known['total-r'] != null) {
        V = known['total-i'] * known['total-r']
    }

    if (V === null) {
        return {
            values: result,
            error: 'Not enough information. Provide the supply voltage and resistor values.',
        }
    }

    result['total-v'] = V
    for (let i = 0; i < numResistors; i++) result[`r${i}-v`] = V

    const indivR = Array.from({ length: numResistors }, (_, i) => known[`r${i}-r`] ?? null)

    // ── Step 2: per-branch currents and powers ──
    const branchI: (number | null)[] = []
    for (let i = 0; i < numResistors; i++) {
        const r = indivR[i]
        let iR: number | null = null
        if (r !== null && r > 0) iR = round(V / r)
        else if (known[`r${i}-i`] != null) iR = known[`r${i}-i`]
        else if (known[`r${i}-p`] != null && V > 0) iR = round(known[`r${i}-p`] / V)

        branchI.push(iR)
        if (r !== null) result[`r${i}-r`] = r
        if (iR !== null) {
            result[`r${i}-i`] = iR
            result[`r${i}-p`] = round(V * iR)
        }
    }

    // ── Step 3: totals ──
    const allBranchI = branchI.every((x) => x !== null)
    if (allBranchI) {
        const totalI = round((branchI as number[]).reduce((a, b) => a + b, 0))
        result['total-i'] = totalI
        if (V > 0) result['total-r'] = round(V / totalI)
        result['total-p'] = round(V * totalI)
    } else if (indivR.every((r) => r !== null)) {
        const conductance = (indivR as number[]).reduce((s, r) => s + 1 / r, 0)
        const totalI = round(V * conductance)
        result['total-i'] = totalI
        result['total-r'] = round(1 / conductance)
        result['total-p'] = round(V * totalI)
    }

    return { values: result }
}
