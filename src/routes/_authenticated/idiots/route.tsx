import { createFileRoute, Link, type LinkProps, Outlet, useMatches } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { BarChart2, CalendarDays, MessageCircle, Settings } from 'lucide-react'
import { useState } from 'react'

type HeaderActions = 'events' | 'chat' | 'stats'
type NavActions = 'events' | 'chat' | 'stats'

declare module '@tanstack/react-router' {
    interface StaticDataRouteOption {
        title?: string
        headerAction?: HeaderActions
        navAction?: NavActions
    }
}

type NavItem = {
    to: LinkProps['to']
    label: string
    icon: LucideIcon
}

const navItems: NavItem[] = [
    { to: '/idiots/events', label: 'Events', icon: CalendarDays },
    { to: '/idiots/chat', label: 'Chat', icon: MessageCircle },
    { to: '/idiots/profile', label: 'Stats', icon: BarChart2 },
]

export const Route = createFileRoute('/_authenticated/idiots')({
    component: IdiotsLayout,
})

function HeaderAction({ action }: { action: HeaderActions }) {
    return (
        <button type="button" className="hover:text-white transition-colors">
            <Settings className="size-5" />
        </button>
    )
}

function NavAction({ action }: { action: NavActions }) {
    const [input, setInput] = useState('')

    async function send() {
        if (!input.trim()) return
        const text = input.trim()
        setInput('')
        await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        })
    }

    if (action === 'chat')
        return (
            <div className="flex gap-2" style={{ padding: '10px 12px' }}>
                <input
                    className="flex-1 border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    style={{ borderRadius: '10px' }}
                    placeholder="Message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') send()
                    }}
                />
                <button
                    type="button"
                    onClick={send}
                    className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
                    style={{ borderRadius: '10px' }}
                >
                    Send
                </button>
            </div>
        )
    if (action === 'events') return <div className="w-full h-[64px] flex items-center px-4">Events nav placeholder</div>
    if (action === 'stats') return <div className="w-full h-[64px] flex items-center px-4">Stats nav placeholder</div>
}

function IdiotsLayout() {
    const matches = useMatches()
    const current = [...matches].reverse().find((m) => m.staticData?.title)?.staticData
    const title = current?.title
    const headerAction = current?.headerAction
    const navAction = current?.navAction

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateRows: '60px 1fr 80px',
                position: 'fixed',
                inset: 0,
            }}
        >
            <header className="flex items-center justify-between px-[16px] bg-black">
                <h1 className="text-lg font-semibold text-white">{title}</h1>
                {headerAction && <HeaderAction action={headerAction} />}
            </header>

            <main
                className="max-w-4xl p-4 mx-auto w-full"
                style={{ overflowY: 'auto', minHeight: 0, overscrollBehavior: 'none' }}
            >
                <Outlet />
            </main>

            <div className="flex items-center justify-center px-[16px]">
                <nav className="w-full rounded-2xl bg-background/80 backdrop-blur-md border shadow-lg">
                    {navAction ? (
                        <NavAction action={navAction} />
                    ) : (
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
                    )}
                </nav>
            </div>
        </div>
    )
}
