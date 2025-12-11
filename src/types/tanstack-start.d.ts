import '@tanstack/react-start'

declare module '@tanstack/react-start' {
	interface ServerFnCtx {
		request: Request
	}
}
