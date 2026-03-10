import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/idiots/')({
    beforeLoad: () => {
        throw redirect({ to: '/idiots/events' })
    },
})
