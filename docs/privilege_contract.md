# Privilege contract (prevent Lab privilege errors)

Every lab that creates roles, policies, or account objects must satisfy this checklist **before** it ships.

## Lab admin role: `ROLE_ARCH_LAB_ADMIN`

Granted in Lab 00 (`sql/00_bootstrap.sql`) by `ACCOUNTADMIN`:

| Privilege | Why |
|-----------|-----|
| `CREATE ROLE` on ACCOUNT | Create FR_* / AR_* / future policy helper roles |
| `USAGE` + `OPERATE` on `WH_ARCH_XS` **WITH GRANT OPTION** | Pass warehouse usage to functional roles |
| `OWNERSHIP` on `ARCH_INTERVIEW` | Create schemas/tables/views; grant SELECT to access roles |
| Role granted to the student’s user | So they can `USE ROLE ROLE_ARCH_LAB_ADMIN` |

## Author checklist (before publishing any new lab)

1. List every statement that needs account-level rights (`CREATE ROLE`, network policy, security integration, etc.).
2. Either:
   - grant that right to `ROLE_ARCH_LAB_ADMIN` in Lab 00 bootstrap + repair script, **or**
   - put those statements in an explicit `USE ROLE ACCOUNTADMIN` block in the lab HTML.
3. Add a **smoke test** that fails early (create+drop throwaway object) before the long script.
4. Embed the same SQL in HTML that lives in `sql/` (no drift).
5. If a student may have old bootstrap, add a **Step 0 repair** that is safe to re-run.

## Student recovery

- Error contains `CREATE ROLE` / `Insufficient privileges` on ACCOUNT → run `sql/00_privilege_repair.sql` as `ACCOUNTADMIN` (also Lab 01 Step 0).
- Re-run the lab script only after smoke test status = OK.
