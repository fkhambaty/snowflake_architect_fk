-- Lab 05 optional: Dynamic Table (declarative lag inside Snowflake)
-- If your edition/account blocks this, skip — interview answer still works from streams/tasks + dbt.
USE ROLE ROLE_ARCH_LAB_ADMIN;
USE WAREHOUSE WH_ARCH_XS;
USE DATABASE ARCH_INTERVIEW;
USE SCHEMA CURATED;

CREATE OR REPLACE DYNAMIC TABLE DT_ORDERS_STATUS
  TARGET_LAG = 'DOWNSTREAM'
  WAREHOUSE = WH_ARCH_XS
AS
SELECT ORDER_ID, STATUS, UPDATED_AT
FROM RAW.ORDERS_EVENTS;

SELECT * FROM DT_ORDERS_STATUS ORDER BY ORDER_ID LIMIT 10;
SELECT 'Dynamic table created (optional path)' AS status;
