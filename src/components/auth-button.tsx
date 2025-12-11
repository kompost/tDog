import { Link, useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function AuthButton() {
    const navigate = useNavigate()
    const { data: session } = authClient.useSession()

    const handleSignOut = async () => {
        await authClient.signOut()
        navigate({ to: '/sign-in' })
    }

    if (session) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                    Hello, {session.user.name || session.user.email}
                </span>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                    Sign Out
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
                <Link to="/sign-in">Sign In</Link>
            </Button>
            <Button asChild size="sm">
                <Link to="/sign-up">Sign Up</Link>
            </Button>
        </div>
    )
}
