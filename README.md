# IdeaNick

IdeaNick is a full-stack web application for publishing, browsing, editing and liking ideas. Users can create accounts, upload idea images and documents, view an infinite feed of ideas, search by text, like ideas, edit their own ideas, and moderate ideas when they have the required permissions.

The project is organized as a pnpm monorepo with a TypeScript backend, a React/Vite frontend and a small shared package used by both sides.

## Table Of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database And Prisma](#database-and-prisma)
- [Development Workflow](#development-workflow)
- [Scripts](#scripts)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Build And Production Runtime](#build-and-production-runtime)
- [Docker](#docker)
- [Application Architecture](#application-architecture)
- [API Overview](#api-overview)
- [Authentication And Permissions](#authentication-and-permissions)
- [Files, Images And External Services](#files-images-and-external-services)
- [Emails And Cron Jobs](#emails-and-cron-jobs)
- [Observability](#observability)
- [Troubleshooting](#troubleshooting)
- [Maintenance Notes](#maintenance-notes)

## Features

- User registration, sign in, sign out and profile editing.
- JWT authentication stored in a browser cookie named `token`.
- Idea catalog with infinite scrolling and debounced search.
- Idea detail pages with author information, creation date, image gallery, certificate, documents and full idea text.
- Creation and editing of ideas by authenticated users.
- Likes with optimistic UI updates.
- Role-based moderation: users with `BLOCK_IDEAS` or `ALL` can block ideas.
- Automatic initial admin account provisioning.
- Cloudinary uploads for idea images and avatars.
- S3-compatible uploads for certificates and documents.
- MJML email templates compiled to HTML.
- Monthly cron notification about the most liked ideas.
- Sentry integration for backend and frontend.
- Optional Datadog log collection in Docker Compose.

## Tech Stack

### Shared

- Node.js 24
- pnpm workspaces
- TypeScript
- Zod
- Jest
- ESLint and Prettier

### Backend

- Express 5
- tRPC 10
- Prisma 7 with PostgreSQL
- Passport JWT
- MJML and Handlebars for emails
- Brevo for email delivery
- Cloudinary SDK
- AWS S3 SDK with S3-compatible storage support
- Sentry Node SDK
- Winston and debug logs
- cron

### Webapp

- React 19
- Vite 8
- React Router 7
- TanStack React Query
- tRPC React Query client
- Formik
- SCSS modules
- Sentry React SDK
- Cloudinary/S3 URL helpers from `shared`

## Repository Structure

```text
.
|-- backend/                  # Express/tRPC API, Prisma schema, emails, cron, production webapp serving
|   |-- src/
|   |   |-- emails/           # MJML email templates and compiled dist output
|   |   |-- generated/prisma/ # Generated Prisma client
|   |   |-- lib/              # App infrastructure: env, prisma, auth, tRPC, Sentry, email, S3
|   |   |-- prisma/           # Prisma schema and migrations
|   |   |-- router/           # tRPC routes
|   |   |-- scripts/          # DB preset and scheduled jobs
|   |   |-- test/             # Integration test helpers
|   |   `-- utils/            # Shared backend utilities
|   |-- env.example
|   |-- env.test.example
|   `-- package.json
|-- shared/                   # Code shared by backend and webapp
|   `-- src/
|-- webapp/                   # React/Vite application
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- styles/
|   |   `-- utils/
|   |-- env.example
|   `-- package.json
|-- docker-compose.yml
|-- Dockerfile
|-- env.docker.example
|-- package.json
|-- pnpm-lock.yaml
`-- pnpm-workspace.yaml
```

## Prerequisites

- Node.js `24.18.1` or compatible Node 24 version. The expected version is stored in `.nvmrc`.
- pnpm.
- PostgreSQL.
- Optional: Docker and Docker Compose for containerized production-like runs.
- Optional external accounts for non-local production use:
  - Brevo
  - Cloudinary
  - S3-compatible object storage, for example Yandex Object Storage
  - Sentry
  - Datadog

Install pnpm if needed:

```bash
npm install -g pnpm
```

Install dependencies from the repository root:

```bash
pnpm install
```

The backend `prepare` script runs Prisma generation and installs `ts-patch`.

## Quick Start

1. Create local environment files:

```bash
cp backend/env.example backend/.env
cp webapp/env.example webapp/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/env.example backend/.env
Copy-Item webapp/env.example webapp/.env
```

2. Fix the backend database URL in `backend/.env`.

Use a valid PostgreSQL URL:

```env
DATABASE_URL=postgresql://ideanick:ideanick@localhost:5432/ideanick?schema=public
```

3. Create the local PostgreSQL database.

Example:

```bash
createdb ideanick
```

4. Run Prisma migrations:

```bash
pnpm b pmd
```

5. Start backend and frontend in development mode:

```bash
pnpm dev
```

Default local URLs:

- Webapp: `http://localhost:8000`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/ping`
- tRPC endpoint: `http://localhost:3000/trpc`

6. Sign in as the seeded admin user if needed:

```text
nick: admin
password: value of INITIAL_ADMIN_PASSWORD from backend/.env
```

With the default example env, the admin password is `1234`.

## Environment Variables

Environment is validated with Zod on startup/build. Local development is intentionally more permissive than production: several secrets are required only when `HOST_ENV` is not `local`.

### Root Docker Env

Create `.env.docker` from `env.docker.example` when using Docker Compose.

| Variable | Required | Description |
| --- | --- | --- |
| `HOST_ENV` | Yes | Host environment. Usually `production` in Docker. |
| `NODE_ENV` | Yes | Node environment. Usually `production` in Docker. |
| `DATABASE_URL` | Yes | Runtime/build PostgreSQL connection string. |
| `DD_API_KEY` | For Datadog service | Datadog API key used by `datadog-agent`. |

### Backend Env

Create `backend/.env` from `backend/env.example`.

| Variable | Required Locally | Required Outside Local | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | Usually set by scripts | Yes | `test`, `development` or `production`. |
| `PORT` | Yes | Yes | Backend HTTP port. Use `3000` for local development. |
| `HOST_ENV` | Yes | Yes | `local` or non-local host environment. |
| `DATABASE_URL` | Yes | Yes | PostgreSQL URL. Test DB name must end with `-test` when `NODE_ENV=test`. |
| `JWT_SECRET` | Yes | Yes | Secret used to sign JWT tokens. |
| `PASSWORD_SALT` | Yes | Yes | Salt used by password hashing. |
| `INITIAL_ADMIN_PASSWORD` | Yes | Yes | Password used when creating the initial `admin` account. |
| `WEBAPP_URL` | Yes | Yes | Public webapp URL used in links and shared env. |
| `BREVO_API_KEY` | No | Yes | Brevo API key for email delivery. |
| `FROM_EMAIL_NAME` | Yes | Yes | Sender display name. |
| `FROM_EMAIL_ADDRESS` | Yes | Yes | Sender email address. |
| `DEBUG` | Optional locally | Required in production outside local | Debug namespaces, for example `IdeaNick:*,-IdeaNick:prisma:*`. |
| `BACKEND_SENTRY_DSN` | No | Yes | Sentry DSN for backend errors. |
| `SENTRY_AUTH_TOKEN` | Required for Sentry release scripts | Required for release upload | Sentry auth token. |
| `SOURCE_VERSION` | No | Yes | Release/version identifier for Sentry and Docker labels. |
| `CLOUDINARY_API_KEY` | No | Yes | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | No | Yes | Cloudinary API secret. |
| `CLOUDINARY_CLOUD_NAME` | Yes | Yes | Cloudinary cloud name. |
| `S3_ACCESS_KEY_ID` | No | Yes | S3-compatible access key. |
| `S3_SECRET_ACCESS_KEY` | No | Yes | S3-compatible secret key. |
| `S3_BUCKET_NAME` | No | Yes | Bucket name for documents and certificates. |
| `S3_REGION` | No | Yes | Storage region. |
| `S3_URL` | Yes | Yes | Public S3-compatible storage base URL. |

### Backend Test Env

Create `backend/.env.test` from `backend/env.test.example` for integration tests.

```env
DATABASE_URL=postgresql://ideanick-test:ideanick-test@localhost:5432/ideanick-test?schema=public
DEBUG=
```

The test database name must end with `-test`; this is enforced by `backend/src/lib/env.ts`.

### Webapp Env

Create `webapp/.env` from `webapp/env.example`.

| Variable | Required Locally | Required Outside Local | Description |
| --- | --- | --- | --- |
| `PORT` | Yes | Yes | Vite dev/preview port. Default local value is `8000`. |
| `HOST_ENV` | Yes | Yes | `local` or non-local host environment. |
| `SOURCE_VERSION` | No | Yes | Release identifier. |
| `SENTRY_AUTH_TOKEN` | No | Required by Vite config outside local | Token for frontend sourcemap upload. |
| `VITE_BACKEND_TRPC_URL` | Yes | Yes | Backend tRPC URL used by the webapp. |
| `VITE_WEBAPP_URL` | Yes | Yes | Public webapp URL. |
| `VITE_WEBAPP_SENTRY_DSN` | No | Yes | Sentry DSN for frontend errors. |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Yes | Public Cloudinary cloud name. |
| `VITE_S3_URL` | Yes | Yes | Public S3 base URL. |

### Public Runtime Env Injection

In development, Vite exposes public env through `process.env` replacement.

In production, the backend serves `webapp/dist/index.html` and replaces the placeholder `{ replaceMeWithPublicEnv: true }` with public env values:

- keys beginning with `VITE_`
- `NODE_ENV`
- `HOST_ENV`
- `SOURCE_VERSION`

This allows a single Express server to serve both API and frontend assets.

## Database And Prisma

The database provider is PostgreSQL. Prisma schema is stored at:

```text
backend/src/prisma/schema.prisma
```

Generated Prisma client output is stored in:

```text
backend/src/generated/prisma
```

Main models:

- `User`: account data, unique `nick`, unique `email`, password hash, optional avatar, permissions.
- `Idea`: unique `nick`, auto-incremented `serialNumber`, name, description, text, images, certificate, documents, author relation and optional `blockedAt`.
- `IdeaLike`: user-to-idea like relation with a unique `[ideaId, userId]` constraint.

Permissions:

- `BLOCK_IDEAS`: can block ideas.
- `ALL`: has all permissions.

Useful Prisma commands:

```bash
pnpm b pgc
pnpm b pmd
pnpm b pmp
pnpm b pmt
```

Command meanings:

- `pnpm b pgc`: generate Prisma client.
- `pnpm b pmd`: run `prisma migrate dev`.
- `pnpm b pmp`: deploy migrations using `backend/.env.production`.
- `pnpm b pmt`: deploy migrations using `backend/.env.test`.

The backend runs `presetDb` on startup. It upserts an `admin` user, sets `permissions` to `ALL`, and creates it with `INITIAL_ADMIN_PASSWORD` if it does not already exist.

## Development Workflow

Recommended local development flow:

```bash
pnpm install
pnpm b pmd
pnpm dev
```

Run only the backend:

```bash
pnpm b dev
```

Run only the webapp:

```bash
pnpm w dev
```

Run only shared package scripts:

```bash
pnpm sh test
pnpm sh types
```

Root shortcut scripts:

- `pnpm b <script>` runs a backend script.
- `pnpm w <script>` runs a webapp script.
- `pnpm sh <script>` runs a shared package script.

## Scripts

### Root

| Script | Description |
| --- | --- |
| `pnpm dev` | Runs `dev` in all workspace packages in parallel. |
| `pnpm test` | Runs tests in all workspace packages. |
| `pnpm types` | Runs backend and webapp TypeScript checks. |
| `pnpm lint` | Runs backend and webapp ESLint. |
| `pnpm prettify` | Formats all packages in parallel. |
| `pnpm dcc` | Renders Docker Compose config with env files. |
| `pnpm dcb` | Builds Docker Compose services with env files. |
| `pnpm dcu` | Starts Docker Compose services with env files. |
| `pnpm prepare` | Installs Husky hooks. |

### Backend

| Script | Description |
| --- | --- |
| `pnpm b dev` | Builds email templates, starts backend in development with `ts-node-dev`. |
| `pnpm b test` | Runs backend Jest tests serially. |
| `pnpm b build-emails` | Compiles MJML email templates to HTML. |
| `pnpm b watch-emails` | Watches MJML templates and recompiles HTML. |
| `pnpm b build-ts` | Builds backend TypeScript output. |
| `pnpm b build` | Builds TypeScript, emails and copies email HTML into dist. |
| `pnpm b start` | Starts compiled backend in production mode. |
| `pnpm b lint` | Runs backend ESLint. |
| `pnpm b types` | Runs backend TypeScript check. |
| `pnpm b prettify` | Formats backend files. |
| `pnpm b sentry` | Creates Sentry release, injects sourcemaps and uploads sourcemaps. |

### Webapp

| Script | Description |
| --- | --- |
| `pnpm w dev` | Starts Vite dev server. |
| `pnpm w test` | Runs webapp Jest tests. |
| `pnpm w build` | Runs TypeScript build and Vite production build. |
| `pnpm w lint` | Runs webapp ESLint. |
| `pnpm w stylelint` | Runs SCSS stylelint. |
| `pnpm w stylecheck` | Compiles SCSS to catch stylesheet errors. |
| `pnpm w preview` | Serves Vite production build locally. |
| `pnpm w types` | Runs webapp TypeScript checks. |
| `pnpm w prettify` | Formats webapp files. |

### Shared

| Script | Description |
| --- | --- |
| `pnpm sh test` | Runs shared Jest tests. |
| `pnpm sh types` | Runs shared TypeScript check. |
| `pnpm sh lint` | Runs shared ESLint. |
| `pnpm sh prettify` | Formats shared files. |

## Testing

Run all tests:

```bash
pnpm test
```

Run backend tests:

```bash
pnpm b test
```

Run webapp tests:

```bash
pnpm w test
```

Run shared tests:

```bash
pnpm sh test
```

Backend integration tests use the helpers in `backend/src/test/integration.ts` and require:

- `NODE_ENV=test`
- `backend/.env.test`
- a PostgreSQL database whose name ends with `-test`
- migrations applied to the test database

Prepare test DB:

```bash
pnpm b pmt
```

The integration test setup deletes `IdeaLike`, `Idea` and `User` records before each test.

Mocks used by integration tests:

- `backend/src/lib/sentry.mock.ts`
- `backend/src/lib/emails/utils.mock.ts`
- `backend/src/lib/brevo.mock.ts`

## Code Quality

Recommended checks before committing:

```bash
pnpm types
pnpm lint
pnpm test
pnpm w stylecheck
```

Formatting:

```bash
pnpm prettify
```

Husky and lint-staged are configured. Staged `ts`, `js`, `json` and `yml` files are formatted with Prettier.

## Build And Production Runtime

Build backend:

```bash
pnpm b build
```

Build webapp:

```bash
pnpm w build
```

Start compiled backend:

```bash
pnpm b start
```

Production behavior:

- Backend starts Express on `PORT`.
- `/ping` returns `pong`.
- `/trpc` serves the tRPC API.
- Static frontend assets are served from `webapp/dist`.
- All non-static routes are handled by the frontend HTML for client-side routing.
- The backend injects public runtime env into `index.html`.
- Cron jobs start together with the backend.
- `presetDb` runs on startup and ensures the admin user exists.

## Docker

The project includes a multi-stage `Dockerfile` and `docker-compose.yml`.

Create env files:

```bash
cp env.docker.example .env.docker
cp backend/env.example backend/.env
cp webapp/env.example webapp/.env
```

Render Compose config:

```bash
pnpm dcc
```

Build image:

```bash
pnpm dcb
```

Start services:

```bash
pnpm dcu
```

Compose services:

- `app`: IdeaNick application container.
- `datadog-agent`: Datadog agent collecting container logs.

The application is exposed on:

```text
127.0.0.1:3000
```

The Docker image:

1. Uses `node:24-bookworm`.
2. Installs pnpm.
3. Fetches and installs dependencies offline from `pnpm-lock.yaml`.
4. Generates Prisma client.
5. Builds backend and webapp.
6. Runs Sentry release/sourcemap commands.
7. Prunes production dependencies.
8. Starts by running Prisma migrations and then the compiled backend.

Container startup command:

```bash
cd /app/backend && ./node_modules/.bin/prisma migrate deploy && NODE_ENV=production node ./dist/backend/src/index.js
```

## Application Architecture

### Backend Request Flow

1. `backend/src/index.ts` loads and validates env.
2. Sentry is initialized.
3. Debug namespaces are enabled from `DEBUG`.
4. App context is created.
5. `presetDb` ensures the admin user exists.
6. Express is created and CORS is enabled.
7. Passport JWT is attached.
8. tRPC routes are mounted.
9. The built webapp is served when available.
10. Cron jobs are started.
11. Central Express error handling logs unexpected errors.

### Frontend Request Flow

1. `webapp/src/main.tsx` mounts React.
2. `App` wraps pages with:
   - `HelmetProvider`
   - `TrpcProvider`
   - `AppContextProvider`
   - `BrowserRouter`
   - Sentry user tracking
   - unauthorized route tracking
3. Pages call typed tRPC hooks from `webapp/src/lib/trpc.tsx`.
4. Backend input schemas are reused directly by frontend forms where appropriate.

### Shared Package

`shared` contains cross-runtime utilities and schemas:

- Cloudinary URL helpers.
- S3 URL helpers.
- object helpers such as `pick`, `omit`, `getKeysAsArray`.
- environment helpers.
- reusable Zod schemas.

## API Overview

tRPC router is defined in `backend/src/router/index.ts`.

Available routes:

### Auth

- `getMe`: returns the current authenticated user.
- `signUp`: creates a user and returns a JWT.
- `signIn`: authenticates by nick/password and returns a JWT.
- `updatePassword`: updates current user password.
- `updateProfile`: updates profile data.

### Ideas

- `getIdeas`: paginated idea list with optional search.
- `getIdea`: fetches one idea by nick.
- `createIdea`: creates a new idea.
- `updateIdea`: updates an existing idea.
- `setIdeaLike`: likes or unlikes an idea.
- `blockIdea`: blocks an idea when the user has permission.

### Uploads

- `prepareCloudinaryUpload`: prepares Cloudinary upload data.
- `prepareS3Upload`: prepares S3-compatible upload data.

## Authentication And Permissions

Authentication uses JWT through Passport.

The frontend stores the token in a cookie:

```text
token
```

Main authorization rules:

- Anonymous users can browse public ideas and view like counts.
- Authenticated users can create ideas.
- Authenticated users can like and unlike ideas.
- Idea authors can edit their own ideas.
- Users with `BLOCK_IDEAS` or `ALL` can block ideas.
- The seeded `admin` user always has `ALL`.

## Files, Images And External Services

### Cloudinary

Cloudinary is used for:

- idea images
- avatars

Relevant env:

- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_CLOUD_NAME`

The frontend displays images through shared Cloudinary helpers.

### S3-Compatible Storage

S3-compatible storage is used for:

- idea certificates
- idea documents

Relevant env:

- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `S3_REGION`
- `S3_URL`
- `VITE_S3_URL`

The example `S3_URL` points to Yandex Object Storage:

```text
https://storage.yandexcloud.net
```

## Emails And Cron Jobs

Email templates live in:

```text
backend/src/emails
```

Templates starting with `_` are partials/includes. Public email templates are compiled with:

```bash
pnpm b build-emails
```

Compiled HTML is written to:

```text
backend/src/emails/dist
```

During backend build, compiled email HTML is copied into backend dist.

Cron behavior:

- `backend/src/lib/cron.ts` schedules a job at `10:00` on the first day of every month.
- The job calls `notifyAboutMostLikedIdeas`.
- It selects up to 10 ideas with likes from the last month.
- If at least one idea has likes, it emails all users.

## Observability

### Sentry

Backend Sentry:

- configured in `backend/src/lib/sentry.ts`
- release scripts are in `backend/package.json`
- required production env includes `BACKEND_SENTRY_DSN`, `SOURCE_VERSION` and `SENTRY_AUTH_TOKEN`

Frontend Sentry:

- configured in `webapp/src/lib/sentry.tsx`
- Vite plugin uploads sourcemaps when `SENTRY_AUTH_TOKEN` is present
- outside local env, `SOURCE_VERSION` and Sentry token are required by Vite config

### Logs

Backend logging uses:

- `winston`
- `debug`

Useful local debug value:

```env
DEBUG=IdeaNick:*,-IdeaNick:prisma:*,-IdeaNick:trpc:query:success
```

### Datadog

`docker-compose.yml` includes a `datadog-agent` service that collects container logs. It requires:

```env
DD_API_KEY=...
```

## Troubleshooting

### `DATABASE_URL` Does Not Parse

Use the correct PostgreSQL URL format:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database?schema=public
```

If you copied `backend/env.example`, check that there is only one colon after `postgresql`.

### Backend Tests Refuse To Start

Integration tests require `NODE_ENV=test`. The test database name must also end with `-test`.

Correct example:

```env
DATABASE_URL=postgresql://ideanick-test:ideanick-test@localhost:5432/ideanick-test?schema=public
```

### Webapp Cannot Reach Backend

Check `webapp/.env`:

```env
VITE_BACKEND_TRPC_URL=http://localhost:3000/trpc
```

Check that backend is running:

```bash
curl http://localhost:3000/ping
```

Expected response:

```text
pong
```

### Production Build Fails On Sentry Variables

When `HOST_ENV` is not `local`, the Vite config requires:

```env
SENTRY_AUTH_TOKEN=...
SOURCE_VERSION=...
```

Backend release scripts also require these values.

### Production Server Cannot Find Webapp Dist

Build the webapp before starting production backend:

```bash
pnpm w build
pnpm b build
pnpm b start
```

In Docker, this is handled by the image build.

### Uploads Fail Locally

For local development, several upload secrets are not required by env validation, but real uploads still need working Cloudinary/S3 credentials. Configure the corresponding secrets in `backend/.env` when testing upload flows end to end.

## Maintenance Notes

- Keep backend route input schemas in `backend/src/router/**/input.ts`; the frontend imports them for form validation and type alignment.
- Run `pnpm b pgc` after Prisma schema changes.
- Add a Prisma migration for every database schema change.
- Keep `backend/src/generated/prisma` in sync with `schema.prisma`.
- Keep public env variables prefixed with `VITE_` when the webapp needs them.
- Never expose backend-only secrets through `VITE_` variables.
- Run `pnpm b build-emails` after editing MJML templates.
- Run full checks before release:

```bash
pnpm types
pnpm lint
pnpm test
pnpm w build
pnpm b build
```

## License

No license file is currently present in this repository. Add a `LICENSE` file before distributing the project outside the intended private scope.
