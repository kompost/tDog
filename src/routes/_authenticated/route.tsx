import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { CalendarDays, MessageCircle, User } from 'lucide-react'
import { getSession } from '@/lib/auth-server'

const checkAuth = createServerFn({ method: 'GET' }).handler(async ({ request }) => {
    const session = await getSession(request)
    if (!session) {
        throw redirect({
            to: '/sign-in',
        })
    }

    return session
})

const navItems = [
    { to: '/events', label: 'Events', icon: CalendarDays },
    { to: '/idiots', label: 'Chat', icon: MessageCircle },
    { to: '/profile', label: 'Profile', icon: User },
] as const

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async () => {
        const session = await checkAuth()
        return { session }
    },
    staleTime: Infinity,
    component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 pb-16">
                <Outlet />
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
