# Meridian Bank — object names

## Medallion = interview language

| Classic name | Meridian schema | Meaning |
|--------------|-----------------|--------|
| **Bronze** | `BRONZE_LANDING` | Raw dock — as-landed data |
| **Silver** | `SILVER_CURATED` | Cleaned / governed / staging+facts |
| **Gold** | `GOLD_MART` | Report-ready aggregates for Finance |

Say in interviews: *“Our bronze is BRONZE_LANDING, silver is SILVER_CURATED, gold is GOLD_MART.”*

## Core objects

| Purpose | Name |
|---------|------|
| Database | `MERIDIAN_BANK` |
| Warehouse | `WH_BANK_XS` |
| Lab / architect role | `ROLE_BANK_LAB_ADMIN` |
| Risk / policies | `RISK_CTRL` |
| File stage | `FILE_IN` |
| Helpers | `UTILS` |
| Clients table | `BRONZE_LANDING.CLIENTS` |
| Safe directory view | `SILVER_CURATED.V_CLIENT_DIRECTORY` |
| Txn events | `BRONZE_LANDING.TXN_EVENTS` |
| Access key-rings | `AR_BRONZE_LANDING_READ`, `AR_SILVER_CURATED_READ`, `AR_PII_READ` |

## Cast

| Character | Job |
|-----------|-----|
| **Elena Vasquez** | Snowflake Architect (you) |
| **Marcus Hale** | COO |
| **Alex Rivera** | Business Analyst |
| **Jordan Okonkwo** | Data Engineer |
| **Sam Okada** | Risk & Compliance |
| **Nora Patel** | Partner credit union (sharing) |
| **Dev** | QA / clone environment |

## Role prefixes

- `FR_` = Functional Role (job badge)
- `AR_` = Access Role (key-ring)

## Already built Labs 00–03 with old names?

Run `sql/migrate_medallion_schema_names.sql`, then update local `dbt_project/profiles.yml` schema to `SILVER_CURATED`.
