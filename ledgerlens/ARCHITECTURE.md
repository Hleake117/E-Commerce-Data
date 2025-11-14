# LedgerLens Architecture Documentation

## System Overview

LedgerLens is a SQL-first analytics dashboard that processes e-commerce transaction data through a multi-stage pipeline: data ingestion, transformation, analysis, and visualization.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Ingestion                            │
├─────────────────────────────────────────────────────────────┤
│  Raw CSV (ecommerce.csv)                                     │
│  - 541,909 rows                                              │
│  - UK Online Retail dataset (2010-2011)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage                              │
├─────────────────────────────────────────────────────────────┤
│  SQLite Database (ledgerlens.db)                             │
│  ├── orders_raw (raw data)                                   │
│  ├── orders (cleaned data)                                   │
│  └── 6 Analytical Views                                      │
│      ├── v_orders_month                                      │
│      ├── v_country_summary                                   │
│      ├── v_customer_value                                    │
│      ├── v_top_customers                                     │
│      ├── v_sku_abc                                           │
│      └── (additional views)                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Data Transformation                          │
├─────────────────────────────────────────────────────────────┤
│  SQL Scripts                                                 │
│  ├── 00_schema.sql (table creation)                          │
│  ├── 10_load_clean.sql (data cleaning)                       │
│  └── 20_views.sql (analytical views)                         │
│                                                              │
│  Transformations:                                            │
│  - Date parsing (MM/DD/YYYY → ISO)                           │
│  - Revenue calculations                                      │
│  - Geographic segmentation                                   │
│  - ABC classification                                        │
│  - MoM growth metrics                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Chart Generation                             │
├─────────────────────────────────────────────────────────────┤
│  Python Script (charts.py)                                   │
│  ├── Query SQLite views                                      │
│  ├── Process with Pandas                                     │
│  ├── Generate PNG charts (legacy)                            │
│  └── Export CSV files                                        │
│                                                              │
│  Outputs:                                                    │
│  - 7 PNG charts (static)                                     │
│  - 4 CSV files (interactive)                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Frontend Application                         │
├─────────────────────────────────────────────────────────────┤
│  React 19 + TypeScript + Vite                                │
│  ├── Interactive Charts (Recharts)                           │
│  ├── Data Tables (SearchableTable)                           │
│  ├── KPI Cards (KPICard)                                     │
│  └── Date Range Selector                                     │
│                                                              │
│  Features:                                                   │
│  - Real-time data visualization                              │
│  - Interactive tooltips and zoom                             │
│  - Responsive design                                         │
│  - Dark mode support                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Deployment                                   │
├─────────────────────────────────────────────────────────────┤
│  Vercel (Static Hosting)                                     │
│  ├── Automated builds                                        │
│  ├── CDN distribution                                        │
│  └── GitHub integration                                      │
│                                                              │
│  CI/CD Pipeline:                                             │
│  - GitHub Actions                                            │
│  - Automated testing                                         │
│  - Code quality checks                                       │
│  - Coverage reports                                          │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Data Ingestion
- **Input**: Raw CSV file (ecommerce.csv)
- **Process**: Load into SQLite `orders_raw` table using `sqlite-utils`
- **Encoding**: Latin-1 (handles special characters)
- **Output**: 541,909 raw rows in database

### 2. Data Cleaning
- **Input**: `orders_raw` table
- **Process**: SQL transformations in `10_load_clean.sql`
- **Transformations**:
  - Date parsing (MM/DD/YYYY → ISO format)
  - Derived columns: `order_date`, `order_month`, `order_year`, `is_export`
  - Revenue calculations: `gross_revenue`, `cogs`, `gross_profit`
  - Filters: removes negative quantities, cancellations
- **Output**: 531,283 clean orders (98% retention)

### 3. Analytical Views
- **Input**: Clean `orders` table
- **Process**: SQL views in `20_views.sql`
- **Views**:
  1. `v_orders_month`: Monthly KPIs with MoM growth
  2. `v_country_summary`: Geographic revenue breakdown
  3. `v_customer_value`: Customer lifetime value metrics
  4. `v_top_customers`: Top 50 customers
  5. `v_sku_abc`: SKU Pareto analysis with ABC classification
  6. (Additional views as needed)
- **Output**: 6 analytical views ready for querying

### 4. Chart Generation
- **Input**: SQLite views
- **Process**: Python script (`charts.py`) queries views using Pandas
- **Transformations**:
  - Data aggregation
  - Sorting and filtering
  - Formatting for visualization
- **Output**: 
  - 7 PNG charts (legacy, static)
  - 4 CSV files (for interactive charts)

### 5. Frontend Display
- **Input**: CSV files and PNG images
- **Process**: React app loads CSV data and renders with Recharts
- **Features**:
  - Interactive charts with tooltips
  - Zoom and pan capabilities
  - Data tables with search and sorting
  - KPI cards with trends
  - Date range filtering
