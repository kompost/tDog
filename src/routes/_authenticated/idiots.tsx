import { createFileRoute, useRouteContext } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/idiots')({
    component: RouteComponent,
})

function RouteComponent() {
    // Access session from parent route context
    const { session } = useRouteContext({ from: '/_authenticated' })

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Protected Page</h1>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">User Info:</h2>
                {Object.entries(session.user).map(([key, value]) => (
                    <p key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                    </p>
                ))}
            </div>
            <div className="mt-6 space-y-2">
                <h2 className="text-xl font-semibold">Session Info:</h2>
                <p>
                    <span className="font-medium">Session ID:</span> {session.session.id}
                </p>
                <p>
                    <span className="font-medium">Expires At:</span>{' '}
                    {new Date(session.session.expiresAt).toLocaleString()}
                </p>
            </div>
        </div>
    )
}
