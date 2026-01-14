import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { orpc } from '@/orpc/client'

export const Route = createFileRoute('/')({
    component: Page,
    loader: async () => {
        console.log('hello world')
    },
})

export function Page() {
    const { data } = useSuspenseQuery(orpc.getRandomJoke.queryOptions())

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
            <div className="max-w-2xl w-full">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Cat Jokes 🐱</h1>

                <div className="flex justify-start mb-4">
                    <div className="relative bg-white rounded-2xl rounded-tl-none shadow-lg p-6 max-w-md">
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-white transform rotate-45" />
                        <p className="text-lg text-gray-700 leading-relaxed">{data.joke}</p>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-md"
                    >
                        Get Another Joke
                    </button>
                </div>
            </div>
        </div>
    )
}
