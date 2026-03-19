import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { CalendarDays, MessageCircle, BarChart2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/idiots')({
    component: IdiotsLayout,
})

const navItems = [
    { to: '/idiots/events', label: 'Events', icon: CalendarDays },
    { to: '/idiots/chat', label: 'Chat', icon: MessageCircle },
    { to: '/idiots/profile', label: 'Stats', icon: BarChart2 },
] as const

function IdiotsLayout() {
    return (
        <div className="flex flex-col h-[100svh]">
            <main className="flex-1 min-h-0 overflow-y-auto pb-24">
                <div className="mx-auto w-full max-w-[900px] p-4">
                    <Outlet />
                </div>
            </main>

            <nav className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-background/80 backdrop-blur-md border shadow-lg">
                <div className="flex items-center justify-around h-16">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
                        >
                            <Icon className="size-5" />
                            <span className="text-xs">{label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}
