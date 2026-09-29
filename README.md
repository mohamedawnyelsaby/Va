# Va Travel

A bilingual (English/Arabic) travel platform for hotel, restaurant, and
attraction bookings, paid for with [Pi Network](https://minepi.com)
cryptocurrency. Built with Next.js, and includes an AI travel assistant
("Logy").

## Features

- 🏨 **Hotel booking** — search, room selection, date-based pricing
- 🍽️ **Restaurants** & 🗺️ **attractions** — browsing and reviews
- 💳 **Pi Network payments** — booking payments, wallet, cashback
- 🤖 **Logy AI assistant** — chat-based trip planning (Gemini, with an
  OpenAI fallback), backed by real hotel search results via RapidAPI
- 🌐 **Bilingual** — English and Arabic (`/en/...`, `/ar/...` routes)
- 👤 Accounts via email/password, Pi Network, or Google

## Tech stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth (credentials, Pi Network, Google)
- **Payments**: Pi Network Platform API
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Email**: SendGrid
- **Deploy**: Vercel (primary), with a Dockerfile for Railway/self-hosting

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values you need — see comments in the file
npm run db:push              # or see prisma/manual-migrations/003_baseline_instructions.md
npm run dev
```

Open http://localhost:3000. The `.env.example` file documents which
variables are required vs optional, including the Pi Network sandbox keys
needed to test payments locally, and the `PI_PER_<CURRENCY>` conversion
rates required before any Pi payment will actually process.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run test` | Run the test suite (Vitest) |
| `npm run lint` | Lint |
| `npm run db:push` | Push the Prisma schema to your database (no migration history) |
| `npm run db:migrate` | Apply migrations (`prisma migrate deploy`) — only works once a migration history exists, see `prisma/manual-migrations/003_baseline_instructions.md` |

## Project structure

```
src/
├── app/
│   ├── [locale]/         # Localized pages (en/ar): hotels, bookings, auth, dashboard, ...
│   └── api/               # Route handlers: bookings, payments, auth, AI assistant, ...
├── components/            # Shared UI + providers (Pi Network SDK, auth)
├── lib/                    # Business logic: pricing, payments, auth, email, rate limiting
└── types/                  # Shared TypeScript types

prisma/
├── schema.prisma
├── manual-migrations/      # One-off SQL/instructions that aren't Prisma migrations
└── seed.ts                 # Dev seed data (gated behind SEED_SECRET; disabled in prod by default)
```

## Deployment

- **Vercel**: connect the repo; Vercel builds directly (the `output: 'standalone'`
  setting in `next.config.mjs` is only used by the Docker build path, Vercel
  ignores it).
- **Docker / Railway**: `Dockerfile` builds a standalone Next.js server.
  `docker-compose.yml` is available for local container testing.

Either way, set `PI_SANDBOX=false` and use production Pi Network keys before
going live — see the comments in `.env.example`.

## Contributing

Pull requests welcome. Please run `npm run lint`, `npx tsc --noEmit`, and
`npm run test` before opening one — CI runs all three plus a full build.

## License

MIT
