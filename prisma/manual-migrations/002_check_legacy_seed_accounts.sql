-- prisma/manual-migrations/002_check_legacy_seed_accounts.sql
--
-- Before 2026-08-25, POST /api/seed had no real auth check (the "secret" it
-- checked was hardcoded in this public repo) and always created:
--   admin@vatravel.com / password123   (role = admin)
--   user@vatravel.com  / password123
--
-- If that endpoint was ever called against your production database before
-- the fix, these accounts are still sitting there with a known password and
-- admin rights. Run this ONCE against production (Supabase SQL editor / psql).

-- 1) Check whether they exist:
SELECT id, email, role, "isActive", "createdAt"
FROM "User"
WHERE email IN ('admin@vatravel.com', 'user@vatravel.com');

-- 2) If the query above returned 0 rows, you're clean — stop here, nothing
--    to do. If it returned rows, pick ONE of the following:

-- 2a) Safer option: just kill the known password and demote/deactivate so
--     the accounts can't be used, but keep any bookings/history intact.
--     (Uncomment to run.)

-- UPDATE "User"
-- SET password = NULL, role = 'user', "isActive" = false
-- WHERE email = 'admin@vatravel.com';
--
-- UPDATE "User"
-- SET password = NULL, "isActive" = false
-- WHERE email = 'user@vatravel.com';

-- 2b) Nuclear option: delete them outright, IF they have no bookings/
--     payments/reviews you care about (check first — this cascades per your
--     schema's onDelete rules).

-- DELETE FROM "User" WHERE email IN ('admin@vatravel.com', 'user@vatravel.com');

-- 3) Whichever you pick, also make sure ALLOW_PROD_SEED is NOT set to
--    "true" in your production environment (Vercel/Railway), so
--    POST /api/seed stays disabled in production going forward.
