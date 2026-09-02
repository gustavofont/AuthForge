# AuthForge

Generic, reusable Authentication & Authorization microservice built with NestJS, TypeScript, PostgreSQL and TypeORM. It handles authentication, sessions and RBAC only — no business-domain logic — so it can be consumed by any web, mobile or backend client.

## Features

- JWT access + refresh tokens (refresh rotates on every use), Argon2 password hashing
- Sessions per login (device, IP, hashed refresh token, expiry) with list/revoke/revoke-all
- RBAC: roles, permissions, role→permission and user→role assignments, `@Roles()`/`@Permissions()` guards
- Password change / forgot / reset flows, with a swappable `EmailProvider` abstraction — publishes to a RabbitMQ mail queue by default (`MailForgeEmailProvider`, consumed by the sibling MailForge service); a console-logging stub (`ConsoleEmailProvider`) ships alongside it for running without RabbitMQ configured
- Account lockout after repeated failed logins, throttling on `/auth/login`, Helmet, CORS, global validation
- Centralized error handling (no internal errors leaked) and centralized logging
- Swagger docs, TypeORM migrations, Jest unit tests, Docker/Docker Compose

## Getting started

```bash
cp .env.example .env
npm install
npm run dev:full   # starts Postgres in Docker + the API in watch mode (runs pending migrations on boot)
```

`dev:full` is `docker:db` (Postgres only, in Docker) followed by `start:dev` (API on the host). Use them separately if you want the API and database lifecycles apart, or point `POSTGRES_HOST`/`POSTGRES_PORT`/`POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` at your own Postgres instead.

API: `http://localhost:3000` · Swagger docs: `http://localhost:3000/docs`

### Bootstrapping the first user

Every write endpoint is RBAC-protected — including user creation — so the very first ADMIN user must be seeded:

```bash
npm run seed                              # creates ADMIN/MANAGER/USER roles + base permissions
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=ChangeMe123 npm run seed   # also creates the first admin
```

Then log in with `POST /auth/login` to get a token pair.

## Running with Docker

All Docker assets live under [`docker/`](docker/) (`Dockerfile`, `docker-compose.yml`, `Dockerfile.dockerignore`). The compose file's build context and `env_file` point back at the repo root (`..`), so run it from the repository root:

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

Builds the API image and starts `api` + `postgres`. Both containers read the same `POSTGRES_*` variables from the root `.env` via `env_file` — the `api` service only overrides `POSTGRES_HOST` to `postgres` (the container's network hostname). Migrations run automatically on boot. Run `npm run seed` locally (pointed at the compose Postgres — it listens on `localhost:5432` per the default `.env`) to bootstrap roles/permissions/admin.

Tip: `alias dc='docker compose -f docker/docker-compose.yml'` avoids repeating the `-f` flag.

## Scripts

| Command | Description |
| --- | --- |
| `npm run docker:db` | Start only the Postgres container (Docker) |
| `npm run dev:full` | `docker:db` + `start:dev` — database in Docker, API on the host, watch mode |
| `npm run start:dev` | Start the API in watch mode (expects a reachable Postgres) |
| `npm run build` | Compile to `dist/` |
| `npm run lint` | ESLint (with `--fix`) |
| `npm test` | Run unit tests |
| `npm run migration:generate -- src/database/migrations/Name` | Generate a migration from entity changes |
| `npm run migration:run` / `migration:revert` | Apply / roll back migrations |
| `npm run seed` | Seed roles/permissions (and optionally the first admin) |

## Architecture

```
docker/       Dockerfile, docker-compose.yml, Dockerfile.dockerignore (build context = repo root)
src/
  common/     decorators, exceptions, filters, guards, interceptors, logger, shared interfaces
  config/     ConfigModule, env validation, JWT signing options
  database/   TypeORM wiring, migrations, seeds
  modules/
    auth/         login, logout, refresh, forgot/reset/change password, JWT strategy
    users/         user CRUD, role assignment
    roles/          role CRUD, permission assignment
    permissions/   permission CRUD + the Role↔Permission↔User join entities (RolePermission, UserRole)
    sessions/       session listing/revocation
    email/          EmailProvider abstraction; MailForgeEmailProvider (default, RabbitMQ) and ConsoleEmailProvider (stub) implementations
```

Each module keeps its own controllers/services/repositories/entities/dtos/interfaces; cross-module RBAC lookups go through exported service interfaces (`IUserRolesService`, `IRolePermissionsService`), not raw repositories.

## Notable design choices

- **Refresh tokens are JWTs** (`{sub, sessionId}`) signed with a separate secret/expiry; only their Argon2 hash is persisted, and every refresh rotates the stored hash.
- **JWT signing is HS256 by default**; setting `JWT_PUBLIC_KEY`/`JWT_PRIVATE_KEY` switches to RS256 with no code changes.
- **`PATCH /users/:id`** with `{"isActive": false}` deactivates a user (blocks login); **`DELETE /users/:id`** soft-deletes the record.
- Endpoints beyond the original spec, added because RBAC/password-change had no route otherwise: `POST /auth/change-password`, `POST/DELETE /users/:id/roles(/:roleId)`, `POST/DELETE /roles/:id/permissions(/:permissionId)`.
- **Forgot/reset-password emails go out via RabbitMQ**, not directly over SMTP — `MailForgeEmailProvider` publishes to a `mail.queue` that a sibling MailForge service consumes and actually sends (same generic, template-driven mail service other projects in this ecosystem share). Needs `RABBITMQ_URL` pointed at a reachable broker and `FRONTEND_URL` set (used to build the link embedded in the email) — see `.env.example`. Without a broker reachable, publishing fails silently (best-effort, matches `POST /auth/forgot-password` always returning 200 regardless of delivery).
