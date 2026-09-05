<!-- bmad:context -->
<!-- Verified 2026-09-05 against 095d51e. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## data-refinery

Universal Data Refinery: a prototype of an edge data-extraction service with semantic diffing and an MCP server, live in production. TypeScript npm workspaces: a Hono worker on Cloudflare Workers AI, D1, KV, and Vectorize in `apps/worker`; a React/Vite Studio UI in `apps/web`; shared Zod schemas in `packages/schema`. The product is being rebuilt in a separate private repo; the rebuild's PRD, architecture spine (AD-1..AD-16), UX spines, spec, and epics live in `_bmad-output/`.

## Policy

- Feature work is frozen here; it lands in the private rebuild repo. This repo takes bug fixes, docs, and the agent testing exercises only.
- Never add credentials, keys, or passcodes to source or docs. The founder passcode literals in `apps/worker/src/routes/management.ts` and `apps/web/src/App.tsx` are a known defect the rebuild closes; do not copy or extend them.
- Never run `wrangler deploy` or `db:migrate:remote` from a machine; both hit production with live Stripe. Production ships only through the manual `production` job in `.github/workflows/deploy.yml`; merging to `main` deploys staging.
- Never run the scripts in `scripts/` unless asked; they are smoke tests against the production worker and create real tokens, listings, and entities.

## Where things are

- Binding design for anything new: `_bmad-output/planning-artifacts/architecture/architecture-AI-data-refinery-2026-08-29/ARCHITECTURE-SPINE.md`. Authority order when documents disagree: PRD, spine, UX spines, spec.
- Production validation exercises for AI agents: `docs/AI_AGENTS_EXPLORATORY_TESTING_GUIDE.md`.

## Running and verifying

- Local D1 setup is `npm run db:migrate:local -w apps/worker`; the script exists only in the worker workspace.
- Do not use root `npm run build` as a typecheck; it re-emits tracked `.js` and `.d.ts` files into `packages/*/src`. Use `npm run typecheck` instead.
- Run the smoke scripts, when asked, with `node scripts/<name>.ts`; Node 24+ strips the types.

## Known pitfalls

- Calls to the production worker from Python's default urllib get a Cloudflare WAF 403 on `/mcp`; send a browser-like User-Agent, or use curl.

<!-- /bmad:context -->
