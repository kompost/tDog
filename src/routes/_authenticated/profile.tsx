import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useRouteContext } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { requireAuth } from '@/lib/auth-server'

// Example protected server function
const getUserProfile = createServerFn({ method: 'GET' }).handler(async ({ request }) => {
    // This requires authentication and throws if not authenticated
    const { user } = await requireAuth(request)

    // You can now safely use user.id for database queries
    // For example:
    // const profile = await db.profile.findUnique({
    //     where: { userId: user.id }
    // })

    return {
        user,
        // Add any other user-specific data here
        additionalData: {
            lastLogin: new Date().toISOString(),
            accountType: 'free',
        },
    }
})

export const Route = createFileRoute('/_authenticated/profile')({
    component: ProfilePage,
})

function ProfilePage() {
    const navigate = useNavigate()
    const { session } = useRouteContext({ from: '/_authenticated' })

    const { data } = useSuspenseQuery({
        queryKey: ['profile'],
        queryFn: () => getUserProfile(),
    })

    const handleSignOut = async () => {
        await authClient.signOut()
        navigate({ to: '/sign-in' })
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Profile</h1>
                <Button onClick={handleSignOut} variant="outline">
                    Sign Out
                </Button>
            </div>

            <div className="space-y-6">
                <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">User Information</h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Name:</span> {session.user.name}
                        </p>
                        <p>
                            <span className="font-medium">Email:</span> {session.user.email}
                        </p>
                        <p>
                            <span className="font-medium">Email Verified:</span>{' '}
                            {session.user.emailVerified ? 'Yes' : 'No'}
                        </p>
                        <p>
                            <span className="font-medium">User ID:</span> {session.user.id}
                        </p>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Session Information</h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Session ID:</span> {session.session.id}
                        </p>
                        <p>
                            <span className="font-medium">Expires At:</span>{' '}
                            {new Date(session.session.expiresAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Additional Data (from protected server function)</h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Last Login:</span>{' '}
                            {new Date(data.additionalData.lastLogin).toLocaleString()}
                        </p>
                        <p>
                            <span className="font-medium">Account Type:</span> {data.additionalData.accountType}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
