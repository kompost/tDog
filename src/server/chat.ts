import { prisma } from '@/db'

type SSEController = ReadableStreamDefaultController

const clients = new Set<SSEController>()

export function addClient(controller: SSEController) {
    clients.add(controller)
}

export function removeClient(controller: SSEController) {
    clients.delete(controller)
}

export function broadcast(data: object) {
    const encoded = new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
    for (const controller of clients) {
        try {
            controller.enqueue(encoded)
        } catch {
            clients.delete(controller)
        }
    }
}

export async function getHistory() {
    const history = await prisma.message.findMany({
        take: 50,
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            text: true,
            userId: true,
            user: { select: { name: true } },
            createdAt: true,
        },
    })
    return history.map((m) => ({
        id: m.id,
        text: m.text,
        userId: m.userId,
        name: m.user.name,
        at: m.createdAt.getTime(),
    }))
}
