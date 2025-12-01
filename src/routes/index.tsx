import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/')({
    component: Page,
})

const loaderFn = createServerFn().handler(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return { msg: 'This is loaded data!' }
})

export function Page() {
    return (
        <div>
            <Suspense fallback={<SkeletonDemo />}>
                <Data />
            </Suspense>
        </div>
    )
}

function Data() {
    const { data } = useSuspenseQuery({
        queryKey: ['data'],
        queryFn: () => loaderFn(),
    })

    return (
        <div className="flex items-center space-x-4">
            <div className="border h-12 w-12 rounded-full"></div>
            <div className="space-y-2">
                <div className="border w-[250px]">{data.msg}</div>
                <div className="border w-[200px]"></div>
            </div>
        </div>
    )
}

function SkeletonDemo() {
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
