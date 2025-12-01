import { createFileRoute, useRouteContext } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/idiots')({
    component: RouteComponent,
})

function RouteComponent() {
    // Access user from parent route context
    const { user } = useRouteContext({ from: '/_authenticated' })

    return (
        <div>
            <h1>Hello "/idiots"!</h1>
            {Object.entries(user).map(([key, value]) => (
                <p key={key}>
                    {key}: {String(value)}
                </p>
            ))}
        </div>
    )
}
