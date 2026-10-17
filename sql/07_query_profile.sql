-- Lab 07: Generate queries to study in Query Profile + warehouse basics
USE ROLE ROLE_ARCH_LAB_ADMIN;
USE WAREHOUSE WH_ARCH_XS;
USE DATABASE ARCH_INTERVIEW;

-- A) Simple selective query (should prune well on tiny data)
SELECT *
FROM RAW.CUSTOMERS
WHERE COUNTRY = 'US';

-- B) Heavier shape: join + aggregate (open Query Profile on this query id)
SELECT
  c.COUNTRY,
  COUNT(*) AS ORDERS,
  SUM(o.ORDER_TOTAL) AS REVENUE
FROM RAW.CUSTOMERS c
JOIN RAW.ORDERS_EVENTS o
  ON o.CUSTOMER_ID = c.CUSTOMER_ID
GROUP BY c.COUNTRY
ORDER BY REVENUE DESC;

-- C) Show warehouse settings you will discuss
SHOW WAREHOUSES LIKE 'WH_ARCH_XS';

SELECT 'Lab 07: open Query History → click the JOIN query → Query Profile' AS next_step;
