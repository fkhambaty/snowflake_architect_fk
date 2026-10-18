{{ config(materialized='view') }}

select
    txn_id as order_id,
    client_id as customer_id,
    status,
    amount as order_total,
    updated_at
from {{ source('bronze_landing', 'txn_events') }}
