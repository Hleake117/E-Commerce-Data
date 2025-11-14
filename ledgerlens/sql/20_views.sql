-- Monthly KPIs with growth and mix
DROP VIEW IF EXISTS v_orders_month;
CREATE VIEW v_orders_month AS
WITH monthly AS (
  SELECT
    order_month AS ym,
    MIN(order_date) AS month_start,
    COUNT(DISTINCT invoice_no) AS orders,
    COUNT(DISTINCT customer_id) AS buyers,
    SUM(qty) AS units,
    SUM(gross_revenue) AS revenue,
    SUM(gross_profit) AS gross_profit,
    SUM(gross_profit) * 1.0 / NULLIF(SUM(gross_revenue), 0) AS gross_margin_pct,
    AVG(gross_revenue) AS aov,
    SUM(CASE WHEN is_export = 0 THEN gross_revenue ELSE 0 END) AS revenue_domestic,
    SUM(CASE WHEN is_export = 1 THEN gross_revenue ELSE 0 END) AS revenue_export
  FROM orders
  GROUP BY order_month
),
enriched AS (
  SELECT
    monthly.*,
    LAG(revenue) OVER w AS revenue_prev,
    LAG(gross_profit) OVER w AS gross_profit_prev,
    LAG(aov) OVER w AS aov_prev,
    LAG(orders) OVER w AS orders_prev,
    LAG(buyers) OVER w AS buyers_prev
  FROM monthly
  WINDOW w AS (ORDER BY ym)
)
SELECT
  ym,
  month_start,
  orders,
  buyers,
  units,
  revenue,
  revenue_prev,
  CASE
    WHEN revenue_prev IS NULL OR revenue_prev = 0 THEN NULL
    ELSE (revenue - revenue_prev) / revenue_prev
  END AS revenue_mom_pct,
  gross_profit,
  gross_profit_prev,
  CASE
    WHEN gross_profit_prev IS NULL OR gross_profit_prev = 0 THEN NULL
    ELSE (gross_profit - gross_profit_prev) / gross_profit_prev
  END AS gross_profit_mom_pct,
  gross_margin_pct,
  aov,
  aov_prev,
  CASE
    WHEN aov_prev IS NULL OR aov_prev = 0 THEN NULL
    ELSE (aov - aov_prev) / aov_prev
  END AS aov_mom_pct,
  buyers_prev,
  CASE
    WHEN buyers_prev IS NULL OR buyers_prev = 0 THEN NULL
    ELSE (buyers - buyers_prev) / buyers_prev
  END AS buyers_mom_pct,
  revenue_domestic,
  revenue_export
FROM enriched
ORDER BY ym;

-- SKU Pareto (ABC) with share and margin
DROP VIEW IF EXISTS v_sku_abc;
CREATE VIEW v_sku_abc AS
WITH sku_rollup AS (
  SELECT
    sku,
    SUM(qty) AS units,
    SUM(gross_revenue) AS revenue,
    SUM(gross_profit) AS gross_profit
  FROM orders
  GROUP BY sku
),
ranked AS (
  SELECT
    sku,
    units,
    revenue,
    gross_profit,
    revenue * 1.0 / NULLIF(SUM(revenue) OVER (), 0) AS revenue_share,
    SUM(revenue) OVER (ORDER BY revenue DESC)
      * 1.0 / NULLIF(SUM(revenue) OVER (), 0) AS cum_share
  FROM sku_rollup
)
SELECT
  sku,
  units,
  revenue,
  gross_profit,
  revenue_share,
  cum_share,
  CASE
    WHEN cum_share <= 0.80 THEN 'A'
    WHEN cum_share <= 0.95 THEN 'B'
    ELSE 'C'
  END AS abc_class
FROM ranked;

-- Revenue by country
DROP VIEW IF EXISTS v_country_summary;
CREATE VIEW v_country_summary AS
WITH country AS (
  SELECT
    country,
    COUNT(DISTINCT invoice_no) AS orders,
    COUNT(DISTINCT customer_id) AS buyers,
    SUM(qty) AS units,
    SUM(gross_revenue) AS revenue,
    SUM(gross_profit) AS gross_profit,
    AVG(gross_revenue) AS aov
  FROM orders
  GROUP BY country
),
totals AS (
  SELECT SUM(revenue) AS total_revenue
  FROM country
)
SELECT
  country,
  orders,
  buyers,
  units,
  revenue,
  gross_profit,
  CASE
    WHEN revenue = 0 THEN NULL
    ELSE gross_profit * 1.0 / revenue
  END AS gross_margin_pct,
  aov,
  revenue * 1.0 / NULLIF(totals.total_revenue, 0) AS revenue_share
FROM country, totals
ORDER BY revenue DESC;

-- Customer lifetime value metrics
DROP VIEW IF EXISTS v_customer_value;
CREATE VIEW v_customer_value AS
WITH customer AS (
  SELECT
    customer_id,
    COUNT(DISTINCT invoice_no) AS orders,
    SUM(qty) AS units,
    SUM(gross_revenue) AS revenue,
    SUM(gross_profit) AS gross_profit,
    AVG(gross_revenue) AS avg_order_value,
    MIN(order_date) AS first_order_date,
    MAX(order_date) AS last_order_date
  FROM orders
  WHERE customer_id IS NOT NULL
  GROUP BY customer_id
),
enriched AS (
  SELECT
    *,
    (julianday(last_order_date) - julianday(first_order_date) + 1) AS active_days,
    ROW_NUMBER() OVER (ORDER BY revenue DESC) AS revenue_rank
  FROM customer
)
SELECT
  customer_id,
  orders,
  units,
  revenue,
  gross_profit,
  avg_order_value,
  first_order_date,
  last_order_date,
  active_days,
  CASE
    WHEN active_days <= 0 THEN NULL
    ELSE revenue / (active_days / 30.0)
  END AS revenue_per_active_month,
  revenue_rank
FROM enriched
ORDER BY revenue DESC;

DROP VIEW IF EXISTS v_top_customers;
CREATE VIEW v_top_customers AS
SELECT *
FROM v_customer_value
WHERE revenue_rank <= 50;

