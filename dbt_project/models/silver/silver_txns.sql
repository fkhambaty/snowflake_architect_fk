{{ config(materialized='table') }}

-- Medallion silver: clean rules on bronze dock (same grain as Lab 04 CTAS)
select
    txn_id,
    client_id,
    upper(status) as status,
    amount,
    updated_at
from {{ source('bronze_landing', 'txn_events') }}
where amount >= 0
