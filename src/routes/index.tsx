import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: Page,
})

export function Page() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-3xl font-bold">Hello World!!!</h1>
        </div>
    )
}
