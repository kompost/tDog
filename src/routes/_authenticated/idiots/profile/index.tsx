import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/idiots/profile/')({
    component: StatsPage,
})

const members = [
    { name: 'Anders', attended: 18, total: 20 },
    { name: 'Mikkel', attended: 15, total: 20 },
    { name: 'Jonas', attended: 20, total: 20 },
    { name: 'Rasmus', attended: 12, total: 20 },
    { name: 'Frederik', attended: 17, total: 20 },
    { name: 'Søren', attended: 9, total: 20 },
]

const recentEvents = [
    { name: 'Friday Session', date: '14 Mar', attendees: 5 },
    { name: 'Sunday Run', date: '9 Mar', attendees: 6 },
    { name: 'Friday Session', date: '7 Mar', attendees: 4 },
    { name: 'Tournament', date: '1 Mar', attendees: 6 },
]

function StatsPage() {
    const totalEvents = 20
    const avgAttendance = Math.round(members.reduce((sum, m) => sum + m.attended, 0) / members.length)
    const topAttender = members.reduce((a, b) => (a.attended > b.attended ? a : b))

    return (
        <div className="relative space-y-6 overflow-y-auto">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                <span className="text-red-600 font-black text-5xl opacity-60 -rotate-[30deg] tracking-widest select-none">
                    Kommer snart
                </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{totalEvents}</p>
                    <p className="text-xs text-muted-foreground mt-1">Events</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{avgAttendance}</p>
                    <p className="text-xs text-muted-foreground mt-1">Avg. attendance</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{topAttender.attended}</p>
                    <p className="text-xs text-muted-foreground mt-1">{topAttender.name}'s streak</p>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-3">
                <h2 className="font-semibold">Attendance</h2>
                {members
                    .sort((a, b) => b.attended - a.attended)
                    .map((m) => {
                        const pct = Math.round((m.attended / m.total) * 100)
                        return (
                            <div key={m.name} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>{m.name}</span>
                                    <span className="text-muted-foreground">
                                        {m.attended}/{m.total}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        )
                    })}
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-3">
                <h2 className="font-semibold">Recent Events</h2>
                {recentEvents.map((e) => (
                    <div key={e.name + e.date} className="flex justify-between items-center text-sm">
                        <div>
                            <p className="font-medium">{e.name}</p>
                            <p className="text-xs text-muted-foreground">{e.date}</p>
                        </div>
                        <span className="text-muted-foreground">
                            {e.attendees} / {members.length}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
