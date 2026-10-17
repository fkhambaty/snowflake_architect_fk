# Snowflake Architect Interview Prep (FK)

Hands-on interview prep for **Snowflake Architect** roles (6+ years expected) with **dbt**.

This is a **practical walkthrough course**: interview question → scenario → run it in your Snowflake account → answer like an architect.

## Start here

Open the course hub in a browser:

- [`docs/index.html`](docs/index.html) — clickable map of all modules

Or open the raw file path:

```text
docs/index.html
```

## Starter modules (for your feedback)

| # | Module | Why it exists |
|---|--------|---------------|
| 00 | [Course setup](labs/00_setup/README.md) | Warehouses, roles, sample DB once |
| 01 | [RBAC like an architect](labs/01_rbac_architect/README.md) | Most common senior interview topic |
| 02 | [dbt incremental + Snowflake](labs/02_dbt_incremental/README.md) | Core Snowflake + dbt pairing |

After you try these two labs, tell me what to change (pace, depth, format, screenshots style, missing topics). Remaining modules will follow your feedback.

## Planned full map (not built yet)

Aligned to interview + [SnowPro Advanced: Architect](https://learn.snowflake.com/en/certifications/snowpro-advanced-architect/) domains — **interview-first**, exam topics only when they show up in real architect conversations.

1. Accounts & Security — RBAC, masking, row access, network, SSO patterns  
2. Architecture — medallion/Data Vault tradeoffs, cloning, Time Travel, sharing, DR  
3. Data Engineering — Snowpipe, streams/tasks, dynamic tables vs dbt, Iceberg  
4. Performance — Query Profile, clustering, warehouse sizing, caching  
5. dbt at scale — projects, packages, CI, Slim CI, exposures, contracts  
6. Cost governance — resource monitors, query attribution, FinOps talking points  

## Repo layout

```text
docs/                 # HTML course hub + diagrams
labs/                 # Step-by-step labs (SQL + dbt)
sql/                  # Shared SQL helpers
dbt_project/          # Sample dbt project used by labs
```

## Requirements

- Snowflake account (trial is fine)
- Snowflake VS Code / Snowsight access
- dbt Core or dbt Cloud CLI installed locally
- Python 3.10+ if using dbt-snowflake adapter

## Author

Built for interview prep by **fkhambaty**.
