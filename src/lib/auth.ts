import { APIError, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/db'
import { env } from '@/env'
import { Role } from '@/generated/prisma/enums'

export const auth = betterAuth({
    trustedOrigins: env.TRUSTED_ORIGINS?.split(',') ?? [],
    user: {
        additionalFields: {
            role: {
                type: 'string' as const,
                required: true,
                defaultValue: Role.USER,
            },
        },
    },
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
