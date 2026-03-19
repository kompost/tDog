import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

export const Route = createFileRoute('/_authenticated/idiots/chat/')({
    component: ChatPage,
})

type Message = { id: string; userId: string; name: string; text: string; at: number }

function ChatPage() {
    const { session } = useRouteContext({ from: '/_authenticated' })
    const { id: userId } = session.user
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const es = new EventSource('/api/chat/stream')

        es.addEventListener('history', (e) => {
            flushSync(() => setMessages(JSON.parse(e.data)))
            bottomRef.current?.scrollIntoView()
        })

        es.onmessage = (e) => {
            flushSync(() => setMessages((prev) => [...prev, JSON.parse(e.data)]))
            bottomRef.current?.scrollIntoView()
        }

        return () => {
            es.close()
        }
    }, [])

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

    return (
        <div style={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100%' }}>
            <div style={{ overflowY: 'auto', padding: '16px' }}>
                <div className="flex flex-col justify-end min-h-full space-y-2">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.userId === userId ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`relative max-w-[75%] ${msg.userId !== userId ? 'mt-3' : ''}`}>
                                {msg.userId !== userId && (
                                    <span className="absolute -top-3 left-2 text-[10px] font-medium bg-muted-foreground/20 text-foreground px-1.5 py-0.5 rounded-md leading-none">
                                        {msg.name}
                                    </span>
                                )}
                                <div
                                    className={`px-3 py-2 rounded-2xl break-words text-sm ${
                                        msg.userId === userId ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            </div>

            <div
                className="rounded-2xl bg-background/80 backdrop-blur-md border shadow-lg flex gap-2"
                style={{ margin: '0 0 8px', padding: '10px 12px' }}
            >
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
        </div>
    )
}
