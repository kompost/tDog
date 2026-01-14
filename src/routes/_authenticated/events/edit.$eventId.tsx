import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { prisma } from '@/db'
import { requireAuth } from '@/lib/auth-server'

// Validation schema
const eventSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    date: z.string().min(1, 'Date is required'),
    location: z.string().optional(),
})

// Server function to get event
const getEvent = createServerFn({ method: 'GET' })
    .inputValidator((data: unknown) => {
        return z.object({ eventId: z.string() }).parse(data)
    })
    .handler(async ({ data }) => {
        const event = await prisma.event.findUnique({
            where: { id: data.eventId },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        })

        if (!event) {
            throw new Error('Event not found')
        }

        return event
    })

// Server function to create event
const createEvent = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => {
        return eventSchema.parse(data)
    })
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
            },
        })

        return event
    })

// Server function to update event
const updateEvent = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => {
        return z
            .object({
                eventId: z.string(),
            })
            .merge(eventSchema)
            .parse(data)
    })
    .handler(async ({ data, request }) => {
        const { user } = await requireAuth(request)

        // Check if user is the creator
        const existingEvent = await prisma.event.findUnique({
            where: { id: data.eventId },
        })

        if (!existingEvent) {
            throw new Error('Event not found')
        }

        if (existingEvent.creatorId !== user.id) {
            throw new Error('You do not have permission to edit this event')
        }

        const event = await prisma.event.update({
            where: { id: data.eventId },
            data: {
                name: data.name,
                description: data.description,
                date: new Date(data.date),
                location: data.location || null,
            },
        })

        return event
    })

export const Route = createFileRoute('/_authenticated/events/edit/$eventId')({
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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Only fetch event if editing existing one
    const { data: event } = useSuspenseQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            if (isNewEvent) return null
            return getEvent({ data: { eventId } })
        },
    })

    // Initialize form with event data if editing
    useState(() => {
        if (event) {
            setName(event.name)
            setDescription(event.description)
            setDate(new Date(event.date).toISOString().slice(0, 16))
            setLocation(event.location || '')
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const formData = {
                name,
                description,
                date,
                location,
            }

            if (isNewEvent) {
                await createEvent({ data: formData })
            } else {
                await updateEvent({ data: { eventId, ...formData } })
            }

            router.invalidate()
            navigate({ to: '/events' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
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

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : isNewEvent ? 'Create Event' : 'Update Event'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate({ to: '/events' })}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
