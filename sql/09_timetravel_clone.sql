-- Lab 09: Time Travel + zero-copy clone
USE ROLE ROLE_ARCH_LAB_ADMIN;
USE WAREHOUSE WH_ARCH_XS;
USE DATABASE ARCH_INTERVIEW;
USE SCHEMA CURATED;

CREATE OR REPLACE TABLE TT_DEMO (ID NUMBER, NOTE STRING);
INSERT INTO TT_DEMO VALUES (1, 'before');

-- Capture query id / time marker
SET qid = LAST_QUERY_ID();

UPDATE TT_DEMO SET NOTE = 'after' WHERE ID = 1;
DELETE FROM TT_DEMO WHERE ID = 1;

-- Time Travel (may return 0 rows if OFFSET window missed — that is OK for learning)
-- Prefer UNDROP + CLONE below as the reliable demos.
SELECT * FROM TT_DEMO AT (OFFSET => -60*2);  -- ~2 minutes ago, if still in retention

-- Reliable teaching pattern: UNDROP + CLONE
CREATE OR REPLACE TABLE TT_DEMO2 (ID NUMBER, NOTE STRING);
INSERT INTO TT_DEMO2 VALUES (1, 'keep me');
DROP TABLE TT_DEMO2;
UNDROP TABLE TT_DEMO2;
SELECT * FROM TT_DEMO2;

-- Zero-copy clone of database schema table
CREATE OR REPLACE TABLE TT_DEMO_CLONE CLONE TT_DEMO2;
SELECT * FROM TT_DEMO_CLONE;

SELECT 'Lab 09 Time Travel / UNDROP / CLONE OK' AS status;
