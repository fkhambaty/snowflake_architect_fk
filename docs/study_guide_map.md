# Study guide sync (interview-first)

Source: official **SnowPro Advanced: Architect Exam Study Guide** (Aug 20, 2025) — local file `SnowProArchitectStudyGuide.pdf`.

Exam domains and weights:

| Domain | Weight | Interview priority now |
|--------|--------|------------------------|
| 1.0 Accounts and Security | 25% | Highest |
| 2.0 Snowflake Architecture | 30% | Highest |
| 3.0 Data Engineering | 25% | Highest |
| 4.0 Performance Optimization | 20% | High |

## How this course uses the guide

- **Now:** interview scenarios you can run in your account. Only the guide topics that show up in architect interviews.
- **Later (exam pass):** same labs get a short “Exam add-on” (sample-style questions + links to official Quickstarts). No dumping the whole guide into every module.
- **Official labs:** we do **not** rewrite Snowflake University ILT content. We **link** the guide’s Lab Guides (Quickstarts) as optional companions after our short interview lab.

## Starter labs ↔ guide

| Our lab | Guide objective | In sync? | Official companion (do after ours if you want) |
|---------|-----------------|----------|-----------------------------------------------|
| 00 Setup | Object hierarchy / warehouses (2.4) | Yes — bootstrap only | — |
| 01 RBAC | **1.2** Functional vs access roles, secure views, privilege inheritance | **Yes** — core of 1.2 | [Process PII: RBAC, masking, row access](https://www.snowflake.com/en/developers/guides/getting-started-with-pii/) · guide also cites *Architecture Pattern: Security – Access to Sensitive Objects* |
| 02 dbt incremental | **3.3** transforms + guide Lab Guide *Accelerating Data Teams with dbt* | **Yes for interviews**; dbt is a study-resource lab, not its own exam domain | [dbt Core & Snowflake](https://www.snowflake.com/en/developers/guides/data-teams-with-dbt-core/) · [dbt Cloud & Snowflake](https://www.snowflake.com/en/developers/guides/data-teams-with-dbt-cloud/) |

## Intentionally not in the starter (exam later)

Still on the roadmap; skipped for now so you are not overwhelmed:

- 1.1 Account strategy / parameter hierarchy  
- 1.2 Masking, row access, tagging, editions/compliance (after you finish Lab 01)  
- 1.3 Network, SSO/MFA/OAuth, Private Link  
- 2.1 Data Vault / star schema tradeoffs  
- 2.2 Sharing / Marketplace / Clean Rooms  
- 2.3 DevOps, Git, CI/CD, AI/ML surface  
- 2.5 Time Travel, clone, Fail-safe, replication/DR  
- 3.1 Snowpipe / streaming / Iceberg / external tables  
- 3.2 Connectors / Snowpark overview  
- 4.x Query Profile, clustering, warehouse scaling, ACCOUNT_USAGE  

## Official Quickstarts named in the guide (bookmark list)

Use these when we build the matching module — not all at once.

**Domain 1**

- Architecture Pattern: Security – Access to Sensitive Objects  
- Architecture Pattern: Security – Authentication  
- Architecture Pattern: Security – Network  
- Practical PII walkthrough: https://www.snowflake.com/en/developers/guides/getting-started-with-pii/

**Domain 2**

- Building an application with Marketplace data  
- Getting Started with Time Travel  
- Snowflake and Data Modeling (workload guide)

**Domain 3**

- Getting Started with Snowpipe  
- Building a Real-Time Data Vault  
- Accelerating Data Engineering / Data Teams with dbt (+ Cloud variant)  
- Getting Started with UDFs / Python / SnowSQL  

**Domain 4**

- Resource Optimization: Performance / Billing / Setup / Usage Monitoring  
- Getting Started with Cost and Performance Optimization: https://www.snowflake.com/en/developers/guides/getting-started-cost-performance-optimization/  
- Resource Optimization Performance: https://www.snowflake.com/en/developers/guides/resource-optimization-performance-optimization/

Browse all Quickstarts: https://quickstarts.snowflake.com/

## Exam prerequisite (from guide)

Active **SnowPro Core** is required before the Advanced Architect exam. Interview prep does not replace that.
