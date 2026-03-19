import type { Role } from '@/generated/prisma/enums'
import { auth } from '@/lib/auth'

type Session = typeof auth.$Infer.Session
type TypedSession = Omit<Session, 'user'> & {
    user: Session['user'] & { role: Role }
}

export async function getSession(request: Request): Promise<TypedSession | null> {
    const session = await auth.api.getSession({
        headers: request.headers,
    })

    return session as TypedSession | null
}

export async function requireAuth(request: Request) {
    const session = await getSession(request)

    if (!session) {
        throw new Error('Unauthorized')
    }

    return session
}
