# Snowsight gotchas (read once — saves hours)

These are already baked into Labs 01+03 and `sql/smoke_role_proofs.sql`. If a “should fail” query succeeds, check here first.

## 1. Secondary roles (most common)

**Symptom:** Role dropdown shows `FR_ANALYST`, but `SELECT * FROM BRONZE_LANDING.CLIENTS` returns rows (including SSN).

**Cause:** Your user also has `ROLE_BANK_LAB_ADMIN` / `ACCOUNTADMIN`. Snowsight keeps them as **secondary** roles, so privileges are the union of all of them.

**Fix — always before Alex/Jordan/Sam proofs:**

```sql
USE ROLE FR_ANALYST;
USE SECONDARY ROLES NONE;
SELECT CURRENT_ROLE(), CURRENT_SECONDARY_ROLES();  -- FR_ANALYST + NONE
```

Then re-run the vault query — expect insufficient privileges.

## 2. Do not “Run All” across a role switch

Worksheet setup must run as `ROLE_BANK_LAB_ADMIN`. Proof lines switch to `FR_*`.  
If you Run All, later grants may run as Alex and fail, or proofs run with the wrong session state.

**Pattern:** Run setup block → stop → run proof block alone.

## 3. UI role vs `USE ROLE`

The top-right role chip updates after `USE ROLE`, but secondary roles can still be on. Trust `CURRENT_SECONDARY_ROLES()`, not the chip alone.

## 4. Privilege errors on CREATE ROLE / POLICY / TASK / SHARE

Run `sql/00_privilege_repair.sql` as `ACCOUNTADMIN` (also Lab Step 0).

## 5. Lab 13 ACCOUNT_USAGE lag

Metering/query history views can lag ~1–3 hours. Empty results ≠ broken SQL.

## Smoke test

After Lab 01: run `sql/smoke_role_proofs.sql` statement-by-statement.  
Expected: SILVER_CURATED view OK; BRONZE_LANDING as analyst FAIL; engineer/compliance BRONZE_LANDING OK.
