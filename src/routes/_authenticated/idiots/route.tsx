import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { BarChart2, CalendarDays, MessageCircle } from 'lucide-react'

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
        <div
            style={{
                display: 'grid',
                gridTemplateRows: '1fr 80px',
                position: 'fixed',
                inset: 0,
                backgroundColor: '#595758',
            }}
        >
            <main
                className="max-w-4xl pt-[16px] px-[16px] mx-auto w-full"
                style={{ overflowY: 'auto', minHeight: 0, overscrollBehavior: 'none' }}
            >
                <Outlet />
            </main>

            <div className="flex items-center justify-center px-[16px]">
                <nav className="w-full rounded-2xl bg-background/80 backdrop-blur-md border shadow-lg">
                    <div className="flex items-center justify-around h-[64px]">
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
        </div>
    )
}
