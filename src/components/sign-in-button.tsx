import { Link } from '@tanstack/react-router'
import type { User } from '@workos-inc/node'

export default function SignInButton({ large, user, url }: { large?: boolean; user: User | null; url: string }) {
    if (user) {
        return (
            <div>
                <button type="button">
                    <Link to="/logout">Sign Out</Link>
                </button>
            </div>
        )
    }

    return (
        <button type="button">
            <a href={url}>Sign In{large && ' with AuthKit'}</a>
        </button>
    )
}
