-- 004_payment_hardening.sql
--
-- RUN THIS FIRST, in the Supabase SQL editor, if the Vercel build log shows
-- "[sync-db] schema sync failed ... CONTINUING THE BUILD without a schema
-- sync". Prisma's `db push` refuses to add the new UNIQUE columns without
-- --accept-data-loss (it warns even though the columns are brand new and
-- empty), so the app code can be deployed while these columns are missing.
-- Everything below is idempotent (IF NOT EXISTS) and only ADDS things.

-- 0) Columns / table the code already expects (mirrors prisma/schema.prisma)
ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "idempotencyKey"     TEXT,
  ADD COLUMN IF NOT EXISTS "refundRequestedAt"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "refundProcessingAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "refundedAt"         TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "refundReason"       TEXT,
  ADD COLUMN IF NOT EXISTS "refundAmount"       DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "refundTxid"         TEXT,
  ADD COLUMN IF NOT EXISTS "refundedBy"         TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_idempotencyKey_key" ON "Payment" ("idempotencyKey");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_refundTxid_key"     ON "Payment" ("refundTxid");
CREATE INDEX        IF NOT EXISTS "Payment_refundRequestedAt_idx" ON "Payment" ("refundRequestedAt");

CREATE TABLE IF NOT EXISTS "PaymentEvent" (
  "id"         TEXT NOT NULL,
  "paymentId"  TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus"   TEXT NOT NULL,
  "actor"      TEXT NOT NULL,
  "reason"     TEXT,
  "metadata"   JSONB,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PaymentEvent_paymentId_createdAt_idx" ON "PaymentEvent" ("paymentId", "createdAt");
CREATE INDEX IF NOT EXISTS "PaymentEvent_toStatus_idx" ON "PaymentEvent" ("toStatus");

DO $$ BEGIN
  ALTER TABLE "PaymentEvent"
    ADD CONSTRAINT "PaymentEvent_paymentId_fkey"
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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
