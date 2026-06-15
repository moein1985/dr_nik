# Dr Nik Clinic - Infrastructure Starter

Initial infrastructure for a clinic website using:

- Next.js (App Router + TypeScript)
- tRPC for type-safe API
- Clean Architecture style modules (Domain/Application/Infrastructure)
- Appointment booking module
- Staff notification email module (SMTP)
- Docker Compose (Postgres + Mailpit + App)

## Architecture

Core server modules are in `src/server/modules`:

- `appointment`
  - `domain`: entities and repository interfaces
  - `application`: use-cases
   - `infrastructure`: concrete adapters (Prisma + PostgreSQL)
- `staff-email`
  - `domain`: email sender port
  - `application`: notification use-case
  - `infrastructure`: SMTP sender adapter

API composition:

- `src/server/api/trpc.ts`: tRPC init/context
- `src/server/api/root.ts`: root router
- `src/server/api/routers/appointment.ts`: booking endpoints
- `src/app/api/trpc/[trpc]/route.ts`: Next.js route adapter

## tRPC Endpoints

- `appointment.create`
- `appointment.list`

When `appointment.create` is called, a staff notification email is sent.

## Local Setup

1. Copy env file:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run development mode:

   ```bash
   npm run dev
   ```

4. Run Prisma migrations:

   ```bash
   npm run prisma:migrate:dev -- --name init
   ```

## Docker Setup

1. Create `.env` from `.env.example`
2. Run:

   ```bash
   docker compose up --build
   ```

Services:

- App: http://localhost:3000
- Mailpit UI: http://localhost:8025
- Postgres: localhost:5432

## Next Steps

- Expand booking reports and analytics dashboards.
- Add automated integration tests for Prisma repositories.
- Harden CI/CD with migration checks and smoke tests.
# dr_nik
