-- 004_payment_hardening.sql
--
-- Run ONCE on the production database (Supabase SQL editor / psql) AFTER the
-- deploy that adds the new Payment columns and the PaymentEvent table
-- (`prisma db push` creates those automatically; it cannot create the partial
-- unique index below, which is why this file exists).
--
-- 1) DB-level guarantee: a booking can have at most ONE active payment.
--    "Active" = pending / created / approved / completed.
--    cancelled / failed / refunded payments do not count, so a user can retry
--    after a failure.
--
-- Before creating the index, check for existing violations (must return 0 rows):
--
--   SELECT "bookingId", count(*)
--   FROM "Payment"
--   WHERE "bookingId" IS NOT NULL
--     AND status IN ('pending','created','approved','completed')
--   GROUP BY "bookingId" HAVING count(*) > 1;
--
-- If it returns rows, resolve those duplicates by hand first (cancel the
-- extra pending ones) - the CREATE INDEX will fail otherwise.

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_one_active_per_booking"
  ON "Payment" ("bookingId")
  WHERE "bookingId" IS NOT NULL
    AND status IN ('pending', 'created', 'approved', 'completed');

-- 2) Only valid statuses can ever be stored.
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_status_valid";
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_status_valid"
  CHECK (status IN ('pending','created','approved','completed','refunded','cancelled','failed'))
  NOT VALID;
-- NOT VALID so legacy rows do not block the migration; once you have checked
-- there are none outside the list, enforce it for all rows:
--   ALTER TABLE "Payment" VALIDATE CONSTRAINT "Payment_status_valid";
