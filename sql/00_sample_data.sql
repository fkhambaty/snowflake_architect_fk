-- Lab 00: sample bank clients (PII for later labs)
USE ROLE ROLE_BANK_LAB_ADMIN;
USE WAREHOUSE WH_BANK_XS;
USE DATABASE MERIDIAN_BANK;
USE SCHEMA LANDING;

CREATE OR REPLACE TABLE CLIENTS (
  CLIENT_ID     NUMBER,
  FULL_NAME     STRING,
  EMAIL         STRING,
  PHONE         STRING,
  COUNTRY       STRING,
  SSN_LAST4     STRING,
  CREATED_AT    TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

INSERT INTO CLIENTS (CLIENT_ID, FULL_NAME, EMAIL, PHONE, COUNTRY, SSN_LAST4) VALUES
  (1, 'Asha Patel',  'asha.patel@example.com',  '+1-555-0101', 'US', '1234'),
  (2, 'Ben Okonkwo', 'ben.okonkwo@example.com', '+1-555-0102', 'US', '5678'),
  (3, 'Chen Wei',    'chen.wei@example.com',    '+1-555-0103', 'CA', '9012'),
  (4, 'Diana Rossi', 'diana.rossi@example.com', '+1-555-0104', 'US', '3456'),
  (5, 'Evan Ng',     'evan.ng@example.com',     '+1-555-0105', 'UK', '7890');

SELECT * FROM CLIENTS ORDER BY CLIENT_ID;
