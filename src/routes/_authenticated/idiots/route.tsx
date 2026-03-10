import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { CalendarDays, MessageCircle, User } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/idiots')({
    component: IdiotsLayout,
})

const navItems = [
    { to: '/idiots/events', label: 'Events', icon: CalendarDays },
    { to: '/idiots/chat', label: 'Chat', icon: MessageCircle },
    { to: '/idiots/profile', label: 'Profile', icon: User },
] as const

function IdiotsLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 pb-16">
                <div className="mx-auto w-full max-w-[900px] px-4">
                    <Outlet />
                </div>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
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
