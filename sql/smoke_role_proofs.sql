-- ============================================================
-- SMOKE: Meridian Bank role proofs (Labs 01 + 03 prerequisites)
-- Run STATEMENT BY STATEMENT (not Run All).
-- Expect FAIL on the analyst→landing step. That failure = success.
-- ============================================================

-- --- A) Context check as Alex ---
USE ROLE FR_ANALYST;
USE SECONDARY ROLES NONE;
USE WAREHOUSE WH_BANK_XS;
USE DATABASE MERIDIAN_BANK;

SELECT CURRENT_ROLE() AS primary_role,
       CURRENT_SECONDARY_ROLES() AS secondary_roles;
-- EXPECT: primary_role = FR_ANALYST, secondary empty / NONE

-- --- B) Window OK ---
SELECT * FROM CURATED.V_CLIENT_DIRECTORY ORDER BY CLIENT_ID;
-- EXPECT: rows without EMAIL / SSN_LAST4

-- --- C) Vault FAIL (celebrate the error) ---
SELECT * FROM LANDING.CLIENTS;
-- EXPECT ERROR: insufficient privileges
-- If this RETURNS ROWS → you forgot USE SECONDARY ROLES NONE

-- --- D) Jordan OK ---
USE ROLE FR_DATA_ENGINEER;
USE SECONDARY ROLES NONE;
SELECT CLIENT_ID, EMAIL FROM LANDING.CLIENTS ORDER BY CLIENT_ID LIMIT 5;
-- EXPECT: 5 rows

-- --- E) Sam OK ---
USE ROLE FR_COMPLIANCE;
USE SECONDARY ROLES NONE;
SELECT CLIENT_ID, SSN_LAST4 FROM LANDING.CLIENTS ORDER BY CLIENT_ID;
-- EXPECT: SSN_LAST4 visible

-- --- F) Back to architect for later labs ---
USE ROLE ROLE_BANK_LAB_ADMIN;
USE WAREHOUSE WH_BANK_XS;
USE DATABASE MERIDIAN_BANK;
SELECT 'smoke_role_proofs done — analyst vault block is the critical check' AS status;
