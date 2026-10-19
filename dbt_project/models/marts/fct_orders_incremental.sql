{{
  config(
    materialized='incremental',
    unique_key='order_id',
    incremental_strategy='merge',
    on_schema_change='fail',
    schema='SILVER_CURATED'
  )
}}

select
    order_id,
    customer_id,
    status,
    order_total,
    updated_at
from {{ ref('stg_orders') }}

{% if is_incremental() %}
  where updated_at > (select coalesce(max(updated_at), '1900-01-01'::timestamp_ntz) from {{ this }})
{% endif %}
