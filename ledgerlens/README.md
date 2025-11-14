# LedgerLens

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF.svg)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-3-green.svg)](https://www.sqlite.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)

> **SQL-first revenue analytics dashboard** for e-commerce data analysis with interactive visualizations, real-time KPIs, and comprehensive business insights.

## 🚀 Live Demo

**[View Live Application](https://ledgerlens.vercel.app)** (Coming soon)

## 📸 Screenshots

### Dashboard Overview
![Dashboard Overview](https://via.placeholder.com/800x400?text=Dashboard+Overview)

### Interactive Charts
![Interactive Charts](https://via.placeholder.com/800x400?text=Interactive+Charts)

### Data Tables
![Data Tables](https://via.placeholder.com/800x400?text=Data+Tables)

## 🎯 Features

- ✅ **SQL-First Architecture**: Clean data transformations using SQL views
- ✅ **Interactive Visualizations**: Dynamic charts with Recharts library
- ✅ **Real-Time KPIs**: Month-over-month growth metrics and business insights
- ✅ **Responsive Design**: Mobile-first approach with dark mode support
- ✅ **Type-Safe**: Full TypeScript implementation
- ✅ **CI/CD Pipeline**: Automated testing and deployment via GitHub Actions
- ✅ **Comprehensive Testing**: 70%+ test coverage
- ✅ **Production Ready**: Deployed on Vercel

## 📊 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Recharts
- **Backend**: Python, SQLite, Pandas, Matplotlib
- **DevOps**: GitHub Actions, Vercel
- **Testing**: Vitest, React Testing Library

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
    00_schema.sql      # Creates orders_raw table schema
    10_load_clean.sql  # Transforms raw data to clean orders table
    20_views.sql       # Creates 6 analytical views
  py/
    charts.py          # Generates 7 PNG charts and 4 CSV exports
    requirements.txt
  web/
    package.json
    src/
      App.jsx          # Main React app with 4-tab navigation
      components/
        ChartCard.jsx  # Reusable chart display component
      assets/          # 7 PNG chart images
      data/            # 4 CSV data files
```

## 1. Set up environment & load data

```bash
cd ledgerlens

# Create Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r py/requirements.txt

# Initialize database and load data
sqlite3 db/ledgerlens.db < sql/00_schema.sql
sqlite-utils insert db/ledgerlens.db orders_raw data_raw/ecommerce.csv --csv
sqlite3 db/ledgerlens.db < sql/10_load_clean.sql
sqlite3 db/ledgerlens.db < sql/20_views.sql
```

**What happens:**
- `00_schema.sql`: Creates `orders_raw` table structure
- `sqlite-utils`: Loads CSV with Latin-1 encoding (handles special characters)
- `10_load_clean.sql`: Transforms raw data with:
  - Date parsing (MM/DD/YYYY → ISO format)
  - Derived columns: `order_date`, `order_month`, `order_year`, `is_export`
  - Revenue calculations: `gross_revenue`, `cogs`, `gross_profit`
  - Filters: removes negative quantities, cancellations (InvoiceNo starting with 'C')
- `20_views.sql`: Creates 6 analytical views (see Views section below)

## 2. Generate charts & CSVs

```bash
cd py
python charts.py
```

**Exports 7 PNG charts to `web/src/assets/`:**
- `rev_gp.png`: Revenue vs Gross Profit line chart (monthly trends)
- `revenue_mom.png`: Revenue with Month-over-Month growth annotations
- `domestic_export.png`: Domestic vs Export revenue stacked bars
- `aov.png`: Average Order Value trend over time
- `top_countries.png`: Top 10 countries by revenue (horizontal bar)
- `top_customers.png`: Top 15 customers by lifetime revenue
- `top_skus.png`: Top 20 SKUs with ABC classification color coding

**Exports 4 CSV files to `web/src/data/`:**
- `orders_month.csv`: Monthly KPIs (13 rows, one per month)
- `country_summary.csv`: Revenue breakdown by country (38 countries)
- `top_customers.csv`: Top 50 customers by revenue
- `sku_abc.csv`: All SKUs with ABC classification (3,829 SKUs)

## 3. Run the React viewer

```bash
cd ../web
npm install
npm run dev
```

Open the local URL displayed in the terminal (typically `http://localhost:5173`).

## Dashboard Tabs

The React app has 4 tabs:

### Overview Tab
- **Revenue vs Gross Profit**: Monthly comparison of revenue and profit trends
- **Revenue MoM Growth**: Month-over-month revenue growth with percentage annotations
- **Domestic vs Export Revenue**: UK domestic vs international export breakdown
- **Average Order Value**: AOV trend over the 13-month period

### Markets Tab
- **Top 10 Countries**: Geographic revenue distribution showing market share

### Customers Tab
- **Top 15 Customers**: Highest-value customers ranked by lifetime revenue

### Products Tab
- **Top 20 SKUs (ABC Classification)**: Product performance with Pareto analysis

## Database Views

The project creates 6 analytical views in `20_views.sql`:

### 1. `v_orders_month`
Monthly KPIs with growth metrics:
- `ym`: Year-month (YYYY-MM)
- `orders`, `buyers`, `units`: Volume metrics
- `revenue`, `gross_profit`: Financial metrics
- `gross_margin_pct`: Profit margin percentage
- `aov`: Average Order Value
- `revenue_mom_pct`, `gross_profit_mom_pct`, `aov_mom_pct`: Month-over-month growth rates
- `revenue_domestic`, `revenue_export`: Geographic breakdown

### 2. `v_country_summary`
Revenue breakdown by country:
- `country`: Country name
- `orders`, `buyers`, `units`: Volume metrics
- `revenue`, `gross_profit`: Financial metrics
- `gross_margin_pct`: Profit margin
- `aov`: Average Order Value
- `revenue_share`: Percentage of total revenue

### 3. `v_customer_value`
Individual customer lifetime value metrics:
- `customer_id`: Customer identifier
- `orders`, `units`: Purchase history
- `revenue`, `gross_profit`: Lifetime value
- `avg_order_value`: Average spend per order
- `first_order_date`, `last_order_date`: Customer tenure
- `active_days`: Days between first and last order
- `revenue_per_active_month`: Revenue normalized by active period
- `revenue_rank`: Rank by total revenue

### 4. `v_top_customers`
Top 50 customers filtered from `v_customer_value` (same columns)

### 5. `v_sku_abc`
SKU Pareto analysis with ABC classification:
- `sku`: Product stock code
- `units`, `revenue`, `gross_profit`: Product metrics
- `revenue_share`: Percentage of total revenue
- `cum_share`: Cumulative revenue share (for Pareto analysis)
- `abc_class`: Classification:
  - **Class A**: Top 80% of revenue (cum_share ≤ 0.80)
  - **Class B**: 80-95% of revenue (0.80 < cum_share ≤ 0.95)
  - **Class C**: Bottom 5% of revenue (cum_share > 0.95)

## Metric Definitions

### Month-over-Month (MoM) Growth
Percentage change from previous month:
```
MoM Growth = (Current Month - Previous Month) / Previous Month × 100
```
- Positive values (green) indicate growth
- Negative values (red) indicate decline
- First month has no previous month, so MoM is NULL

### ABC Classification (Pareto Analysis)
Product segmentation based on revenue contribution:
- **Class A**: Products contributing to top 80% of revenue (high priority)
- **Class B**: Products contributing to 80-95% of revenue (medium priority)
- **Class C**: Products contributing to bottom 5% of revenue (low priority)

This follows the 80/20 rule (Pareto Principle) where a small number of products drive most revenue.

### Average Order Value (AOV)
Average revenue per order:
```
AOV = Total Revenue / Number of Orders
```

### Gross Margin
Profitability metric:
```
Gross Margin % = (Gross Profit / Revenue) × 100
```
Where `Gross Profit = Revenue - COGS` (Cost of Goods Sold estimated at 60% of revenue)

### Domestic vs Export
- **Domestic**: Orders from United Kingdom
- **Export**: Orders from all other countries

## Data Quality

- **Raw rows**: 541,909
- **Clean orders**: 531,283 (98% retention after filtering)
- **Date range**: December 2010 - December 2011 (13 months)
- **Unique customers**: 4,340
- **Unique SKUs**: 3,829
- **Countries**: 38

## Workflow Summary

1. **Data Loading**: Raw CSV → SQLite → Clean orders table
2. **View Creation**: 6 analytical views for different business questions
3. **Chart Generation**: Python script queries views → generates 7 PNG charts
4. **CSV Export**: Python script exports 4 CSV files for data download
5. **Visualization**: React app displays charts in organized tabs with CSV download links

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from GitHub**:
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically detect the Vite configuration
   - Set build command: `cd ledgerlens/web && npm install && npm run build`
   - Set output directory: `ledgerlens/web/dist`

3. **Environment Variables**:
   - No environment variables required for static deployment
   - CSV files are bundled with the application

4. **Custom Domain** (optional):
   - Add your domain in Vercel dashboard
   - Configure DNS settings

### Local Development

```bash
# Install dependencies
cd ledgerlens/web
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

```bash
# Run tests
cd ledgerlens/web
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

## 📊 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Pipeline                             │
├─────────────────────────────────────────────────────────────┤
│  Raw CSV → SQLite → Clean Data → Analytical Views           │
│  (ecommerce.csv)  (orders_raw)  (orders)   (6 views)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Python Chart Generation                      │
├─────────────────────────────────────────────────────────────┤
│  Query Views → Pandas DataFrame → Charts/CSVs               │
│  (SQLite)      (Data Processing)  (PNG/CSV Export)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  React Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  CSV Data → Recharts → Interactive Charts                   │
│  (Static)      (Visualization)  (User Interface)            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Data Loading**:
   - Raw CSV data is loaded into SQLite `orders_raw` table
   - SQL transformations clean and enrich the data
   - Analytical views are created for different business questions

2. **Chart Generation**:
   - Python script queries SQLite views
   - Data is processed using Pandas
   - Charts are exported as PNG images (legacy)
   - CSVs are exported for interactive charts

3. **Frontend Display**:
   - React app loads CSV data
   - Recharts library renders interactive charts
   - Users can interact with charts (zoom, tooltips, etc.)
   - Data tables provide detailed views

### Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Recharts
- **Backend**: Python 3.8+, SQLite, Pandas, Matplotlib
- **DevOps**: GitHub Actions, Vercel
- **Testing**: Vitest, React Testing Library

### Project Structure

```
ledgerlens/
├── data_raw/           # Raw CSV data
├── db/                 # SQLite database
├── sql/                # SQL scripts
│   ├── 00_schema.sql   # Table schema
│   ├── 10_load_clean.sql  # Data transformation
│   └── 20_views.sql    # Analytical views
├── py/                 # Python scripts
│   ├── charts.py       # Chart generation
│   └── requirements.txt
└── web/                # React frontend
    ├── src/
    │   ├── components/ # React components
    │   ├── hooks/      # Custom hooks
    │   ├── data/       # CSV data files
    │   └── App.jsx     # Main app
    └── package.json
```

## 📝 Requirements

- Python 3.8+ with packages: `pandas`, `matplotlib`, `sqlite3` (standard library)
- Node.js 18+ with npm
- SQLite3 command-line tool
- `sqlite-utils` Python package (for CSV import with proper encoding)

## 🔧 Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ledgerlens
   ```

2. **Set up Python environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r py/requirements.txt
   ```

3. **Set up Node.js environment**:
   ```bash
   cd web
   npm install
   ```

4. **Initialize database**:
   ```bash
   cd ..
   sqlite3 db/ledgerlens.db < sql/00_schema.sql
   sqlite-utils insert db/ledgerlens.db orders_raw data_raw/ecommerce.csv --csv
   sqlite3 db/ledgerlens.db < sql/10_load_clean.sql
   sqlite3 db/ledgerlens.db < sql/20_views.sql
   ```

5. **Generate charts and CSVs**:
   ```bash
   cd py
   python charts.py
   ```

6. **Run development server**:
   ```bash
   cd ../web
   npm run dev
   ```

## 📈 CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

- **Automated Testing**: Runs tests on every push and PR
- **Code Quality**: ESLint and TypeScript type checking
- **Coverage Reports**: Generates test coverage reports
- **Automated Deployment**: Deploys to Vercel on main branch

See `.github/workflows/ci.yml` for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run tests and ensure coverage is maintained
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

