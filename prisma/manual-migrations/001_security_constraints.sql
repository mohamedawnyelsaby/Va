-- prisma/manual-migrations/001_security_constraints.sql
--
-- Constraints that back the security fixes in the "security-fixes" PR.
-- The repo does not track prisma/migrations, so run this ONCE against your
-- production database (Supabase SQL editor / psql) — or just run
-- `npx prisma db push` if you are comfortable with it — BEFORE relying on
-- them. The application code works with or without these constraints; with
-- them, the database itself refuses duplicates even under concurrent requests.
--
-- 1) Look for existing duplicates first (each query should return 0 rows):
--
--   SELECT "piPaymentId", COUNT(*) FROM "Payment" WHERE "piPaymentId" IS NOT NULL GROUP BY 1 HAVING COUNT(*) > 1;
--   SELECT "piTxid",      COUNT(*) FROM "Payment" WHERE "piTxid"      IS NOT NULL GROUP BY 1 HAVING COUNT(*) > 1;
--   SELECT "userId","itemId","itemType", COUNT(*) FROM "Review" GROUP BY 1,2,3 HAVING COUNT(*) > 1;
--
-- 2) Then apply:

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_piPaymentId_key" ON "Payment" ("piPaymentId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_piTxid_key"      ON "Payment" ("piTxid");
CREATE UNIQUE INDEX IF NOT EXISTS "Review_userId_itemId_itemType_key" ON "Review" ("userId", "itemId", "itemType");

-- 3) Make yourself an admin (needed to create/edit hotels, attractions,
--    restaurants and cities through the API):
--
--   UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
