import { createFileRoute } from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'

import { CircuitSchematic } from '@/components/circuit-schematic'
import { ParallelSchematic } from '@/components/parallel-schematic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    type CellCol,
    type CellKey,
    checkAnswer,
    displayNum,
    generateParallelPuzzle,
    generatePuzzle,
    getCellValue,
    type SolveResult,
    solveFromInputs,
    solveParallelFromInputs,
} from '@/lib/ohm-circuit'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/ohm')({
    component: OhmPage,
})

const COLS: { key: CellCol; label: string; unit: string }[] = [
    { key: 'v', label: 'Voltage', unit: 'V' },
    { key: 'i', label: 'Current', unit: 'A' },
    { key: 'r', label: 'Resistance', unit: 'Ω' },
    { key: 'p', label: 'Power', unit: 'W' },
]

type Mode = 'practice' | 'calculator'
type CircuitType = 'series' | 'parallel'

// ── Page ───────────────────────────────────────────────────────────────────

function OhmPage() {
    const [mode, setMode] = useState<Mode>('practice')
    const [circuitType, setCircuitType] = useState<CircuitType>('series')

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Ohm's Law</h1>
                </div>

                {/* Controls row */}
                <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Circuit
                        </span>
                        <SegmentControl
                            options={['series', 'parallel'] as CircuitType[]}
                            value={circuitType}
                            onChange={(t) => setCircuitType(t)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mode</span>
                        <SegmentControl
                            options={['practice', 'calculator'] as Mode[]}
                            value={mode}
                            onChange={(m) => setMode(m)}
                        />
                    </div>
                </div>

                {mode === 'practice' ? (
                    <PracticeSection key={circuitType} circuitType={circuitType} />
                ) : (
                    <CalculatorSection key={circuitType} circuitType={circuitType} />
                )}
            </div>
        </div>
    )
}

// ── Practice mode ──────────────────────────────────────────────────────────

const SERIES_FORMULAS = ['V = I × R', 'P = V × I', 'R_total = R₁ + R₂ + ...', 'I same everywhere']
const PARALLEL_FORMULAS = [
    'V₁ = V₂ = ... = Vs',
    'I = V / R (per branch)',
    'I_total = I₁ + I₂ + ...',
    '1/R_total = 1/R₁ + 1/R₂ + ...',
]

function PracticeSection({ circuitType }: { circuitType: CircuitType }) {
    const gen = circuitType === 'series' ? generatePuzzle : generateParallelPuzzle
    const [puzzle, setPuzzle] = useState(gen)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)

    const { circuit, hidden } = puzzle

    function newPuzzle() {
        setPuzzle(gen())
        setAnswers({})
        setSubmitted(false)
    }

    const allCorrect =
        submitted && [...hidden].every((key) => checkAnswer(answers[key] ?? '', getCellValue(circuit, key)))

    const rows = [
        ...circuit.resistors.map((_, i) => ({ label: `R${i + 1}`, rowKey: `r${i}` })),
        { label: 'Total', rowKey: 'total' },
    ]

    const formulas = circuitType === 'series' ? SERIES_FORMULAS : PARALLEL_FORMULAS

    return (
        <>
            <p className="text-muted-foreground text-sm mb-6">
                {circuitType === 'series'
                    ? 'Calculate the missing values. Known values are shown on the schematic and greyed out in the table.'
                    : 'Calculate the missing values. Remember: in a parallel circuit, voltage is the same across all branches.'}
            </p>

            {/* Schematic */}
            <div className="flex justify-center mb-6">
                {circuitType === 'series' ? (
                    <CircuitSchematic circuit={circuit} />
                ) : (
                    <ParallelSchematic circuit={circuit} />
                )}
            </div>

            {/* Reference formulas */}
            <div className="flex flex-wrap gap-4 mb-6 text-xs text-muted-foreground font-mono">
                {formulas.map((f) => (
                    <span key={f}>{f}</span>
                ))}
            </div>

            <OhmTable
                rows={rows}
                renderCell={(rowKey, col) => {
                    const cellKey = `${rowKey}-${col}` as CellKey
                    const isHidden = hidden.has(cellKey)
                    const correct = getCellValue(circuit, cellKey)

                    if (!isHidden) {
                        return (
                            <td key={col} className="px-3 py-2 text-center">
                                <span className="font-mono text-muted-foreground">{displayNum(correct)}</span>
                            </td>
                        )
                    }

                    const result = submitted ? checkAnswer(answers[cellKey] ?? '', correct) : null
                    return (
                        <td key={col} className="px-3 py-2 text-center">
                            {submitted && result === false && (
                                <div className="text-xs text-red-400 mb-1 font-mono">{displayNum(correct)}</div>
                            )}
                            <Input
                                type="number"
                                step="any"
                                value={answers[cellKey] ?? ''}
                                onChange={(e) => setAnswers((prev) => ({ ...prev, [cellKey]: e.target.value }))}
                                disabled={submitted && result === true}
                                placeholder="?"
                                className={cn(
                                    'w-28 text-center font-mono h-8 text-sm',
                                    result === true && 'border-green-500 focus-visible:ring-green-500/50',
                                    result === false && 'border-red-500 focus-visible:ring-red-500/50',
                                )}
                            />
                        </td>
                    )
                }}
            />

            {allCorrect && <p className="text-green-500 font-medium text-sm mb-4">All correct! Well done.</p>}

            <div className="flex gap-3">
                {!submitted ? (
                    <Button onClick={() => setSubmitted(true)}>Check Answers</Button>
                ) : (
                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                        Try Again
                    </Button>
                )}
                <Button variant="outline" onClick={newPuzzle}>
                    New Puzzle
                </Button>
            </div>
        </>
    )
}

