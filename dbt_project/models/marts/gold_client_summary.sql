{{ config(materialized='table') }}

-- Medallion gold: board metrics — reads silver only, never bronze
select
    client_id,
    count(*) as txn_count,
    sum(amount) as lifetime_value,
    max(updated_at) as last_update
from {{ ref('silver_txns') }}
group by client_id
