import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { prisma } from '@/db'
import { Role } from '@/generated/prisma/enums'
import { getSession } from '@/lib/auth-server'

const getAdminData = createServerFn({ method: 'GET' }).handler(async ({ request }) => {
    const session = await getSession(request)
    if (!session || session.user.role !== Role.ADMIN) throw redirect({ to: '/' })

    const allowed = await prisma.allowedUser.findMany({ orderBy: { email: 'asc' } })
    return { allowed }
})

const addAllowedUser = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => data as { email: string })
    .handler(async ({ request, data }) => {
        const session = await getSession(request)
        if (!session || session.user.role !== Role.ADMIN) throw new Error('Forbidden')

        const email = data.email.trim().toLowerCase()
        await prisma.allowedUser.upsert({
            where: { email },
            update: {},
            create: { email },
        })
    })

const removeAllowedUser = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => data as { email: string })
    .handler(async ({ request, data }) => {
        const session = await getSession(request)
        if (!session || session.user.role !== Role.ADMIN) throw new Error('Forbidden')

        await prisma.allowedUser.delete({ where: { email: data.email } })
    })

export const Route = createFileRoute('/_authenticated/admin')({
    loader: () => getAdminData(),
    component: AdminPage,
})

function AdminPage() {
    const { allowed } = Route.useLoaderData()
    const router = useRouter()
    const [input, setInput] = useState('')
    const [error, setError] = useState('')

    async function handleAdd() {
        const email = input.trim().toLowerCase()
        if (!email) return
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Invalid email')
            return
        }
        setError('')
        await addAllowedUser({ data: { email } })
        setInput('')
        router.invalidate()
    }

    async function handleRemove(email: string) {
        await removeAllowedUser({ data: { email } })
        router.invalidate()
    }

    return (
        <div className="max-w-md mx-auto p-6 space-y-6">
            <h1 className="text-xl font-semibold">Whitelist</h1>

            <div className="flex gap-2">
                <input
                    className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="email@example.com"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdd()
                    }}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-lg"
                >
                    Add
                </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}

            <ul className="space-y-2">
                {allowed.map((u) => (
                    <li key={u.email} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                        <span>{u.email}</span>
                        <button
                            type="button"
                            onClick={() => handleRemove(u.email)}
                            className="text-muted-foreground hover:text-destructive transition-colors text-xs"
                        >
                            Remove
                        </button>
                    </li>
                ))}
                {allowed.length === 0 && <p className="text-sm text-muted-foreground">No emails whitelisted yet.</p>}
            </ul>
        </div>
    )
}
