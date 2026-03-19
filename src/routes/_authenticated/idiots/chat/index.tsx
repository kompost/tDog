import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/_authenticated/idiots/chat/')({
    component: ChatPage,
})

type Message = { userId: string; name: string; text: string; at: number }

function ChatPage() {
    const { session } = useRouteContext({ from: '/_authenticated' })
    const { id: userId, name } = session.user
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg) => (
                    <div
                        key={msg.at + msg.userId}
                        className={`flex flex-col ${msg.userId === userId ? 'items-end' : 'items-start'}`}
                    >
                        <span className="text-xs text-muted-foreground mb-1">{msg.name}</span>
                        <div
                            className={`px-3 py-2 rounded-2xl max-w-[75%] break-words text-sm ${
                                msg.userId === userId ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="border-t p-3 flex gap-2">
                <input
                    className="flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter'}
                />
                <button
                    type="submit"
                    className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
                >
                    Send
                </button>
            </div>
        </div>
    )
}
