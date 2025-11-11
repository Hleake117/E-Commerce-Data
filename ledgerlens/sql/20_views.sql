-- Monthly KPIs
DROP VIEW IF EXISTS v_orders_month;
CREATE VIEW v_orders_month AS
SELECT
  strftime('%Y-%m', order_date) AS ym,
  COUNT(DISTINCT invoice_no)    AS orders,
  COUNT(DISTINCT customer_id)   AS buyers,
  SUM(gross_revenue)            AS revenue,
  SUM(gross_profit)             AS gross_profit,
  AVG(gross_revenue)            AS aov
FROM orders
GROUP BY ym;

-- SKU Pareto (ABC)
DROP VIEW IF EXISTS v_sku_abc;
CREATE VIEW v_sku_abc AS
WITH sku_rev AS (
  SELECT sku, SUM(gross_revenue) AS revenue
  FROM orders
  GROUP BY sku
),
ranked AS (
  SELECT
    sku,
    revenue,
    SUM(revenue) OVER (ORDER BY revenue DESC) * 1.0 /
    SUM(revenue) OVER () AS cum_share
  FROM sku_rev
)
SELECT
  sku,
  revenue,
  CASE
    WHEN cum_share <= 0.80 THEN 'A'
    WHEN cum_share <= 0.95 THEN 'B'
    ELSE 'C'
  END AS abc_class
FROM ranked;

