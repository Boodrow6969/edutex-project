# AGENTS.md

## Cursor Cloud specific instructions

### Overview

EduTex is a Next.js 15 + TypeScript instructional design workspace backed by PostgreSQL 16 (via Docker) and Prisma 7. See `README.md` and `docs/SETUP.md` for full setup steps and project structure.

### Services

| Service | Command | Port |
|---------|---------|------|
| PostgreSQL 16 | `sudo docker compose up -d` | 5433 |
| Next.js dev server | `npm run dev` | 3000 |

### Key gotchas

- **Auth bypass**: Set `SKIP_AUTH="true"` in `.env` to bypass OAuth login in development. This auto-creates a dev user (`dev@edutex.local`). Without this or configured OAuth credentials, `/workspace/*` routes redirect to the sign-in page.
- **Docker-in-Docker**: This environment runs inside a container. Docker must be started with `sudo dockerd` (or `sudo nohup dockerd > /tmp/dockerd.log 2>&1 &`) before `docker compose up -d`. Use `fuse-overlayfs` storage driver and `iptables-legacy`.
- **Prisma migrations are gitignored**: `prisma/migrations/` is in `.gitignore`. Run `npx prisma migrate dev --name <name>` to create and apply migrations from the schema. Run `npx prisma generate` after any schema changes.
- **pg-native warning**: The `Can't resolve 'pg-native'` warning in dev server output is harmless (optional native bindings for the `pg` package).
- **Production build known issue**: `npm run build` fails due to NextAuth.js v5 beta + Prisma static generation incompatibility. Use `npm run dev` for development (see `docs/SETUP.md`).
- **Test editor deprecated**: The old `/workspace/test-editor` page redirects to a notice. Use the full workflow: create workspace -> create course -> use storyboard/pages.

### Common commands

- **Lint**: `npm run lint`
- **Dev server**: `npm run dev`
- **Prisma generate**: `npx prisma generate`
- **Prisma migrate**: `npx prisma migrate dev --name <description>`
- **Prisma studio**: `npx prisma studio` (DB GUI on port 5555)
- **Seed**: `npm run seed`
