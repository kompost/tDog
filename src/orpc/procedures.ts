import { ORPCError, os } from '@orpc/server'
import { auth } from '@/lib/auth'

// Define base context with request headers
export const publicProcedure = os.$context<{ headers: Headers }>()

// Auth middleware - fetches session from Better Auth and validates it
const authMiddleware = publicProcedure.middleware(async ({ context, next }) => {
    const sessionData = await auth.api.getSession({
        headers: context.headers,
    })

    if (!sessionData?.session || !sessionData?.user) {
        throw new ORPCError('UNAUTHORIZED', {
            message: 'Please sign in to access this resource',
        })
    }

    return next({
        context: {
            session: sessionData.session,
            user: sessionData.user,
        },
    })
})

// Authenticated procedure - requires valid session
// Use this for any procedure that requires authentication
export const authedProcedure = publicProcedure.use(authMiddleware)
