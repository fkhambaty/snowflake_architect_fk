# 18-hour full course schedule (no shortcuts)

Open **`docs/index.html`** and work top to bottom. Each lab: read blue boxes → run SQL → self-check → say soundbite.

| Hours | Labs | Focus |
|------:|------|--------|
| 0–1 | 00 | Setup + privilege smoke test |
| 1–2.5 | 01 | RBAC functional vs access |
| 2.5–4 | 03 | Masking + row access |
| 4–5 | 02 | dbt incremental merge |
| 5–6 | 04 | Medallion (+ Data Vault talk) |
| 6–7.5 | 05 | Streams/tasks vs DT vs dbt |
| 7.5–8.5 | 06 | BRONZE_LANDING / COPY / Snowpipe story |
| 8.5–10 | 07–08 | Query Profile + clustering |
| 10–11 | 09 | Time Travel / clone / UNDROP |
| 11–12 | 10–11 | Sharing + DR architecture |
| 12–13.5 | 12–13 | dbt at scale + FinOps |
| 13.5–15.5 | 14 | Mock interview drills (repeat aloud) |
| 15.5–18 | Buffer | Re-run weak labs + soundbites |

**Before Lab 03+ once:** run Step 0 privilege repair (ACCOUNTADMIN) so APPLY POLICY / EXECUTE TASK / CREATE SHARE work.
