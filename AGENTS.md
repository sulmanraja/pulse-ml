# PulseML Advanced Codex Guide

## Product purpose
PulseML is an internal ML observability platform for ML engineers, data scientists, and platform teams. The product helps users move from high-level signals to root-cause analysis with fast drill-down workflows.

## Primary workflows
1. See the overall health of production ML models.
2. Detect drift, latency regressions, cost spikes, and incident trends.
3. Correlate health regressions with deployments or data quality changes.
4. Track alert ownership and incident resolution.
5. Preserve operational context through annotations and saved views.

## Architecture rules
- `apps/web` is a Next.js app responsible for presentation and interaction only.
- `apps/api` owns domain aggregation, filtering, and mutation logic.
- Shared domain types must live in `packages/shared`.
- Do not duplicate domain models in frontend-only types unless they are view models.
- Prefer adding derived metrics in the API, not the UI.

## UX rules
- This is a dense internal tool, not a marketing site.
- Every page should support filtering by model, environment, or time window.
- Charts and tables must answer operational questions.
- New views should allow users to move from summary to detail in 2 to 3 interactions.
- Always add loading, empty, and error states.

## Domain rules
- Model health includes latency, error rate, traffic, cost, and drift.
- Drift can be feature drift, prediction drift, or slice-level drift.
- Alerts require severity, status, owner, timestamp, and impacted model.
- Incidents must link to impacted models and suspected causes.
- Deployments should be correlatable with incidents and health changes.

## Coding preferences
- Use TypeScript everywhere.
- Prefer server-side filtering and pagination for large datasets.
- Use composable UI components and avoid page-local duplication.
- Validate all API inputs.
- Keep seed data realistic and easy to extend.
- Add tests when implementing new mutations or filtering logic.

## Enhancement roadmap
1. Add auth and RBAC.
2. Persist saved views in Postgres.
3. Add deployment timeline correlation across overview and incidents.
4. Add OpenTelemetry instrumentation for web and API.
5. Add streaming alerts via SSE or WebSockets.
6. Add LLM evaluation and cost panels.
7. Add feature lineage and data quality views.

## Codex task patterns
- When adding a new domain entity, update `packages/shared` first.
- When adding a page, update nav, API route integration, seed data, and tests.
- When adding a chart or metric tile, include the operational question it answers.
- When changing incident or alert status, preserve auditability through timestamps and actor fields.
- Do not introduce breaking API changes without updating the README and architecture docs.

## Definition of done
A feature is done when:
- types are shared and consistent,
- API and UI both compile,
- empty/error/loading states exist,
- README or docs are updated if workflows change,
- the feature fits the product purpose above.
