import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { useEffect } from 'react'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
// Import CSS directly, not as URL - let Vite handle it
import '../styles.css'

interface MyRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1, viewport-fit=cover',
            },
            {
                title: 'tDogs Kennel',
            },
            {
                name: 'theme-color',
                content: '#000000',
            },
            {
                name: 'apple-mobile-web-app-capable',
                content: 'yes',
            },
            {
                name: 'apple-mobile-web-app-status-bar-style',
                content: 'black-translucent',
            },
            {
                name: 'apple-mobile-web-app-title',
                content: 'tDogs',
            },
        ],
        links: [
            { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
            { rel: 'manifest', href: '/manifest.json' },
            { rel: 'apple-touch-icon', href: '/logo192.png' },
        ],
        // CSS is injected automatically by Vite when imported directly
    }),
    shellComponent: RootComponent,
    notFoundComponent: NotFound,
})

function RootComponent() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
        }
    }, [])

    return (
        <RootDocument>
            <Outlet />
        </RootDocument>
    )
}

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body className="dark:bg-gray-900 dark:text-white min-h-screen">
                {children}

                <TanStackDevtools
                    config={{
                        position: 'bottom-right',
                    }}
                    plugins={[
                        {
                            name: 'Tanstack Router',
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                        TanStackQueryDevtools,
                    ]}
                />
                <Scripts />
            </body>
        </html>
    )
}

function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Page not found</p>
        </div>
    )
}
