import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useReducer, useState } from 'react'
import { prisma } from '@/db'

const DATES = ['17-20. september', '24-27. september', '1-4. oktober', 'Ingen af ovenstående']

const getResponses = createServerFn({ method: 'GET' }).handler(async () => {
    return prisma.tripPollResponse.findMany({ orderBy: { createdAt: 'asc' } })
})

const submitResponse = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => data as { name: string; dates: string[] })
    .handler(async ({ data }) => {
        const name = data.name.trim()
        if (!name || data.dates.length === 0) throw new Error('Bad Request')
        await prisma.tripPollResponse.create({ data: { name, nights: [3], dates: data.dates } })
    })

export const Route = createFileRoute('/_rejsen/rejsen')({
    head: () => ({
        meta: [
            { title: 'Rejsen Survey' },
            { property: 'og:title', content: 'Rejsen Survey' },
            { property: 'og:description', content: 'Stem på hvornår du kan' },
        ],
    }),
    loader: () => getResponses(),
    component: RouteComponent,
})

type State = {
    name: string
    dates: string[]
    submitted: boolean
    error: string | null
}

type Action =
    | { type: 'set_name'; value: string }
    | { type: 'toggle_date'; value: string }
    | { type: 'submitted' }
    | { type: 'error'; message: string }

function toggle<T>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'set_name':
            return { ...state, name: action.value }
        case 'toggle_date':
            return { ...state, dates: toggle(state.dates, action.value) }
        case 'submitted':
            return { ...state, submitted: true, error: null }
        case 'error':
            return { ...state, error: action.message }
    }
}

function RouteComponent() {
    const responses = Route.useLoaderData()
    const router = useRouter()
    const [state, dispatch] = useReducer(reducer, {
        name: '',
        dates: [],
        submitted: false,
        error: null,
    })
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            await submitResponse({ data: { name: state.name, dates: state.dates } })
            dispatch({ type: 'submitted' })
            router.invalidate()
        } catch {
            dispatch({ type: 'error', message: 'Noget gik galt, prøv igen.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center py-16 px-4">
            <div className="w-full max-w-lg">
                <h1 className="text-3xl font-bold mb-2">Rejsen 🗺</h1>
                <p className="text-neutral-400 mb-8">Stem på hvornår du kan</p>

                {state.submitted ? (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center">
                        <p className="text-lg font-medium">Tak for din stemme!</p>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col gap-6"
                    >
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-sm font-medium text-neutral-300">
                                Navn
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={state.name}
                                onChange={(e) => dispatch({ type: 'set_name', value: e.target.value })}
                                placeholder="Dit navn"
                                className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-neutral-500"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label htmlFor="days" className="text-sm font-medium text-neutral-300">
                                Hvilke weekender passer dig? (Torsdag - Søndag)
                            </label>
                            <div id="days" className="flex flex-col gap-2">
                                {DATES.map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => dispatch({ type: 'toggle_date', value: d })}
                                        className={`rounded-lg border px-4 py-2.5 text-sm font-medium text-left transition-colors ${
                                            state.dates.includes(d)
                                                ? 'border-white bg-white text-black'
                                                : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-500'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {state.error && <p className="text-sm text-red-400">{state.error}</p>}

                        <button
                            type="submit"
                            disabled={loading || !state.name || state.dates.length === 0}
                            className="rounded-lg bg-white text-black font-medium py-2 text-sm disabled:opacity-40 transition-opacity"
                        >
                            {loading ? 'Sender...' : 'Send svar'}
                        </button>
                    </form>
                )}

                {responses.length > 0 && (
                    <div className="mt-10">
                        <h2 className="text-lg font-semibold mb-4">Svar ({responses.length})</h2>
                        <div className="flex flex-col gap-3">
                            {responses.map((r) => (
                                <div
                                    key={r.id}
                                    className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
                                >
                                    <p className="font-medium">{r.name}</p>
                                    <p className="text-sm text-neutral-400">{r.dates.join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
