import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/prisma/client.js"

const adapter = new PrismaPg({
    // biome-ignore lint/style/noNonNullAssertion: This variable is guaranteed to be set in production
    connectionString: process.env.DATABASE_URL!,
})

declare global {
    var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
    globalThis.__prisma = prisma
}
