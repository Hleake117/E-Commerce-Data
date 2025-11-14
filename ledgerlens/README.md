# LedgerLens

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF.svg)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-3-green.svg)](https://www.sqlite.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)

> **SQL-first revenue analytics dashboard** for e-commerce data analysis with interactive visualizations, real-time KPIs, and comprehensive business insights.

## 🚀 Live Demo

**[View Live Application](https://ledgerlens.vercel.app)** (Coming soon)

## 📸 Features

- ✅ **SQL-First Architecture**: Clean data transformations using SQL views and window functions
- ✅ **Interactive Visualizations**: Dynamic charts with Recharts library (line, bar, stacked bar)
- ✅ **Real-Time KPIs**: Month-over-month growth metrics with date range filtering
- ✅ **Responsive Design**: Mobile-first approach with dark mode support
- ✅ **Date Range Filtering**: Filter data by custom date ranges with intuitive dropdowns
- ✅ **Searchable Data Tables**: Explore detailed data with search and sorting capabilities
- ✅ **CI/CD Pipeline**: Automated testing and deployment via GitHub Actions
- ✅ **Production Ready**: Deployed on Vercel with optimized build

## 📊 Tech Stack

- **Frontend**: React 19, Vite, Recharts, Custom Hooks
- **Backend**: Python 3.8+, SQLite, Pandas, Matplotlib
- **DevOps**: GitHub Actions, Vercel
- **Testing**: Vitest, React Testing Library

## 🎯 What is LedgerLens?

LedgerLens is a SQL-first mini analytics warehouse that processes **531K+ e-commerce transactions** through a complete data pipeline:

1. **Data Ingestion**: Raw CSV → SQLite database
2. **Data Transformation**: SQL-based ETL with 6 analytical views
3. **Data Visualization**: Interactive React dashboard with real-time filtering
4. **Business Intelligence**: ABC classification, MoM growth, customer segmentation

### Key Metrics

- **531,283** clean orders processed (98% data retention)
- **4,340** unique customers analyzed
- **3,829** products with ABC classification
- **38** countries tracked
- **13 months** of data (Dec 2010 - Dec 2011)

## 🏗️ Project Structure

```
ledgerlens/
├── data_raw/
│   └── ecommerce.csv          # Raw e-commerce data (541K+ rows)
├── db/
│   └── ledgerlens.db          # SQLite database (excluded from git)
├── sql/
│   ├── 00_schema.sql          # Creates orders_raw table schema
│   ├── 10_load_clean.sql     # Transforms raw data to clean orders
│   └── 20_views.sql           # Creates 6 analytical views
├── py/
│   ├── charts.py              # Generates charts and CSV exports
│   ├── requirements.txt       # Python dependencies
│   └── tests/                 # Python unit tests
└── web/
    ├── src/
    │   ├── components/
    │   │   ├── InteractiveChart.jsx    # Reusable chart component
    │   │   ├── DateRangeSelector.jsx    # Date filtering component
    │   │   ├── KPICard.jsx              # KPI display component
    │   │   └── SearchableTable.jsx     # Data table component
    │   ├── hooks/
    │   │   ├── useCsvData.js           # CSV data fetching hook
    │   │   ├── useTheme.js             # Dark/light theme hook
    │   │   └── useMediaQuery.js        # Responsive breakpoints hook
    │   ├── utils/
    │   │   └── dateFormatters.js       # Date formatting utilities
    │   ├── data/                        # CSV data files
    │   └── App.jsx                      # Main React application
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ with `pip`
- Node.js 18+ with `npm`
- SQLite3 command-line tool
- `sqlite-utils` Python package

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Hleake117/E-Commerce-Data.git
   cd E-Commerce-Data/ledgerlens
   ```

2. **Set up Python environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r py/requirements.txt
   pip install sqlite-utils  # For CSV import with proper encoding
   ```

3. **Initialize database and load data**:
   ```bash
   sqlite3 db/ledgerlens.db < sql/00_schema.sql
   sqlite-utils insert db/ledgerlens.db orders_raw data_raw/ecommerce.csv --csv
   sqlite3 db/ledgerlens.db < sql/10_load_clean.sql
   sqlite3 db/ledgerlens.db < sql/20_views.sql
   ```

4. **Generate charts and CSV exports**:
   ```bash
   cd py
   python charts.py
   ```

5. **Set up and run the React app**:
   ```bash
   cd ../web
   npm install
   npm run dev
   ```

6. **Open your browser**:
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

## 📊 Dashboard Features

### Overview Tab
- **KPI Cards**: Total Revenue, Gross Profit, Average AOV, Total Orders
- **Date Range Selector**: Filter data by custom date ranges
- **Revenue vs Gross Profit**: Interactive line chart showing monthly trends
- **Revenue MoM Growth**: Month-over-month growth percentage with color coding
- **Domestic vs Export**: Stacked bar chart showing geographic revenue breakdown
- **Average Order Value**: Trend line showing AOV over time

### Markets Tab
- **Top 10 Countries**: Horizontal bar chart showing revenue by country
- **All Countries Table**: Searchable table with revenue, profit, margin, and market share

### Customers Tab
- **Top 15 Customers**: Bar chart showing highest-value customers
- **All Customers Table**: Searchable table with customer lifetime value metrics

### Products Tab
- **Top 20 SKUs**: Bar chart with ABC classification color coding
- **All SKUs Table**: Searchable table with ABC classification and revenue share

## 🗄️ Database Views

The project creates **6 analytical views** in `sql/20_views.sql`:

### 1. `v_orders_month`
Monthly KPIs with growth metrics:
- Volume metrics: `orders`, `buyers`, `units`
- Financial metrics: `revenue`, `gross_profit`, `gross_margin_pct`
- Growth metrics: `revenue_mom_pct`, `gross_profit_mom_pct`, `aov_mom_pct`
- Geographic breakdown: `revenue_domestic`, `revenue_export`

### 2. `v_country_summary`
Revenue breakdown by country:
- Country-level metrics with revenue share
- Market share calculations
- 38 countries tracked

### 3. `v_customer_value`
Individual customer lifetime value metrics:
- Customer tenure: `first_order_date`, `last_order_date`, `active_days`
- Lifetime value: `revenue`, `gross_profit`, `avg_order_value`
- Revenue ranking and normalized metrics

### 4. `v_top_customers`
Top 50 customers filtered from `v_customer_value`

### 5. `v_sku_abc`
SKU Pareto analysis with ABC classification:
- **Class A**: Top 80% of revenue (high priority)
- **Class B**: 80-95% of revenue (medium priority)
- **Class C**: Bottom 5% of revenue (low priority)
- Cumulative revenue share for Pareto analysis

## 📈 Key Metrics & Definitions

### Month-over-Month (MoM) Growth
Percentage change from previous month:
```
MoM Growth = (Current Month - Previous Month) / Previous Month × 100
```
- Positive values (green) indicate growth
- Negative values (red) indicate decline

### ABC Classification (Pareto Analysis)
Product segmentation following the 80/20 rule:
- **Class A**: Products driving top 80% of revenue
- **Class B**: Products driving 80-95% of revenue
- **Class C**: Products driving bottom 5% of revenue

### Average Order Value (AOV)
```
AOV = Total Revenue / Number of Orders
```

### Gross Margin
```
Gross Margin % = (Gross Profit / Revenue) × 100
```
Where `Gross Profit = Revenue - COGS` (COGS estimated at 60% of revenue)

## 🧪 Testing

```bash
# Run frontend tests
cd web
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui

# Run Python tests
cd ../py
pytest
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect repository to Vercel**:
   - Push code to GitHub
   - Import repository in Vercel dashboard
   - Vercel will auto-detect Vite configuration

2. **Configure build settings**:
   - Build command: `cd ledgerlens/web && npm install && npm run build`
   - Output directory: `ledgerlens/web/dist`
   - Install command: `cd ledgerlens/web && npm install`

3. **Deploy**:
   - Vercel will automatically deploy on every push to main branch

### Local Production Build

```bash
cd web
npm run build
npm run preview
```

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System architecture and design decisions
- **[PROJECT_STATE.md](./PROJECT_STATE.md)**: Current project status and improvements
- **[RESUME_BULLET_POINTS.md](./RESUME_BULLET_POINTS.md)**: Resume bullet points for data analytics roles
- **[TESTING.md](./TESTING.md)**: Testing strategy and guidelines

## 🔧 Development

### Adding New Charts

1. Create SQL view in `sql/20_views.sql`
2. Add CSV export in `py/charts.py`
3. Add chart component in `web/src/components/`
4. Import and use in `web/src/App.jsx`

### Adding New Metrics

1. Add calculation to SQL view
2. Update CSV export in `py/charts.py`
3. Add visualization in React component
4. Update documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- UK Online Retail Dataset (2010-2011) for sample data
- Recharts for interactive chart components
- Vite for fast development experience
- SQLite for lightweight database solution

## 📞 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ for data analytics and business intelligence**
