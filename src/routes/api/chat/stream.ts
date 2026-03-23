import { createFileRoute } from '@tanstack/react-router'
import { withAuth } from '@/lib/auth-server'
import { addClient, getHistory, removeClient } from '@/server/chat'

export const Route = createFileRoute('/api/chat/stream')({
    server: {
        handlers: {
            GET: withAuth(async (request) => {
                const encoder = new TextEncoder()
                const stream = new ReadableStream({
                    async start(controller) {
                        const history = await getHistory()
                        controller.enqueue(encoder.encode(`event: history\ndata: ${JSON.stringify(history)}\n\n`))

                        addClient(controller)

                        const keepalive = setInterval(() => {
                            try {
                                controller.enqueue(encoder.encode(': keepalive\n\n'))
                            } catch {
                                clearInterval(keepalive)
                            }
                        }, 30000)

                        request.signal.addEventListener('abort', () => {
                            clearInterval(keepalive)
                            removeClient(controller)
                        })
                    },
                })

                return new Response(stream, {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        Connection: 'keep-alive',
                    },
                })
            }),
        },
    },
})
