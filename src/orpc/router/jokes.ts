import { os } from '@orpc/server'
import * as z from 'zod'

const catJokes = [
    "Why don't cats play poker in the jungle? Too many cheetahs!",
    "What do you call a pile of kittens? A meow-ntain!",
    "Why was the cat sitting on the computer? To keep an eye on the mouse!",
    "What's a cat's favorite color? Purr-ple!",
    "How do cats end a fight? They hiss and make up!",
    "What do you call a cat that lives in an igloo? An eskimew!",
    "Why did the cat run from the tree? Because it was afraid of the bark!",
    "What do you call a cat that gets anything it wants? Purr-suasive!",
    "Why don't cats like online shopping? They prefer a cat-alogue!",
    "What's a cat's favorite TV show? Claw and Order!",
    "How does a cat sing scales? Do-re-mew!",
    "What do you call a cat who loves to bowl? An alley cat!",
    "Why did the cat join the Red Cross? Because she wanted to be a first-aid kit!",
    "What's a cat's way of keeping law and order? Claw enforcement!",
    "Why was the cat so agitated? Because he was in a bad mewd!",
]

export const getRandomJoke = os.handler(() => {
    const randomIndex = Math.floor(Math.random() * catJokes.length)
    return { joke: catJokes[randomIndex] }
})
