# Architecture overview

## Frontend
- Next.js App Router
- Server/client split where useful
- Shared domain contracts from `@pulseml/shared`

## Backend
- Express API for local simplicity
- In-memory repository now, easy to replace with Postgres later
- Aggregates model summaries, incidents, deployments, and alerts

## Data model
Core entities:
- ModelSummary
- DriftSignal
- Alert
- Incident
- DeploymentEvent

## Planned upgrades
- NestJS or Spring Boot service split
- Postgres persistence and Prisma or TypeORM
- OpenTelemetry traces
- SSE stream for alert updates
