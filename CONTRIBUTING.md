# Contributing

Thank you for helping improve My Personal Event App.

## Before you start

1. Read `SPEC.md`; it is the product and visual source of truth.
2. Open an issue for substantial behavior, schema, or design changes before implementation.
3. Never include real credentials, private URLs, or participant information in code, fixtures, screenshots, issues, or pull requests.

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use a focused branch and keep each pull request limited to one coherent change. Database changes belong in a new, incrementally numbered file under `supabase/migrations/`; do not edit a migration that may already have been applied.

## Quality gate

Run before opening a pull request:

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Document any check that could not run and explain why. Include screenshots for visible desktop and mobile changes, and update both READMEs plus `.env.example` when setup behavior changes.

## Pull requests

- Explain the user-facing outcome and implementation scope.
- Link the relevant issue when one exists.
- Call out migrations, new environment variables, and deployment steps.
- Describe verification performed.
- Keep Korean user-facing copy natural and consistent with `SPEC.md`.
