# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

tDog is a full-stack TypeScript application built with TanStack Start (SSR React framework), using Nitro for the server runtime, Prisma for database access, and oRPC for type-safe API endpoints. The application is deployed via Docker to a Hetzner server with automated CI/CD through GitHub Actions.

## Tech Stack Architecture

### Frontend & Routing
- **TanStack Start** with **TanStack Router** (file-based routing in `src/routes/`)
- **React 19** with SSR capabilities
- **Tailwind CSS v4** for styling
- **Shadcn UI** components (add with `pnpx shadcn@latest add <component>`)
- Route files in `src/routes/` are automatically discovered; `src/routeTree.gen.ts` is auto-generated

### Backend & API Layer
- **Nitro** server runtime (configured via `nitro/vite` plugin)
- **oRPC** for type-safe RPC-style APIs (router defined in `src/orpc/router/`)
- API routes are handled via TanStack Start's server handlers
- RPC endpoint: `/api/rpc/*` (handled by `src/routes/api.rpc.$.ts`)

### Database
- **Prisma** with PostgreSQL (using Prisma's online hosted database)
- Generated client outputs to `src/generated/prisma/` (custom output location)
- Database commands use `.env.local` for local development via `dotenv-cli`

### Build & Development
- **Vite 7** with multiple plugins: TanStack devtools, Nitro, TSConfig paths, Tailwind
- **Biome** for linting and formatting (replaces ESLint/Prettier)
- **Vitest** for testing with React Testing Library

## Essential Commands

### Development
```bash
pnpm dev                 # Start dev server on port 3000
pnpm build              # Build for production (.output/ directory)
pnpm serve              # Preview production build
pnpm test               # Run tests with Vitest
```

### Database (Prisma)
All DB commands use `.env.local` for DATABASE_URL:
```bash
pnpm db:generate        # Generate Prisma client after schema changes
pnpm db:push            # Push schema changes to database
pnpm db:migrate         # Create and run migrations
pnpm db:studio          # Open Prisma Studio GUI
pnpm db:seed            # Run seed script
```

### Code Quality
```bash
pnpm check              # Run Biome linting and formatting checks
pnpm lint               # Lint code
pnpm format             # Format code
```

### Deployment
Push to `main` branch triggers automatic deployment via GitHub Actions:
1. Builds Docker image
2. Transfers to Hetzner server
3. Runs `docker compose down && docker compose up -d`
4. Live at https://tdog.dk

Manual deployment on server:
```bash
ssh root@server-ip
cd /root/tdog
docker compose down && docker compose up -d
docker compose logs -f app
```

## Key Architecture Patterns

### File-Based Routing
Routes are defined as files in `src/routes/`:
- `src/routes/__root.tsx` - Root layout with `<Outlet />`
- `src/routes/index.tsx` - Home page (`/`)
- `src/routes/demo/*.tsx` - Demo pages (can be deleted)
- Route files export `Route` via `createFileRoute()` or `createRoute()`

### API Routes with oRPC
Define RPC procedures in `src/orpc/router/`:
```typescript
// src/orpc/router/todos.ts
export const listTodos = procedure.query(async () => {
  return await db.todo.findMany()
})
```

Then export from `src/orpc/router/index.ts`. These become available at `/api/rpc/*`.

### Server-Side Data Loading
Two approaches:
1. **TanStack Router loaders** - Load data before route renders
2. **TanStack Query** - Client-side data fetching with caching

TanStack Query is already set up with devtools in `src/integrations/tanstack-query/`.

### Prisma Client Usage
Import from the custom generated location:
```typescript
import { db } from '@/db'  // Pre-configured Prisma client instance
```

The Prisma client is generated to `src/generated/prisma/` and should be regenerated after schema changes.

### Environment Variables
- **Local development**: `.env.local` (used by all `db:*` scripts)
- **Production**: `/root/tdog/.env` on server (managed manually)
- Type-safe env with `@t3-oss/env-core` in `src/env.ts`

## Docker & Deployment

### Docker Build Process
- Multi-stage Dockerfile: builder stage + production stage
- Uses dummy `DATABASE_URL` during build (Prisma generate doesn't need real DB)
- Prisma client generated in builder, copied to production stage
- Outputs to `.output/` directory (Nitro build output)
- Final container runs: `node .output/server/index.mjs`

### docker-compose.yml
Uses pre-built `tdog:latest` image (not building from Dockerfile on server).
The image is built in CI and loaded via `docker load`.

### CI/CD Workflow
`.github/workflows/deploy.yml`:
1. Builds Docker image with Buildx
2. Saves image to `tdog.tar.gz`
3. SCPs files to `/root/tdog` on Hetzner
4. Loads image and runs `docker compose up -d`

GitHub Secrets required:
- `HETZNER_HOST` - Server IP
- `HETZNER_USERNAME` - SSH user (root)
- `HETZNER_SSH_KEY` - Private SSH key

## Important Notes

### Demo Files
Files prefixed with `demo` in `src/routes/demo/` are examples and can be safely deleted.

### Prisma Schema Location
`prisma/schema.prisma` with custom output path:
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

After schema changes, always run `pnpm db:generate` before building or running tests.

### Path Aliases
Configured via `vite-tsconfig-paths` plugin. Use `@/` prefix for imports from `src/`:
```typescript
import { db } from '@/db'
import { Header } from '@/components/Header'
```

### Production Server
- Server: Hetzner cloud (Ubuntu)
- Nginx reverse proxy with Let's Encrypt SSL
- App runs on port 3000, proxied through Nginx
- Domain: https://tdog.dk
- Database: Prisma's hosted PostgreSQL (not self-hosted)

## Troubleshooting

### Prisma Client Not Found
Run `pnpm db:generate` to generate the client in `src/generated/prisma/`.

### Docker Build Fails on DATABASE_URL
The Dockerfile sets a dummy DATABASE_URL for build time. Real URL is provided via `.env` at runtime.

### Port 3000 Already in Use
Check for existing containers: `docker ps`. Remove conflicting containers before deploying.

### Route Changes Not Reflected
TanStack Router auto-generates `src/routeTree.gen.ts`. Restart dev server if routes don't update.