- **Output**: Interactive dashboard in browser

## Component Architecture

### Frontend Components

```
App.jsx
├── ErrorBoundary (Error handling)
├── Tab Navigation (Overview, Markets, Customers, Products)
├── Overview Tab
│   ├── DateRangeSelector
│   ├── KPICard (4 cards: Revenue, Profit, AOV, Orders)
│   └── InteractiveChart (4 charts)
├── Markets Tab
│   ├── InteractiveChart (Top 10 Countries)
│   └── SearchableTable (All Countries)
├── Customers Tab
│   ├── InteractiveChart (Top 15 Customers)
│   └── SearchableTable (All Customers)
└── Products Tab
    ├── InteractiveChart (Top 20 SKUs with ABC classification)
    └── SearchableTable (All SKUs)
```

### Custom Hooks

- `useCsvData`: Fetches and parses CSV data with caching
- `useTheme`: Manages light/dark theme with localStorage persistence
- `useMediaQuery`: Handles responsive design breakpoints

### Chart Components

- `InteractiveChart`: Generic chart component supporting:
  - Line charts
  - Bar charts
  - Stacked bar charts
  - Horizontal bar charts
- Features:
  - Tooltips with custom formatting
  - Responsive design
  - Theme support
  - Data filtering and sorting
  - Custom color mapping

## Database Schema

### Tables

#### `orders_raw`
- Raw data from CSV file
- No transformations applied
- Used as staging area

#### `orders`
- Cleaned and transformed data
- Derived columns added
- Filters applied (negative quantities, cancellations removed)

### Views

#### `v_orders_month`
- Monthly aggregations
- MoM growth metrics
- Revenue and profit trends

#### `v_country_summary`
- Geographic revenue breakdown
- Country-level metrics
- Market share calculations

#### `v_customer_value`
- Customer lifetime value
- Order history
- Revenue rankings

#### `v_top_customers`
- Top 50 customers
- Filtered from `v_customer_value`

#### `v_sku_abc`
- SKU performance metrics
- ABC classification (Pareto analysis)
- Revenue share calculations

## Technology Stack

### Backend
- **Python 3.8+**: Chart generation and data processing
- **SQLite**: Database storage
- **Pandas**: Data manipulation
- **Matplotlib**: Static chart generation (legacy)

### Frontend
- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Recharts**: Interactive chart library

### DevOps
- **GitHub Actions**: CI/CD pipeline
- **Vercel**: Deployment platform
- **Vitest**: Testing framework
- **ESLint**: Code quality

## Performance Considerations

### Data Processing
- SQLite views are materialized for faster queries
- CSV files are cached in browser memory
- Data is pre-processed to minimize client-side computation

### Frontend
- Lazy loading of chart components
- Memoization of computed values
- Efficient re-rendering with React hooks
- Responsive design for mobile devices

### Deployment
- Static site generation for fast loading
- CDN distribution for global access
- Optimized bundle sizes with Vite
- Code splitting for reduced initial load

## Security Considerations

### Data Privacy
- No sensitive customer data exposed
- Data is anonymized in views
- CSV files contain aggregated data only

### Frontend Security
- No user input validation needed (read-only)
- XSS protection via React
- HTTPS enforced in production

## Scalability

### Current Limitations
- SQLite database (single file)
- Static CSV files
- Client-side data processing

### Future Improvements
- Migrate to PostgreSQL for larger datasets
- Implement API for dynamic data fetching
- Server-side rendering for better performance
- Real-time data updates with WebSockets

## Monitoring and Logging

### Current Implementation
- Browser console logging for errors
- Error boundaries for React components
- GitHub Actions for build status

### Future Improvements
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance monitoring (Web Vitals)
- User feedback collection

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Hook testing
- Utility function testing

### Integration Tests
- Chart rendering tests
- Data loading tests
- User interaction tests

### E2E Tests
- Full user flow testing
- Cross-browser testing
- Performance testing

## Deployment Strategy

### Development
- Local development server
- Hot module replacement
- Source maps for debugging

### Staging
- Preview deployments on Vercel
- Automated testing
- Code review process

### Production
- Automated deployment on main branch
- CDN distribution
- Error monitoring
- Performance tracking

## Maintenance

### Regular Tasks
- Update dependencies
- Monitor error logs
- Review performance metrics
- Update documentation

### Data Updates
- Regenerate charts when data changes
- Update CSV files
- Rebuild and redeploy frontend

## Future Enhancements

### Features
- Real-time data updates
- Advanced filtering options
- Export functionality (PDF, Excel)
- Custom date ranges
- Comparison views
- Forecast charts

### Technical
- TypeScript migration completion
- Increased test coverage (70%+)
- Performance optimization
- Accessibility improvements
- Internationalization (i18n)

