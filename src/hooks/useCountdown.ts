import { useEffect, useState } from 'react'

export function useCountdown(date: Date | string) {
    const target = new Date(date).getTime()
    const [diff, setDiff] = useState<number>(() => target - Date.now())

    useEffect(() => {
        const id = setInterval(() => setDiff(target - Date.now()), 1000)
        return () => clearInterval(id)
    }, [target])

    return diff
}
