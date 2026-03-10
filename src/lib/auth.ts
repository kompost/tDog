import { APIError, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/db'

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const allowed = await prisma.allowedUser.findUnique({
                        where: { email: user.email },
                    })
                    if (!allowed)
                        throw new APIError('FORBIDDEN', {
                            message: 'You need a permission from the T',
                        })
                },
            },
        },
    },
})
