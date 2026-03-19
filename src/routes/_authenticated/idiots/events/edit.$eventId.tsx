import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { prisma } from '@/db'
import { requireAuth } from '@/lib/auth-server'

const eventSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    date: z.string().min(1, 'Date is required'),
    location: z.string().optional(),
    visibility: z.enum(['ALL', 'SPECIFIC']),
    inviteeIds: z.array(z.string()),
})

const getEvent = createServerFn({ method: 'GET' })
    .inputValidator((data: unknown) => {
        return z.object({ eventId: z.string() }).parse(data)
    })
    .handler(async ({ data }) => {
        const event = await prisma.event.findUnique({
            where: { id: data.eventId },
            include: {
                creator: { select: { id: true, name: true, email: true, image: true } },
                participants: {
                    include: {
                        user: { select: { id: true, name: true, email: true, image: true } },
                    },
                },
                invitees: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        })

        if (!event) throw new Error('Event not found')
        return event
    })

const checkCanManageEvents = createServerFn({ method: 'GET' }).handler(async ({ request }) => {
    const { user } = await requireAuth(request)
    if (user.role !== 'ADMIN' && user.role !== 'COLLABORATOR') {
        throw redirect({ to: '/idiots/events' })
    }
})

const listAllUsers = createServerFn({ method: 'GET' }).handler(async ({ request }) => {
    await requireAuth(request)
    return prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
    })
})

const createEvent = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => eventSchema.parse(data))
    .handler(async ({ data, request }) => {
        const { user } = await requireAuth(request)

        const event = await prisma.event.create({
            data: {
                id: crypto.randomUUID(),
                name: data.name,
                description: data.description,
                date: new Date(data.date),
                location: data.location || null,
                creatorId: user.id,
                visibility: data.visibility,
            },
        })

        if (data.visibility === 'SPECIFIC' && data.inviteeIds.length > 0) {
            await prisma.eventInvitee.createMany({
                data: data.inviteeIds.map((userId) => ({ eventId: event.id, userId })),
            })
        }

        return event
    })

const updateEvent = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => {
        return z.object({ eventId: z.string() }).merge(eventSchema).parse(data)
    })
    .handler(async ({ data, request }) => {
        const { user } = await requireAuth(request)

        const existingEvent = await prisma.event.findUnique({ where: { id: data.eventId } })
        if (!existingEvent) throw new Error('Event not found')
        if (existingEvent.creatorId !== user.id) throw new Error('You do not have permission to edit this event')

        const event = await prisma.event.update({
            where: { id: data.eventId },
            data: {
                name: data.name,
                description: data.description,
                date: new Date(data.date),
                location: data.location || null,
                visibility: data.visibility,
            },
        })

        // Sync invitees
        await prisma.eventInvitee.deleteMany({ where: { eventId: data.eventId } })
        if (data.visibility === 'SPECIFIC' && data.inviteeIds.length > 0) {
            await prisma.eventInvitee.createMany({
                data: data.inviteeIds.map((userId) => ({ eventId: data.eventId, userId })),
            })
        }

        return event
    })

export const Route = createFileRoute('/_authenticated/idiots/events/edit/$eventId')({
    loader: () => checkCanManageEvents(),
    component: EditEventPage,
})

function EditEventPage() {
    const { eventId } = Route.useParams()
    const navigate = useNavigate()
    const router = useRouter()
    const isNewEvent = eventId === 'new'

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState('')
    const [location, setLocation] = useState('')
    const [visibility, setVisibility] = useState<'ALL' | 'SPECIFIC'>('ALL')
    const [inviteeIds, setInviteeIds] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [initialized, setInitialized] = useState(false)

    const { data: event } = useSuspenseQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            if (isNewEvent) return null
            return getEvent({ data: { eventId } })
        },
    })

    const { data: allUsers } = useSuspenseQuery({
        queryKey: ['all-users'],
        queryFn: () => listAllUsers(),
    })

    if (event && !initialized) {
        setName(event.name)
        setDescription(event.description)
        setDate(new Date(event.date).toISOString().slice(0, 16))
        setLocation(event.location || '')
        setVisibility(event.visibility as 'ALL' | 'SPECIFIC')
        setInviteeIds(event.invitees.map((i) => i.userId))
        setInitialized(true)
    }

    const toggleInvitee = (userId: string) => {
        setInviteeIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const formData = { name, description, date, location, visibility, inviteeIds }

            if (isNewEvent) {
                await createEvent({ data: formData })
            } else {
                await updateEvent({ data: { eventId, ...formData } })
            }

            router.invalidate()
            navigate({ to: '/idiots/events' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>{isNewEvent ? 'Create Event' : 'Edit Event'}</CardTitle>
                    <CardDescription>
                        {isNewEvent ? 'Fill in the details to create a new event' : 'Update the event details'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Event Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Team Meeting"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this event about?"
                                required
                                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date & Time</Label>
                            <Input
                                id="date"
                                type="datetime-local"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location (Optional)</Label>
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Conference Room A"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Visibility</Label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setVisibility('ALL')}
                                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                                        visibility === 'ALL'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-input hover:bg-accent'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVisibility('SPECIFIC')}
                                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                                        visibility === 'SPECIFIC'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-input hover:bg-accent'
                                    }`}
                                >
                                    Specific users
                                </button>
                            </div>
                        </div>

                        {visibility === 'SPECIFIC' && (
                            <div className="space-y-2">
                                <Label>Invite users</Label>
                                <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                                    {allUsers?.map((u) => (
                                        <label
                                            key={u.id}
                                            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={inviteeIds.includes(u.id)}
                                                onChange={() => toggleInvitee(u.id)}
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm font-medium">{u.name}</span>
                                            <span className="text-sm text-gray-500">{u.email}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : isNewEvent ? 'Create Event' : 'Update Event'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate({ to: '/idiots/events' })}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
