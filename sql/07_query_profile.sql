-- Lab 07 — Query Profile triage (live)
-- KEEP:  SILVER_CURATED.BIG_EVENTS  → Lab 08 clusters this table
-- DROP:  SILVER_CURATED.PERF_WIDE   → Lab 07 only (fat SELECT * demo)

USE ROLE ROLE_BANK_LAB_ADMIN;
USE WAREHOUSE WH_BANK_XS;
USE DATABASE MERIDIAN_BANK;
USE SCHEMA SILVER_CURATED;

-- Fair A/B: do not reuse result cache between before/after
ALTER SESSION SET USE_CACHED_RESULT = FALSE;

-- ---------------------------------------------------------------------------
-- Load volume Alex's board query will feel (Lab 08 continues on this table)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE TABLE BIG_EVENTS AS
SELECT
  SEQ4() AS EVENT_ID,
  UNIFORM(1, 5, RANDOM()) AS CLIENT_ID,
  DATEADD('day', -UNIFORM(0, 364, RANDOM()), CURRENT_DATE()) AS EVENT_DATE,
  UNIFORM(1, 100, RANDOM())::NUMBER(12, 2) AS AMOUNT,
  UNIFORM(1, 4, RANDOM()) AS STATUS_CODE
FROM TABLE(GENERATOR(ROWCOUNT => 400000));

SELECT COUNT(*) AS ROW_CNT, MIN(EVENT_DATE) AS MIN_DT, MAX(EVENT_DATE) AS MAX_DT
FROM BIG_EVENTS;

-- Fat twin for SELECT * bytes demo (dropped at end of lab)
CREATE OR REPLACE TABLE PERF_WIDE AS
SELECT
  EVENT_ID, CLIENT_ID, EVENT_DATE, AMOUNT, STATUS_CODE,
  REPEAT('PAD', 80) AS NOTE_A,
  REPEAT('PAD', 80) AS NOTE_B,
  REPEAT('PAD', 80) AS NOTE_C
FROM BIG_EVENTS;

-- ---------------------------------------------------------------------------
-- Scenario 1 — Query fix: SELECT * → project only needed columns
-- ---------------------------------------------------------------------------
SELECT * FROM PERF_WIDE
WHERE EVENT_DATE >= DATEADD('day', -7, CURRENT_DATE());

SELECT EVENT_ID, CLIENT_ID, EVENT_DATE, AMOUNT
FROM PERF_WIDE
WHERE EVENT_DATE >= DATEADD('day', -7, CURRENT_DATE());

-- ---------------------------------------------------------------------------
-- Scenario 2 — Filter that fights pruning → sargable date range
-- ---------------------------------------------------------------------------
SELECT COUNT(*), SUM(AMOUNT)
FROM BIG_EVENTS
WHERE YEAR(EVENT_DATE) = YEAR(CURRENT_DATE())
  AND MONTH(EVENT_DATE) = MONTH(CURRENT_DATE());

SELECT COUNT(*), SUM(AMOUNT)
FROM BIG_EVENTS
WHERE EVENT_DATE >= DATE_TRUNC('month', CURRENT_DATE())
  AND EVENT_DATE < DATEADD('month', 1, DATE_TRUNC('month', CURRENT_DATE()));

-- ---------------------------------------------------------------------------
-- Scenario 3 — Heavy join first → filter early, then join
-- ---------------------------------------------------------------------------
SELECT c.COUNTRY, COUNT(*) AS TXNS, SUM(e.AMOUNT) AS VOLUME
FROM BRONZE_LANDING.CLIENTS c
JOIN BIG_EVENTS e ON e.CLIENT_ID = c.CLIENT_ID
GROUP BY c.COUNTRY
ORDER BY VOLUME DESC;

WITH recent AS (
  SELECT CLIENT_ID, AMOUNT
  FROM BIG_EVENTS
  WHERE EVENT_DATE >= DATEADD('day', -7, CURRENT_DATE())
)
SELECT c.COUNTRY, COUNT(*) AS TXNS, SUM(r.AMOUNT) AS VOLUME
FROM BRONZE_LANDING.CLIENTS c
JOIN recent r ON r.CLIENT_ID = c.CLIENT_ID
GROUP BY c.COUNTRY
ORDER BY VOLUME DESC;

-- ---------------------------------------------------------------------------
-- Scenario 4 — Read profile metrics from history (same session)
-- ---------------------------------------------------------------------------
SELECT
  QUERY_ID,
  LEFT(QUERY_TEXT, 80) AS QUERY_SNIP,
  TOTAL_ELAPSED_TIME,
  BYTES_SCANNED,
  PARTITIONS_SCANNED,
  PARTITIONS_TOTAL,
  ROUND(100 * PARTITIONS_SCANNED / NULLIF(PARTITIONS_TOTAL, 0), 1) AS PCT_PARTITIONS_READ
FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY_BY_SESSION())
WHERE QUERY_TEXT ILIKE '%BIG_EVENTS%'
   OR QUERY_TEXT ILIKE '%PERF_WIDE%'
ORDER BY START_TIME DESC
LIMIT 12;

-- ---------------------------------------------------------------------------
-- Scenario 5 — Last resort: temporary warehouse size bump, then restore
-- ---------------------------------------------------------------------------
SHOW WAREHOUSES LIKE 'WH_BANK_XS';

ALTER WAREHOUSE WH_BANK_XS SET WAREHOUSE_SIZE = 'SMALL';

SELECT c.COUNTRY, COUNT(*) AS TXNS, SUM(e.AMOUNT) AS VOLUME
FROM BRONZE_LANDING.CLIENTS c
JOIN BIG_EVENTS e ON e.CLIENT_ID = c.CLIENT_ID
WHERE e.EVENT_DATE >= DATEADD('day', -30, CURRENT_DATE())
GROUP BY c.COUNTRY
ORDER BY VOLUME DESC;

ALTER WAREHOUSE WH_BANK_XS SET WAREHOUSE_SIZE = 'XSMALL';
SHOW WAREHOUSES LIKE 'WH_BANK_XS';

-- ---------------------------------------------------------------------------
-- Cleanup — Lab 07-only objects. KEEP BIG_EVENTS for Lab 08.
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS PERF_WIDE;

SELECT 'Lab 07 OK — BIG_EVENTS kept for Lab 08; PERF_WIDE dropped; WH back to XSMALL' AS status;
