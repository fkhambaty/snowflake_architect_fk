# Snowflake Architect Interview Prep (FK)

## Open the course (HTML — not this README)

Double-click:

```text
docs/index.html
```

Full path on GitHub: [fkhambaty/snowflake_architect_fk](https://github.com/fkhambaty/snowflake_architect_fk)

## What this is

- **15 labs (00–14)** · ~**18 hours** spoon-fed interview prep (Snowflake + dbt)
- Every SQL chunk: **Understand this** → **Copy** → run in Snowsight
- Aligned to SnowPro Advanced Architect domains (interview-first)
- Schedule: [`docs/COURSE_18H.md`](docs/COURSE_18H.md)

## Lab map

| Lab | Topic |
|-----|--------|
| 00 | Setup + privileges |
| 01 | RBAC |
| 02 | dbt incremental |
| 03 | Masking + row access |
| 04 | Medallion / Data Vault |
| 05 | Streams, tasks, dynamic tables vs dbt |
| 06 | Landing / COPY / Snowpipe story |
| 07 | Query Profile + warehouses |
| 08 | Clustering |
| 09 | Time Travel / clone |
| 10 | Secure sharing |
| 11 | DR / multi-account |
| 12 | dbt at scale |
| 13 | FinOps |
| 14 | Mock interview |

## If something fails with privileges

Run as `ACCOUNTADMIN`: [`sql/00_privilege_repair.sql`](sql/00_privilege_repair.sql) (also each lab’s Step 0).

Keep `SnowProArchitectStudyGuide.pdf` local only (gitignored).
