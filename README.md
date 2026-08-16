# My Personal Event App

A Korean-first event web app for individual hosts to create events, share public links, collect registrations, and manage participants from one place.

[한국어 README](./README.ko.md) · [Product and implementation specification](./SPEC.md)

## Screenshots

### Event directory

![Public event directory](./docs/images/events-directory.jpg)

| Public event page | Registration panel |
| --- | --- |
| ![Public event page with an animated theme](./docs/images/event-detail.jpg) | ![Registration panel opened on an event page](./docs/images/event-registration.jpg) |

## Features

- Email/password sign-up, sign-in, and password recovery for hosts
- Event CRUD with automatically generated eight-character public URLs
- In-person locations with maps or online attendance links
- Markdown event descriptions and cover images
- Static and animated page backgrounds with live create/edit previews
- Automatic or manual approval, capacity limits, registration windows, and custom questions
- Registration, cancellation, status management, and CSV export
- Optional registration-status emails through Gmail SMTP
- Public and administrative event directories with responsive mobile layouts

## Tech stack

- Next.js 16 App Router, React 19, and TypeScript
- Supabase Auth, Postgres, Storage, and Row Level Security
- Vercel deployment
- React Hook Form, Zod, React Markdown, and MDX Editor
- React Bits-derived backgrounds, Three.js/OGL, and tsParticles
- Playwright, ESLint, and TypeScript checks

## Prerequisites

- A supported Node.js release: 22 LTS, 24 LTS, or 26+; and npm
- A Supabase project
- A Vercel account for deployment
- Optional: a Google account with 2-Step Verification and a Gmail app password for transactional email

## Local setup

```bash
git clone <YOUR_REPOSITORY_URL>
cd my-personal-event-app
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
GMAIL_USER=...                  # optional
GMAIL_APP_PASSWORD=...         # optional
```

`SUPABASE_SECRET_KEY` and the Gmail app password are server-only secrets. Never commit them or expose them through a `NEXT_PUBLIC_` variable.

### Configure Supabase

With the Supabase CLI linked, apply the checked-in migrations:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

Without the CLI, run the SQL files in `supabase/migrations/` in numeric order through the Supabase SQL Editor. The initial migration creates the public `event-covers` Storage bucket. Then configure Authentication URLs:

- Site URL: `http://localhost:3000` locally; the production origin after deployment
- Local redirect: `http://localhost:3000/auth/callback`
- Production redirect: `https://<YOUR_DOMAIN>/auth/callback`

Signing up creates an Auth user but does not grant administrator access automatically. Add each approved host's Auth UUID to `public.admin_users`:

```sql
insert into public.admin_users (user_id)
values ('AUTH_USER_UUID');
```

Row Level Security then limits each administrator to events they created. Follow the external-service section in [SPEC.md](./SPEC.md) for the complete setup procedure.

### Configure Gmail email (optional)

Enable Google 2-Step Verification, create an app password, and set `GMAIL_USER` and `GMAIL_APP_PASSWORD`. The core event and registration flows still work without these values, but delivery attempts are recorded as failed. Supabase Auth confirmation and password-reset email uses the separate SMTP configuration in Supabase.

### Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run Playwright end-to-end tests |

## Deployment

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Add all required variables from `.env.example` to the Vercel Production environment.
4. Set `NEXT_PUBLIC_APP_URL` to the production origin.
5. Add the production Site URL and callback URL in Supabase Auth settings.
6. Verify sign-up, sign-in, event creation, public links, registration, and cancellation on the deployed site.

See [SPEC.md](./SPEC.md) for the complete product contract, service configuration, and visual verification criteria.

## Repository structure

```text
app/                    Pages and API Route Handlers
components/             Shared UI and event-experience components
lib/                    Domain logic, validation, Supabase, and email
supabase/migrations/    Database schema, functions, and RLS policies
tests/e2e/              Playwright tests
SPEC.md                 Product, design, and implementation contract
```

## License

The application code is available under the [MIT License](./LICENSE). Components derived from React Bits remain subject to the upstream MIT + Commons Clause terms described in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
