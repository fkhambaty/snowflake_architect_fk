{{ config(materialized='view') }}

select
    order_id,
    customer_id,
    status,
    order_total,
    updated_at
from {{ source('raw', 'orders_events') }}
