import type { Session, User } from 'better-auth/types'
import { auth } from '@/lib/auth'

export async function getSession(request: Request): Promise<{ session: Session; user: User } | null> {
    const session = await auth.api.getSession({
        headers: request.headers,
    })

    return session
}

export async function requireAuth(request: Request) {
    const session = await getSession(request)

    if (!session) {
        throw new Error('Unauthorized')
    }

    return session
}
