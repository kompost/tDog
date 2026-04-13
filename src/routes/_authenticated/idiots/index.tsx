import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/idiots/')({
    component: () => <img src="https://cataas.com/cat" alt="cat" className="rounded-2xl w-full" />,
})
