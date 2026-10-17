-- ============================================================
-- CLEANUP: undo Labs 00 + 01 (Meridian Bank workshop)
-- Run as ACCOUNTADMIN. Safe to re-run.
-- Does NOT drop later-lab objects if you never built them.
-- ============================================================

USE ROLE ACCOUNTADMIN;

-- 1) Lab 01 job badges + key-rings (must drop before lab admin if owned by it)
DROP ROLE IF EXISTS FR_ANALYST;
DROP ROLE IF EXISTS FR_DATA_ENGINEER;
DROP ROLE IF EXISTS FR_COMPLIANCE;
DROP ROLE IF EXISTS AR_LANDING_READ;
DROP ROLE IF EXISTS AR_CURATED_READ;
DROP ROLE IF EXISTS AR_PII_READ;
DROP ROLE IF EXISTS AR_RAW_READ;           -- old SnowShop name, if present
DROP ROLE IF EXISTS ROLE_BANK_SMOKE_TMP;
DROP ROLE IF EXISTS ROLE_ARCH_SMOKE_TMP;   -- old name, if present

-- 2) Database (views, tables, schemas go away with it)
DROP DATABASE IF EXISTS MERIDIAN_BANK;
DROP DATABASE IF EXISTS ARCH_INTERVIEW;   -- old SnowShop DB, if present

-- 3) Warehouse
DROP WAREHOUSE IF EXISTS WH_BANK_XS;
DROP WAREHOUSE IF EXISTS WH_ARCH_XS;      -- old name, if present

-- 4) Lab architect role last
DROP ROLE IF EXISTS ROLE_BANK_LAB_ADMIN;
DROP ROLE IF EXISTS ROLE_ARCH_LAB_ADMIN;  -- old name, if present

SELECT 'Labs 00 + 01 cleanup complete' AS status;
