# PulseML Advanced Codex Scaffold

An advanced starter scaffold for a model observability platform tailored to ML platform and visualization workflows.

## What this includes
- Next.js frontend with Overview, Models, Incidents, and Deployments pages
- Express + TypeScript API with realistic seeded observability data
- Shared domain types package
- Docker Compose for local Postgres
- Codex-ready `AGENTS.md` guidance and project config

## Local development

### Requirements
- Node.js 20+
- npm 10+
- Docker Desktop or Docker Engine (optional, for Postgres)

### Install
```bash
npm install
```

### Run the app
```bash
npm run dev
```

This starts:
- web: `http://localhost:3000`
- api: `http://localhost:4000`

The scaffold works in **demo mode** by default using in-memory seeded data, so you can test it locally without Postgres.

### Optional: run Postgres
```bash
docker compose up -d postgres
```

Then add a `.env` file in `apps/api` if you want to wire persistence later.

## Monorepo structure
```text
apps/
  web/        Next.js UI
  api/        Express API
packages/
  shared/     Shared types and helpers
infra/        Docker and future Terraform placeholders
docs/         Architecture and roadmap notes
```

## Useful commands
```bash
npm run dev
npm run build
npm run typecheck
npm run seed
```

## Suggested Codex prompts
See `docs/codex-prompts.md`.
