<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project instructions

## Product source of truth

- Read `SPEC.md` before planning or implementing product behavior.
- `SPEC.md` is the canonical product, design, data, and deployment contract.
- Do not infer requirements from the repository name, commit history, screenshots, or external products when `SPEC.md` defines the behavior.
- User-facing copy is Korean. Repository documentation defaults to English, with Korean translations in files ending in `.ko.md`.

## Working rules

- Preserve unrelated user changes and inspect `git status` before editing.
- Never commit `.env`, credentials, service-role keys, Gmail app passwords, generated browser artifacts, or deployment state.
- Keep privileged Supabase access in server-only modules. Never import `lib/supabase/admin.ts` from a Client Component.
- Database changes must be additive, reviewable migrations under `supabase/migrations/`. Do not rewrite an applied migration; add a new numbered migration.
- Keep public event, create, and edit experiences aligned through the shared event layout and background components documented in `SPEC.md`.
- Maintain Korean-native UI terminology and accessible keyboard, focus, contrast, and reduced-motion behavior.

## Project map

- `app/`: Next.js routes, route handlers, and page composition
- `components/`: shared UI, event editor, registration UI, and backgrounds
- `lib/`: domain logic, validation, formatting, email, and Supabase clients
- `supabase/migrations/`: ordered database schema and policy migrations
- `tests/e2e/`: Playwright smoke and user-flow tests
- `SPEC.md`: implementation contract and visual QA criteria

## Verification

Run the smallest relevant check while iterating, then run the full gate before handoff:

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

If end-to-end tests require credentials or services that are unavailable, report exactly which checks were skipped and why. Do not describe unrun checks as passing.

## Documentation maintenance

- Update `README.md`, `README.ko.md`, and `.env.example` when setup, commands, environment variables, or deployment behavior changes.
- Update `SPEC.md` when product behavior or the visual contract changes.
- Keep examples free of real credentials, private URLs, and personal email addresses.
- Preserve third-party attribution. When adding or replacing vendored source, update `THIRD_PARTY_NOTICES.md` and verify that its license permits redistribution in this repository.
