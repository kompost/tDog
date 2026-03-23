import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/db'
import { getSession } from '@/lib/auth-server'
import { broadcast } from '@/server/chat'

export const Route = createFileRoute('/api/chat/send')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const session = await getSession(request)
                if (!session) return new Response('Unauthorized', { status: 401 })

                const body = (await request.json().catch((_) => null)) as { text?: string } | null
                const text = typeof body?.text === 'string' ? body.text.trim() : ''
                if (!text) return new Response('Bad Request', { status: 400 })

                const msg = await prisma.message.create({
                    data: { text, userId: session.user.id },
                    select: {
                        id: true,
                        text: true,
                        userId: true,
                        user: { select: { name: true } },
                        createdAt: true,
                    },
                })

                broadcast({
                    id: msg.id,
                    text: msg.text,
                    userId: msg.userId,
                    name: msg.user.name,
                    at: msg.createdAt.getTime(),
                })

                return new Response(null, { status: 204 })
            },
        },
    },
})
