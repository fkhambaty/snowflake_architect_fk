# Privilege contract (Meridian Bank course)

## `ROLE_BANK_LAB_ADMIN` must have (from Lab 00 / repair)

| Privilege | Labs |
|-----------|------|
| `CREATE ROLE` on ACCOUNT | 01+ |
| `USAGE`/`OPERATE` on `WH_BANK_XS` **WITH GRANT OPTION** | 01+ |
| `OWNERSHIP` on `MERIDIAN_BANK` | all |
| `APPLY MASKING POLICY` on ACCOUNT | 03 |
| `APPLY ROW ACCESS POLICY` on ACCOUNT | 03 |
| `EXECUTE TASK` on ACCOUNT | 05 |
| `CREATE SHARE` on ACCOUNT | 10 |

## Author rules before shipping a lab

1. List account-level statements; grant in bootstrap **and** repair SQL **and** lab Step 0.
2. Prefer object ownership over over-granting.
3. Smoke test: create+drop throwaway object when possible.
4. Explain box before every copy chunk.
5. Idempotent where possible (`IF NOT EXISTS`, delete demo keys, `CREATE OR REPLACE`).
6. Do not require second cloud account/region for a “pass” — optional advanced only.
7. HTML SQL must match `sql/*.sql` sources.
8. Every lab: Business problem → Solution → Elena wrap-up (what she did + outcome).

## Student recovery

Error mentions privileges / CREATE ROLE / APPLY / EXECUTE TASK / SHARE → Step 0 as `ACCOUNTADMIN` (`sql/00_privilege_repair.sql`).

Privilege proof “succeeds when it should fail” → `USE SECONDARY ROLES NONE` — see `docs/SNOWSIGHT_GOTCHAS.md`.

## Smoke tests (run statement-by-statement)

| After | Script | Critical expect |
|-------|--------|-----------------|
| Lab 01 | `sql/smoke_role_proofs.sql` | `FR_ANALYST` + `NONE` → landing SELECT **errors** |
| Lab 03 | `sql/smoke_lab03_policies.sql` | Alex masked/US-only; Sam plain/more countries |

## Author invariant check

```powershell
powershell -File scripts/check_lab_invariants.ps1
```

Fails if any `USE ROLE FR_*` in labs/SQL is missing a nearby `USE SECONDARY ROLES NONE`, or if lab HTML reintroduces SnowShop names.

## Cleanup Labs 00–01

`sql/cleanup_lab00_lab01.sql` as `ACCOUNTADMIN` (drops Meridian Bank objects and old SnowShop names if present).
