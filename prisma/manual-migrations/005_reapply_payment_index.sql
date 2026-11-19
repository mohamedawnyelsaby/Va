-- 005_reapply_payment_index.sql
--
-- Re-applies ONLY the partial unique index that prevents two active payments
-- for one booking. Prisma's schema language cannot express a partial index, so
-- `prisma db push` (which runs on every Vercel production build via
-- scripts/sync-db.mjs) does not know about it and may drop it as "drift".
-- scripts/sync-db.mjs runs this file right after the push.
--
-- Idempotent: IF NOT EXISTS makes it a no-op when the index is already there.
-- If it FAILS, the booking already has more than one active payment: see the
-- duplicate-check query in 004_payment_hardening.sql and resolve those rows.

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_one_active_per_booking"
  ON "Payment" ("bookingId")
  WHERE "bookingId" IS NOT NULL
    AND status IN ('pending', 'created', 'approved', 'completed');