// ── Calculator mode ────────────────────────────────────────────────────────

function CalculatorSection({ circuitType }: { circuitType: CircuitType }) {
    const [numR, setNumR] = useState(2)
    const [inputs, setInputs] = useState<Record<string, string>>({})
    const [result, setResult] = useState<SolveResult | null>(null)

    const solve = circuitType === 'series' ? solveFromInputs : solveParallelFromInputs

    function calculate() {
        setResult(solve(inputs, numR))
    }

    function clear() {
        setInputs({})
        setResult(null)
    }

    function changeNumR(n: number) {
        setNumR(n)
        setInputs({})
        setResult(null)
    }

    const rows = [
        ...Array.from({ length: numR }, (_, i) => ({ label: `R${i + 1}`, rowKey: `r${i}` })),
        { label: 'Total', rowKey: 'total' },
    ]

    return (
        <>
            <p className="text-muted-foreground text-sm mb-6">
                Enter any known values and click Calculate. The solver will derive the rest using{' '}
                {circuitType === 'series' ? 'series' : 'parallel'} circuit rules.
            </p>

            {/* Resistor count */}
            <div className="flex items-center gap-3 mb-6">
                <span className="text-sm text-muted-foreground">Resistors:</span>
                <SegmentControl options={[2, 3, 4]} value={numR} onChange={changeNumR} />
            </div>

            <OhmTable
                rows={rows}
                renderCell={(rowKey, col) => {
                    const cellKey = `${rowKey}-${col}`
                    const userVal = inputs[cellKey]
                    const calcVal = result?.values[cellKey]
                    const isUserProvided = userVal !== undefined && userVal !== ''
                    const isComputed = calcVal !== undefined && !isUserProvided

                    if (isComputed) {
                        return (
                            <td key={col} className="px-3 py-2 text-center">
                                <span className="font-mono text-sm px-2 py-1 rounded bg-muted/50 text-muted-foreground">
                                    {displayNum(calcVal)}
                                </span>
                            </td>
                        )
                    }

                    return (
                        <td key={col} className="px-3 py-2 text-center">
                            <Input
                                type="number"
                                step="any"
                                value={userVal ?? ''}
                                onChange={(e) => {
                                    setInputs((prev) => ({ ...prev, [cellKey]: e.target.value }))
                                    if (result) setResult(null)
                                }}
                                placeholder="?"
                                className="w-28 text-center font-mono h-8 text-sm"
                            />
                        </td>
                    )
                }}
            />

            {result?.error && <p className="text-amber-500 text-sm mb-4">{result.error}</p>}

            <div className="flex gap-3">
                <Button onClick={calculate}>Calculate</Button>
                <Button variant="outline" onClick={clear}>
                    Clear
                </Button>
            </div>
        </>
    )
}

// ── Shared components ──────────────────────────────────────────────────────

interface OhmTableProps {
    rows: { label: string; rowKey: string }[]
    renderCell: (rowKey: string, col: CellCol) => ReactNode
}

function OhmTable({ rows, renderCell }: OhmTableProps) {
    return (
        <div className="overflow-x-auto mb-6 border border-border rounded-lg">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/40">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground w-20" />
                        {COLS.map((col) => (
                            <th key={col.key} className="px-3 py-3 text-center font-medium text-muted-foreground">
                                {col.label}
                                <br />
                                <span className="text-xs font-normal opacity-70">({col.unit})</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ label, rowKey }) => (
                        <tr
                            key={rowKey}
                            className={cn(
                                'border-b border-border/50 last:border-0',
                                rowKey === 'total' && 'bg-muted/20 font-medium',
                            )}
                        >
                            <td className="px-4 py-2 font-medium text-muted-foreground">{label}</td>
                            {COLS.map((col) => renderCell(rowKey, col.key))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

interface SegmentControlProps<T extends string | number> {
    options: T[]
    value: T
    onChange: (value: T) => void
}

function SegmentControl<T extends string | number>({ options, value, onChange }: SegmentControlProps<T>) {
    return (
        <div className="inline-flex rounded-md border border-border overflow-hidden">
            {options.map((opt, i) => (
                <button
                    key={String(opt)}
                    type="button"
                    onClick={() => onChange(opt)}
                    className={cn(
                        'px-4 py-1.5 text-sm font-medium capitalize transition-colors',
                        i !== 0 && 'border-l border-border',
                        value === opt
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background hover:bg-muted text-muted-foreground',
                    )}
                >
                    {String(opt)}
                </button>
            ))}
        </div>
    )
}
