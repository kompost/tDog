import { useCountdown } from '@/hooks/useCountdown'

export function Countdown({ date }: { date: Date | string }) {
    const diff = useCountdown(date)

    if (diff <= 0)
        return (
            <div className="flex items-center justify-center">
                <span className="text-green-600 font-medium">Happening now</span>
            </div>
        )

    const totalSeconds = Math.floor(diff / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const units = [
        { label: 'D', value: days, show: days > 0 },
        { label: 'H', value: hours, show: days > 0 || hours > 0 },
        { label: 'M', value: minutes, show: true },
        { label: 'S', value: seconds, show: true },
    ]

    return (
        <div className="flex gap-2">
            {units
                .filter((u) => u.show)
                .map((u) => (
                    <div key={u.label} className="flex flex-col items-center justify-center w-12 h-12 rounded-md border bg-muted">
                        <span suppressHydrationWarning className="text-base font-mono font-semibold tabular-nums leading-none">
                            {String(u.value).padStart(2, '0')}
                        </span>
                        <span className="text-xs text-muted-foreground">{u.label}</span>
                    </div>
                ))}
        </div>
    )
}
