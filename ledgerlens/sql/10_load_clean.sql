DROP TABLE IF EXISTS orders;
CREATE TABLE orders AS
WITH src AS (
  SELECT
    InvoiceNo,
    UPPER(StockCode) AS sku,
    Description,
    Quantity,
    UnitPrice,
    CustomerID,
    Country,
    TRIM(InvoiceDate) AS invoice_dt
  FROM orders_raw
  WHERE Quantity > 0
    AND UnitPrice >= 0
    AND InvoiceNo NOT LIKE 'C%'
),
parts AS (
  SELECT
    *,
    INSTR(invoice_dt, '/') AS slash1,
    SUBSTR(invoice_dt, INSTR(invoice_dt, '/') + 1) AS after_month
  FROM src
),
parts2 AS (
  SELECT
    *,
    CASE
      WHEN slash1 > 0 THEN SUBSTR(invoice_dt, 1, slash1 - 1)
      ELSE NULL
    END AS month_txt,
    CASE
      WHEN INSTR(after_month, '/') > 0 THEN SUBSTR(after_month, 1, INSTR(after_month, '/') - 1)
      ELSE NULL
    END AS day_txt,
    CASE
      WHEN INSTR(after_month, '/') > 0 THEN SUBSTR(after_month, INSTR(after_month, '/') + 1)
      ELSE NULL
    END AS year_time
  FROM parts
),
parts3 AS (
  SELECT
    *,
    SUBSTR(
      COALESCE(year_time, ''),
      1,
      CASE
        WHEN INSTR(COALESCE(year_time, ''), ' ') > 0 THEN INSTR(COALESCE(year_time, ''), ' ') - 1
        ELSE LENGTH(COALESCE(year_time, ''))
      END
    ) AS year_txt,
    CASE
      WHEN INSTR(COALESCE(year_time, ''), ' ') > 0 THEN SUBSTR(COALESCE(year_time, ''), INSTR(COALESCE(year_time, ''), ' ') + 1)
      ELSE '00:00'
    END AS time_txt
  FROM parts2
),
parts4 AS (
  SELECT
    *,
    SUBSTR(
      COALESCE(time_txt, ''),
      1,
      CASE
        WHEN INSTR(COALESCE(time_txt, ''), ':') > 0 THEN INSTR(COALESCE(time_txt, ''), ':') - 1
        ELSE LENGTH(COALESCE(time_txt, ''))
      END
    ) AS hour_txt,
    CASE
      WHEN INSTR(COALESCE(time_txt, ''), ':') > 0 THEN SUBSTR(COALESCE(time_txt, ''), INSTR(COALESCE(time_txt, ''), ':') + 1)
      ELSE '00'
    END AS minute_txt
  FROM parts3
),
normalized AS (
  SELECT
    InvoiceNo AS invoice_no,
    sku,
    Description AS description,
    Quantity AS qty,
    UnitPrice AS unit_price,
    CustomerID AS customer_id,
    Country AS country,
    CAST(TRIM(month_txt) AS INTEGER) AS month_num,
    CAST(TRIM(day_txt) AS INTEGER) AS day_num,
    CAST(TRIM(year_txt) AS INTEGER) AS year_num,
    CAST(COALESCE(NULLIF(TRIM(hour_txt), ''), '0') AS INTEGER) AS hour_num,
    CAST(COALESCE(NULLIF(TRIM(minute_txt), ''), '0') AS INTEGER) AS minute_num
  FROM parts4
  WHERE COALESCE(TRIM(month_txt), '') <> ''
    AND COALESCE(TRIM(day_txt), '') <> ''
    AND COALESCE(TRIM(year_txt), '') <> ''
)
SELECT
  invoice_no,
  printf('%04d-%02d-%02d %02d:%02d:00', year_num, month_num, day_num, hour_num, minute_num) AS order_ts,
  printf('%04d-%02d-%02d', year_num, month_num, day_num) AS order_date,
  printf('%04d-%02d', year_num, month_num) AS order_month,
  year_num AS order_year,
  customer_id,
  sku,
  description,
  qty,
  unit_price,
  country,
  CASE WHEN country <> 'United Kingdom' THEN 1 ELSE 0 END AS is_export,
  (qty * unit_price) AS gross_revenue,
  (qty * unit_price * 0.60) AS cogs,
  (qty * unit_price) - (qty * unit_price * 0.60) AS gross_profit
FROM normalized;
