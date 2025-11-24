import { createFileRoute } from '@tanstack/react-router'
import { Construction, Hammer, Wrench } from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
            <div className="max-w-2xl mx-auto text-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 blur-3xl"></div>
                    <div className="relative flex items-center justify-center gap-4 mb-6">
                        <Construction className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 animate-bounce" />
                        <Hammer className="w-12 h-12 md:w-16 md:h-16 text-orange-400 animate-pulse" />
                        <Wrench className="w-12 h-12 md:w-16 md:h-16 text-yellow-300 animate-pulse" />
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Under Construction
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">We're building something awesome</p>

                <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
                    Our site is currently under construction. Check back soon to see what we've been working on!
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg">
                        <p className="text-gray-400 text-sm">Coming Soon</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
