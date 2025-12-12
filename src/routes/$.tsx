import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$')({
    component: NotFound,
})

function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Page not found</p>
        </div>
    )
}
