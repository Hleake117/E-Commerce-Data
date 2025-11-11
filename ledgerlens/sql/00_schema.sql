DROP TABLE IF EXISTS orders_raw;
CREATE TABLE orders_raw(
  InvoiceNo TEXT,
  StockCode TEXT,
  Description TEXT,
  Quantity INTEGER,
  InvoiceDate TEXT,
  UnitPrice REAL,
  CustomerID TEXT,
  Country TEXT
);

