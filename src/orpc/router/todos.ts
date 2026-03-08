import { os } from '@orpc/server'
import * as z from 'zod'
import { authedProcedure } from '@/orpc/procedures'

const todos = [
    { id: 1, name: 'Get groceries' },
    { id: 2, name: 'Buy a new phone' },
    { id: 3, name: 'Finish the project' },
]

export const listTodos = os.input(z.object({})).handler(() => {
    return todos
})

export const addTodo = os.input(z.object({ name: z.string() })).handler(({ input }) => {
    const newTodo = { id: todos.length + 1, name: input.name }
    todos.push(newTodo)
    return newTodo
})

// Example protected procedure - requires authentication
// context.user and context.session are guaranteed to be defined
export const getMyProfile = authedProcedure.handler(({ context }) => {
    return {
        user: context.user,
        message: `Hello ${context.user.name || context.user.email}! You are authenticated.`,
    }
})
