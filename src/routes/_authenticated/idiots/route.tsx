import { createFileRoute, Link, type LinkProps, Outlet, useMatches } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { BarChart2, CalendarDays, MessageCircle, Settings } from 'lucide-react'
import { useState } from 'react'

type Actions = 'events' | 'chat' | 'stats'

declare module '@tanstack/react-router' {
    interface StaticDataRouteOption {
        title?: string
        headerAction?: Actions
        footerAction?: Actions
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
    staticData: { title: 'Home' },
    component: IdiotsLayout,
})

function HeaderAction({ action }: { action: Actions }) {
    return (
        <button type="button" className="hover:text-white transition-colors">
            <Settings className="size-5" />
        </button>
    )
}

function FooterAction({ action }: { action: Actions }) {
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
            <div className="flex gap-2 p-2 h-full">
                <input
                    className="flex-1 h-full border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
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
                    className="h-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
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
    const idiotsMatches = matches.filter((m) => m.staticData?.title)
    const current = [...idiotsMatches].reverse()[0]?.staticData
    const headerAction = current?.headerAction
    const footerAction = current?.footerAction

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateRows: '60px 1fr',
                position: 'fixed',
                inset: 0,
            }}
        >
            <header className="flex items-center justify-between px-[16px] bg-black">
                <h1 className="text-lg font-semibold text-white">
                    {idiotsMatches.map((m, i) => (
                        <span key={m.id}>
                            {i > 0 && <span className="mx-2 opacity-60">›</span>}
                            {i < idiotsMatches.length - 1 ? (
                                <Link
                                    to={m.pathname as LinkProps['to']}
                                    className="opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    {m.staticData.title}
                                </Link>
                            ) : (
                                m.staticData.title
                            )}
                        </span>
                    ))}
                </h1>
                {headerAction && <HeaderAction action={headerAction} />}
            </header>

            <main
                className="max-w-4xl p-2 mx-auto w-full"
                style={{ overflowY: 'auto', minHeight: 0, overscrollBehavior: 'none', paddingBottom: '96px' }}
            >
                <Outlet />
            </main>

            <footer className="absolute bottom-0 left-0 right-0 h-[80px] flex items-center justify-center px-4 pb-4">
                <div className="w-full h-full rounded-2xl bg-background/80 backdrop-blur-md border shadow-lg overflow-hidden">
                    {footerAction ? (
                        <FooterAction action={footerAction} />
                    ) : (
                        <div className="flex items-center justify-around h-full">
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
                </div>
            </footer>
        </div>
    )
}
