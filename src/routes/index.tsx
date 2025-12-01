import { Await, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/')({
    loader: async () => {
        return {
            slow: new Promise<string>((r) => setTimeout(() => r('later!'), 3000)),
        }
    },
    component: Page,
})

function Page() {
    const data = Route.useLoaderData()

    return (
        <div>
            <Suspense fallback={<SkeletonDemo />}>
                <div className="flex items-center space-x-4">
                    <div className="border h-12 w-12 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="border w-[250px]">
                            <Await promise={data.slow}>{(value) => <p>{value}</p>}</Await>
                        </div>
                        <div className="border w-[200px]"></div>
                    </div>
                </div>
            </Suspense>
        </div>
    )
}

export function SkeletonDemo() {
    return (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="w-[250px]" />
                Loading...
                <Skeleton className="w-[200px]" />
            </div>
        </div>
    )
}
