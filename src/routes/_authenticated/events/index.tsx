import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/db'
import { requireAuth } from '@/lib/auth-server'

// Server function to list user's events
const listMyEvents = createServerFn({ method: 'GET' }).handler(async ({ request }) => {
    const { user } = await requireAuth(request)
    console.log('testing')

    const events = await prisma.event.findMany({
        where: {
            creatorId: user.id,
        },
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
                        },
                    },
                },
            },
        },
        orderBy: {
            date: 'asc',
        },
    })

    return events
})

export const Route = createFileRoute('/_authenticated/events/')({
    loader: () => listMyEvents(),
    component: EventsPage,
})

function EventsPage() {
    const events = Route.useLoaderData()

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Events</h1>
                <Link to="/events/edit/$eventId" params={{ eventId: 'new' }}>
                    <Button>Create Event</Button>
                </Link>
            </div>

            {events.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-500">
                            No events yet. Create your first event to get started!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => (
                        <Card key={event.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{event.name}</CardTitle>
                                        <CardDescription>
                                            {new Date(event.date).toLocaleString()}
                                            {event.location && ` • ${event.location}`}
                                        </CardDescription>
                                    </div>
                                    <Link to="/events/edit/$eventId" params={{ eventId: event.id }}>
                                        <Button variant="outline" size="sm">
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 mb-4">{event.description}</p>
                                <div className="text-sm text-gray-500">
                                    <p>Created by: {event.creator.name}</p>
                                    <p>Participants: {event.participants.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
