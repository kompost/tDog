import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { z } from 'zod'
import { Countdown } from '@/components/countdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { prisma } from '@/db'
import { EventVisibility, ParticipationStatus, Role } from '@/generated/prisma/enums'
import { requireAuth } from '@/lib/auth-server'

const listMyEvents = createServerFn({ method: 'GET' }).handler(async ({ request }) => {
    const { user } = await requireAuth(request)
    const canManageEvents = user.role === Role.ADMIN || user.role === Role.COLLABORATOR

    const FIFTEEN_MINUTES = 15 * 60 * 1000
    const cutoff = new Date(Date.now() - FIFTEEN_MINUTES)

    const events = await prisma.event.findMany({
        where: {
            date: { gte: cutoff },
            OR: [
                { visibility: EventVisibility.ALL },
                { creatorId: user.id },
                { invitees: { some: { userId: user.id } } },
            ],
        },
        include: {
            creator: {
                select: { id: true, name: true, email: true, image: true },
            },
            participants: {
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
            },
        },
        orderBy: { date: 'asc' },
    })

    return { events, canManageEvents, userId: user.id }
})

const participationSchema = z.object({
    eventId: z.string(),
    status: z.enum(ParticipationStatus),
})

const setParticipation = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => participationSchema.parse(data))
    .handler(async ({ request, data }) => {
        const { user } = await requireAuth(request)
        await prisma.eventParticipant.upsert({
            where: { eventId_userId: { eventId: data.eventId, userId: user.id } },
            create: { eventId: data.eventId, userId: user.id, status: data.status },
            update: { status: data.status },
        })
    })

export const Route = createFileRoute('/_authenticated/idiots/events/')({
    staticData: { title: 'Events', headerAction: 'events', navAction: 'events' },
    loader: () => listMyEvents(),
    component: EventsPage,
})

type Participant = { id: string; name: string; email: string } | null

function formatEventDate(date: Date | string) {
    return new Date(date).toLocaleString('da-DK', {
        timeZone: 'Europe/Copenhagen',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function EventsPage() {
    const { events, canManageEvents, userId } = Route.useLoaderData()
    const router = useRouter()
    const [participantsModal, setParticipantsModal] = useState<{ name: string; list: Participant[] } | null>(null)
    return (
        <>
            <div className="max-w-4xl mx-auto">
                {events.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-center text-gray-500">No events yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {events.map((event) => {
                            const isParticipating = event.participants.some(
                                (p) => p.user?.id === userId && p.status === ParticipationStatus.GOING,
                            )

                            return (
                                <Card key={event.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-2xl">{event.name}</CardTitle>
                                                <div className="flex items-center gap-1.5 text-sm text-blue-500 font-medium">
                                                    <span>📅</span>
                                                    <span>{formatEventDate(event.date)}</span>
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <span>📍</span>
                                                        <span>{event.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {canManageEvents && (
                                                <Link to="/idiots/events/edit/$eventId" params={{ eventId: event.id }}>
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 mb-2">{event.description}</p>
                                        <div className="text-sm text-gray-400 mb-4">
                                            Starts in: <Countdown date={event.date} />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                <p>Created by: {event.creator?.name ?? 'Deleted User'}</p>
                                                <button
                                                    type="button"
                                                    className="hover:underline cursor-pointer text-left"
                                                    onClick={() =>
                                                        setParticipantsModal({
                                                            name: event.name,
                                                            list: event.participants
                                                                .filter((p) => p.status === ParticipationStatus.GOING)
                                                                .map((p) => p.user),
                                                        })
                                                    }
                                                >
                                                    Participants:{' '}
                                                    {
                                                        event.participants.filter(
                                                            (p) => p.status === ParticipationStatus.GOING,
                                                        ).length
                                                    }
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={isParticipating ? 'default' : 'outline'}
                                                    className={
                                                        isParticipating
                                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                                            : ''
                                                    }
                                                    onClick={async () => {
                                                        if (!isParticipating) {
                                                            await setParticipation({
                                                                data: {
                                                                    eventId: event.id,
                                                                    status: ParticipationStatus.GOING,
                                                                },
                                                            })
                                                            router.invalidate()
                                                        }
                                                    }}
                                                >
                                                    👍
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={!isParticipating ? 'default' : 'outline'}
                                                    className={
                                                        !isParticipating ? 'bg-red-600 hover:bg-red-700 text-white' : ''
                                                    }
                                                    onClick={async () => {
                                                        if (isParticipating) {
                                                            await setParticipation({
                                                                data: {
                                                                    eventId: event.id,
                                                                    status: ParticipationStatus.FOTT,
                                                                },
                                                            })
                                                            router.invalidate()
                                                        }
                                                    }}
                                                >
                                                    FoTT
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            <Dialog open={!!participantsModal} onOpenChange={() => setParticipantsModal(null)}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>{participantsModal?.name} — Participants</DialogTitle>
                    </DialogHeader>
                    {participantsModal?.list.length === 0 ? (
                        <p className="text-sm text-gray-500">No participants yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {participantsModal?.list.map((p) =>
                                p ? (
                                    <li key={p.id} className="text-sm">
                                        <span className="font-medium">{p.name}</span>
                                        <span className="text-gray-500 ml-2">{p.email}</span>
                                    </li>
                                ) : null,
                            )}
                        </ul>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
