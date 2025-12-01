import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuth, getSignInUrl } from '../../authkit/serverFunctions'

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async ({ location }) => {
        const { user } = await getAuth()
        if (!user) {
            const { pathname } = location
            const href = await getSignInUrl({ data: pathname })
            throw redirect({ href })
        }
        return { user }
    },
})
