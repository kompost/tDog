import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getSession } from '@/lib/auth-server'

const checkAuth = createServerFn({ method: 'GET' }).handler(async ({ request }) => {
    const session = await getSession(request)
    console.log('Session:', session)
    if (!session) {
        throw redirect({
            to: '/sign-in',
        })
    }

    return session
})

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async () => {
        const session = await checkAuth()
        return { session }
    },
    component: () => <Outlet />,
})
