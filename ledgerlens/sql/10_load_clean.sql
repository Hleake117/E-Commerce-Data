DROP TABLE IF EXISTS orders;
CREATE TABLE orders AS
SELECT
  InvoiceNo                               AS invoice_no,
  DATE(InvoiceDate)                       AS order_date,
  CustomerID                              AS customer_id,
  UPPER(StockCode)                        AS sku,
  Quantity                                AS qty,
  UnitPrice                               AS unit_price,
  Country                                 AS country,
  (Quantity * UnitPrice)                  AS gross_revenue,
  (Quantity * UnitPrice * 0.60)           AS cogs,
  (Quantity * UnitPrice) - (Quantity * UnitPrice * 0.60) AS gross_profit
FROM orders_raw
WHERE Quantity > 0
  AND UnitPrice >= 0
  AND InvoiceNo NOT LIKE 'C%';

