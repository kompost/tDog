import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const catJokes = [
    "Why don't cats play poker in the jungle? Too many cheetahs!",
    'What do you call a pile of kittens? A meow-ntain!',
    'Why was the cat sitting on the computer? To keep an eye on the mouse!',
    "What's a cat's favorite color? Purr-ple!",
    'How do cats end a fight? They hiss and make up!',
    'What do you call a cat that lives in an igloo? An eskimew!',
    'Why did the cat run from the tree? Because it was afraid of the bark!',
    'What do you call a cat that gets anything it wants? Purr-suasive!',
    "Why don't cats like online shopping? They prefer a cat-alogue!",
    "What's a cat's favorite TV show? Claw and Order!",
    'How does a cat sing scales? Do-re-mew!',
    'What do you call a cat who loves to bowl? An alley cat!',
    'Why did the cat join the Red Cross? Because she wanted to be a first-aid kit!',
    "What's a cat's way of keeping law and order? Claw enforcement!",
    'Why was the cat so agitated? Because he was in a bad mewd!',
]

const getRandomJoke = createServerFn().handler(() => {
    const randomIndex = Math.floor(Math.random() * catJokes.length)
    return { joke: catJokes[randomIndex] }
})

export const Route = createFileRoute('/')({
    component: Page,
    loader: () => getRandomJoke(),
})

export function Page() {
    const { joke } = Route.useLoaderData()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
            <div className="max-w-2xl w-full">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Cat Jokes 🐱</h1>

                <div className="flex justify-start mb-4">
                    <div className="relative bg-white rounded-2xl rounded-tl-none shadow-lg p-6 max-w-md">
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-white transform rotate-45" />
                        <p className="text-lg text-gray-700 leading-relaxed">{joke}</p>
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
