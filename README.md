# Meridian Bank — Snowflake Architect Interview Prep

You are **Elena Vasquez**, Snowflake Architect at **Meridian Bank**. Each lab is a business problem → Snowflake/dbt solution → Elena explains the outcome.

## Open the course (HTML)

**GitHub Pages:** https://fkhambaty.github.io/snowflake_architect_fk/

Local: open `docs/index.html`  
Repo: [fkhambaty/snowflake_architect_fk](https://github.com/fkhambaty/snowflake_architect_fk)

**Start here:** [docs/story.html](docs/story.html) → Lab 00.

## Naming (bank story)

| Object | Name |
|--------|------|
| Database | `MERIDIAN_BANK` |
| Warehouse | `WH_BANK_XS` |
| Architect role | `ROLE_BANK_LAB_ADMIN` |
| Landing schema | `LANDING` (not RAW) |
| Key tables | `LANDING.CLIENTS`, `LANDING.TXN_EVENTS` |

Full map: [`docs/BANK_NAMING.md`](docs/BANK_NAMING.md)

## Lab map (problem → solution)

| Lab | Business problem | Solution |
|-----|------------------|----------|
| 00 | No home for bank data | Workshop: DB, WH, schemas, sample clients |
| 01 | Analysts can see SSN | FR_/AR_ RBAC + safe directory view |
| 02 | Full ledger rebuild nightly | dbt incremental merge on txn events |
| 03 | Email/country leakage | Masking + row access policies |
| 04 | Messy layers for Finance | Landing → curated → mart |
| 05 | Manual handoffs | Streams/tasks vs dynamic tables |
| 06 | Overnight files | Stage + COPY (Snowpipe story) |
| 07 | Board query dying | Query Profile + warehouse choices |
| 08 | Fat scans on history | Clustering |
| 09 | Bad delete / need QA twin | Time Travel / UNDROP / clone |
| 10 | Partner wants a feed | Secure share |
| 11 | Region failure fear | Replication / DR vocabulary |
| 12 | Silent dbt breaks metrics | Contracts + Slim CI |
| 13 | Surprise credit bill | FinOps + resource monitor |
| 14 | Tell the week | Mock interview as Elena |

~**18 hours** · schedule: [`docs/COURSE_18H.md`](docs/COURSE_18H.md)

## Privileges / cleanup / smoke

- Repair: [`sql/00_privilege_repair.sql`](sql/00_privilege_repair.sql) as `ACCOUNTADMIN`
- Drop Labs 00–01 (and old SnowShop names): [`sql/cleanup_lab00_lab01.sql`](sql/cleanup_lab00_lab01.sql)
- Role proofs: [`docs/SNOWSIGHT_GOTCHAS.md`](docs/SNOWSIGHT_GOTCHAS.md) · [`sql/smoke_role_proofs.sql`](sql/smoke_role_proofs.sql)
- Author check (FR_ proofs must use `SECONDARY ROLES NONE`): `powershell -File scripts/check_lab_invariants.ps1`

Keep `SnowProArchitectStudyGuide.pdf` local only (gitignored).
