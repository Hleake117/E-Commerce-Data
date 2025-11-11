# LedgerLens (MVP)

LedgerLens is a SQL-first mini analytics warehouse that ships with:

- SQLite database with the UK Online Retail dataset (2010–2011)
- SQL transformations for clean orders, monthly KPIs, and SKU ABC segmentation
- Python export of PNG charts and CSVs
- Minimal React viewer to browse charts and download data

## Project Layout

```
ledgerlens/
  data_raw/ecommerce.csv
  db/ledgerlens.db
  sql/
    00_schema.sql
    10_load_clean.sql
    20_views.sql
  py/
    charts.py
    requirements.txt
  web/
    package.json
    src/App.jsx
    src/components/ChartCard.jsx
    src/assets/
    src/data/
```

## 1. Set up environment & load data

```bash
cd ledgerlens

python -m venv .venv
source .venv/bin/activate
pip install -r py/requirements.txt

sqlite3 db/ledgerlens.db < sql/00_schema.sql
sqlite-utils insert db/ledgerlens.db orders_raw data_raw/ecommerce.csv --csv
sqlite3 db/ledgerlens.db < sql/10_load_clean.sql
sqlite3 db/ledgerlens.db < sql/20_views.sql
```

## 2. Generate charts & CSVs

```bash
cd py
python charts.py
```

This exports:

- `web/src/assets/rev_gp.png`
- `web/src/assets/aov.png`
- `web/src/data/orders_month.csv`

## 3. Run the React viewer

```bash
cd ../web
npm install
npm run dev
```

Open the local URL displayed in the terminal to view charts and download the monthly KPI CSV.

