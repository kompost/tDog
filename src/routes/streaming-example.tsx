import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Suspense } from 'react'

// Server function that fetches data
const getSlowData = createServerFn({ method: 'GET' }).handler(async () => {
    // Simulate slow API call
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return { message: 'Data loaded from server!' }
})

const getFastData = createServerFn({ method: 'GET' }).handler(async () => {
    return { message: 'Fast data!' }
})

export const Route = createFileRoute('/streaming-example')({
    // Loader prefetches but doesn't block SSR
    loader: async ({ context }) => {
        // Prefetch fast data (will complete during SSR)
        await context.queryClient.prefetchQuery({
            queryKey: ['fast'],
            queryFn: () => getFastData(),
        })

        // Start prefetching slow data but DON'T await it
        // This fires the request but doesn't block SSR
        context.queryClient.prefetchQuery({
            queryKey: ['slow'],
            queryFn: () => getSlowData(),
        })

        // Return immediately - SSR completes
        return null
    },
    component: StreamingPage,
})

function StreamingPage() {
    return (
        <div className="p-8">
            <h1>Streaming Example</h1>

            {/* This renders immediately during SSR */}
            <FastSection />

            {/* This shows fallback during SSR, streams in after */}
            <Suspense fallback={<div>Loading slow data...</div>}>
                <SlowSection />
            </Suspense>
        </div>
    )
}

function FastSection() {
    // This data is already prefetched, no suspense needed
    const { data } = useSuspenseQuery({
        queryKey: ['fast'],
        queryFn: () => getFastData(),
    })

    return (
        <div className="border p-4 mb-4">
            <h2>Fast Section</h2>
            <p>{data.message}</p>
        </div>
    )
}

function SlowSection() {
    // This will suspend until data arrives
    const { data } = useSuspenseQuery({
        queryKey: ['slow'],
        queryFn: () => getSlowData(),
    })

    return (
        <div className="border p-4">
            <h2>Slow Section</h2>
            <p>{data.message}</p>
        </div>
    )
}
