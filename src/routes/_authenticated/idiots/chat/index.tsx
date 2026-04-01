import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

export const Route = createFileRoute('/_authenticated/idiots/chat/')({
    staticData: { title: 'Chat', headerAction: 'chat', footerAction: 'chat' },
    component: ChatPage,
})

type Message = { id: string; userId: string; name: string; text: string; at: number }

function ChatPage() {
    const { session } = useRouteContext({ from: '/_authenticated' })
    const { id: userId } = session.user
    const [messages, setMessages] = useState<Message[]>([])
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let es: EventSource

        function connect() {
            es?.close()
            es = new EventSource('/api/chat/stream')

            es.addEventListener('history', (e) => {
                flushSync(() => setMessages(JSON.parse(e.data)))
                bottomRef.current?.scrollIntoView()
            })

            es.onmessage = (e) => {
                flushSync(() => setMessages((prev) => [...prev, JSON.parse(e.data)]))
                bottomRef.current?.scrollIntoView()
            }
        }

        function onVisibilityChange() {
            if (document.visibilityState === 'visible') connect()
        }

        connect()
        document.addEventListener('visibilitychange', onVisibilityChange)

        return () => {
            es.close()
            document.removeEventListener('visibilitychange', onVisibilityChange)
        }
    }, [])

    return (
        <div className="flex flex-col space-y-2">
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
    )
}
