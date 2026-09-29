# Establishing a migration baseline

This project has been running on `prisma db push` (the schema is pushed
straight to the database, no history kept). That means:

- `npm run db:migrate` (`prisma migrate deploy`) does nothing — there is no
  `prisma/migrations/` folder for it to deploy.
- There's no record of how the schema got to its current shape, and no safe,
  reviewable way to apply the next schema change to production.

I can't do this step for you — it requires a live connection to your actual
database (Supabase), which this environment doesn't have. Here's the exact
sequence to run yourself, once:

## 1. Point Prisma at your database

Make sure `DATABASE_URL` (and `DIRECT_URL`, if you use one) in your local
`.env` point at your **real** database — the same one the app is running
against in production, or a copy of it. Baselining against the wrong
database just creates a migration history that doesn't match reality.

## 2. Create the baseline migration

```bash
npx prisma migrate dev --name baseline --create-only
```

`--create-only` generates the SQL without applying it. Prisma will diff the
current schema.prisma against an empty shadow database and write out a
migration that recreates everything — open the generated
`prisma/migrations/<timestamp>_baseline/migration.sql` and skim it once.

## 3. Mark it as already applied

Since your real database already has all these tables (they got there via
`db push`), don't actually run the migration — tell Prisma it's already
applied:

```bash
npx prisma migrate resolve --applied "<timestamp>_baseline"
```

(use the exact folder name Prisma generated in step 2)

## 4. Commit the migration folder

```bash
git add prisma/migrations
git commit -m "Add baseline migration"
```

`.gitignore` no longer excludes `prisma/migrations/` (I removed that line),
so this will actually get tracked now.

## 5. From now on

- For schema changes: `npx prisma migrate dev --name <description>` instead
  of `prisma db push`. This keeps building real history.
- `npm run db:migrate` (`prisma migrate deploy`) now actually works and is
  what your CI/deploy pipeline should run before starting the app.
- The two schema changes in this session (`User.resetTokenHash` /
  `resetTokenExpiry` for password reset) aren't in the database yet either
  — once you've baselined, run `npx prisma migrate dev --name password_reset`
  to add them properly, instead of `db push`.
