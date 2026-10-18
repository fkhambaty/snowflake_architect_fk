-- ============================================================
-- SMOKE: Lab 03 masking + RAP (run after sql/03_masking_rap.sql)
-- STATEMENT BY STATEMENT. Needs USE SECONDARY ROLES NONE.
-- ============================================================

USE ROLE FR_ANALYST;
USE SECONDARY ROLES NONE;
USE WAREHOUSE WH_BANK_XS;
USE DATABASE MERIDIAN_BANK;

SELECT CLIENT_ID, EMAIL, COUNTRY
FROM SILVER_CURATED.CLIENTS_GOV
ORDER BY CLIENT_ID;
-- EXPECT: email masked (***@...); only US rows (per RAP entitlements)

USE ROLE FR_COMPLIANCE;
USE SECONDARY ROLES NONE;

SELECT CLIENT_ID, EMAIL, COUNTRY
FROM SILVER_CURATED.CLIENTS_GOV
ORDER BY CLIENT_ID;
-- EXPECT: plain email; US + CA + UK rows

USE ROLE ROLE_BANK_LAB_ADMIN;
SELECT 'smoke_lab03_policies done' AS status;
