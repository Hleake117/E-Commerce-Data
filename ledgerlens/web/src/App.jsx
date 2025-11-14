import { useState, Component, useEffect, useMemo } from 'react'
import ChartCard from './components/ChartCard'
import InteractiveChart from './components/InteractiveChart'
import KPICard from './components/KPICard'
import DateRangeSelector from './components/DateRangeSelector'
import SearchableTable from './components/SearchableTable'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useTheme } from './hooks/useTheme'
import { useCsvData } from './hooks/useCsvData'
import revgp from './assets/rev_gp.png'
import aov from './assets/aov.png'
import revenueMom from './assets/revenue_mom.png'
import domesticExport from './assets/domestic_export.png'
import topCountries from './assets/top_countries.png'
import topCustomers from './assets/top_customers.png'
import topSkus from './assets/top_skus.png'
import ordersMonthCsv from './data/orders_month.csv?url'
import countrySummaryCsv from './data/country_summary.csv?url'
import topCustomersCsv from './data/top_customers.csv?url'
import skuAbcCsv from './data/sku_abc.csv?url'
import { formatMonthYear } from './utils/dateFormatters'

// Constants
const TABS = {
  OVERVIEW: 'overview',
  MARKETS: 'markets',
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
}

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const colors = this.props.colors || {
        background: '#f3f4f6',
        white: '#ffffff',
        border: '#e5e7eb',
        error: '#dc2626',
        textSecondary: '#6b7280',
        primary: '#2563eb',
      }
      
      return (
        <div
          style={{
            minHeight: '100vh',
            background: colors.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 600,
              background: colors.white,
              padding: 32,
              borderRadius: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,.06)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2 style={{ marginTop: 0, color: colors.error, fontSize: '20px', fontWeight: 700 }}>
              ⚠️ Something went wrong
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: 8 }}>
              An error occurred while rendering the dashboard.
            </p>
            {this.state.error && (
              <div style={{ 
                marginBottom: 16, 
                padding: '12px', 
                background: '#fef2f2', 
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: colors.error,
                maxHeight: '200px',
                overflow: 'auto',
              }}>
                <strong>Error:</strong> {this.state.error.toString()}
                {this.state.error.stack && (
                  <details style={{ marginTop: '8px' }}>
                    <summary style={{ cursor: 'pointer', color: colors.textSecondary }}>Stack trace</summary>
                    <pre style={{ marginTop: '8px', fontSize: '10px', whiteSpace: 'pre-wrap' }}>
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: colors.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                marginRight: '8px',
              }}
            >
              Reload Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '10px 20px',
                background: colors.border,
                color: colors.text,
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function Tab({ active, onClick, children, isMobile, colors }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: isMobile ? '10px 12px' : '10px 16px',
        borderRadius: '8px 8px 0 0',
        background: active ? colors.white : colors.border,
        fontWeight: active ? 700 : 500,
        border: 'none',
        cursor: 'pointer',
        fontSize: isMobile ? '12px' : '14px',
        color: active ? colors.text : colors.textSecondary,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

export default function App() {
  const [tab, setTab] = useState(TABS.OVERVIEW)
  const [allMonthlyData, setAllMonthlyData] = useState([])
  const [kpiLoading, setKpiLoading] = useState(true)
  const [startMonth, setStartMonth] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 767px)')
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { theme, toggleTheme, colors } = useTheme()

  useEffect(() => {
    // Load monthly data to calculate KPIs
    fetch(ordersMonthCsv)
      .then((res) => res.text())
      .then((text) => {
        const lines = text.trim().split('\n')
        const headers = lines[0].split(',')
        const data = lines.slice(1).map((line) => {
          const values = line.split(',')
          const obj = {}
          headers.forEach((header, i) => {
            const val = values[i] || ''
            // Preserve date-like strings (YYYY-MM format) as strings
            const trimmedVal = String(val).trim()
            const isDateLike = /^\d{4}-\d{2}(-\d{2})?$/.test(trimmedVal)
            if (isDateLike) {
              obj[header] = trimmedVal
            } else {
              // Try to parse as number
              const numVal = parseFloat(val)
              obj[header] = isNaN(numVal) ? val : numVal
            }
          })
          return obj
        })

        if (data.length > 0) {
          setAllMonthlyData(data)
          // Set initial date range to all data
          const months = data.map(row => row.ym).filter(Boolean)
          if (months.length > 0) {
            setStartMonth(months[0])
            setEndMonth(months[months.length - 1])
          }
        }
        setKpiLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load KPI data:', err)
        setKpiLoading(false)
      })
  }, [])

  // Filter data based on date range and calculate KPIs
  const kpiData = useMemo(() => {
    if (!allMonthlyData.length || !startMonth || !endMonth) return null

    const filtered = allMonthlyData.filter(row => {
      const month = row.ym
      return month >= startMonth && month <= endMonth
    })

    if (filtered.length === 0) return null

    const latest = filtered[filtered.length - 1]
    const previous = filtered.length > 1 ? filtered[filtered.length - 2] : null
    
    const totalRevenue = filtered.reduce((sum, row) => sum + (row.revenue || 0), 0)
    const totalProfit = filtered.reduce((sum, row) => sum + (row.gross_profit || 0), 0)
    const avgAov = filtered.reduce((sum, row) => sum + (row.aov || 0), 0) / filtered.length
    const totalOrders = filtered.reduce((sum, row) => sum + (row.orders || 0), 0)
    
    const revenueMom = previous && previous.revenue > 0
      ? ((latest.revenue - previous.revenue) / previous.revenue) * 100
      : null

    return {
      totalRevenue,
      totalProfit,
      avgAov,
      totalOrders,
      revenueMom,
      latestMonth: latest.ym || 'N/A',
      filteredData: filtered,
    }
  }, [allMonthlyData, startMonth, endMonth])

  const availableMonths = useMemo(() => {
    return allMonthlyData.map(row => row.ym).filter(Boolean).sort()
  }, [allMonthlyData])

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toFixed(0)}`
  }

  return (
    <ErrorBoundary colors={colors}>
      <div style={{ minHeight: '100vh', background: colors.background, transition: 'background 0.3s' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '16px' : '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <h1 style={{ 
                margin: '0 0 4px', 
                fontSize: isMobile ? '24px' : '28px', 
                fontWeight: 800, 
                color: colors.text,
                lineHeight: 1.2,
              }}>
                LedgerLens
              </h1>
              <p style={{ 
                marginTop: 0, 
                color: colors.textSecondary, 
                fontSize: isMobile ? '12px' : '14px',
                lineHeight: 1.5,
              }}>
                SQL-first revenue analytics dashboard
              </p>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px 12px',
                background: colors.white,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: isMobile ? '20px' : '24px',
                color: colors.text,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '44px',
                minHeight: '44px',
              }}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: 4, 
            marginTop: 20, 
            borderBottom: `1px solid ${colors.border}`,
            overflowX: isMobile ? 'auto' : 'visible',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            <style>{`
              div::-webkit-scrollbar { display: none; }
            `}</style>
            <Tab active={tab === TABS.OVERVIEW} onClick={() => setTab(TABS.OVERVIEW)} isMobile={isMobile} colors={colors}>
              Overview
            </Tab>
            <Tab active={tab === TABS.MARKETS} onClick={() => setTab(TABS.MARKETS)} isMobile={isMobile} colors={colors}>
              Markets
            </Tab>
            <Tab active={tab === TABS.CUSTOMERS} onClick={() => setTab(TABS.CUSTOMERS)} isMobile={isMobile} colors={colors}>
              Customers
            </Tab>
            <Tab active={tab === TABS.PRODUCTS} onClick={() => setTab(TABS.PRODUCTS)} isMobile={isMobile} colors={colors}>
              Products
            </Tab>
          </div>

          <div
            style={{
              background: colors.white,
              padding: isMobile ? '16px' : '24px',
              borderRadius: '0 8px 8px 8px',
              boxShadow: theme === 'dark' ? '0 2px 10px rgba(0,0,0,.3)' : '0 2px 10px rgba(0,0,0,.06)',
              minHeight: '500px',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          >
          {tab === TABS.OVERVIEW && (
            <div>
              {kpiLoading ? (
                <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>
                  Loading summary metrics...
                </div>
              ) : kpiData && availableMonths.length > 0 ? (
                <>
                  <DateRangeSelector
                    startMonth={startMonth}
                    endMonth={endMonth}
                    availableMonths={availableMonths}
                    onStartChange={setStartMonth}
                    onEndChange={setEndMonth}
                    colors={colors}
                  />
                <div style={{ 
                  display: 'grid', 
                  gap: isMobile ? 12 : 16, 
                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
                  marginBottom: 24,
                }}>
                  <KPICard
                    label="Total Revenue"
                    value={formatCurrency(kpiData.totalRevenue)}
                    subtitle={startMonth === availableMonths[0] && endMonth === availableMonths[availableMonths.length - 1] 
                      ? `Latest: ${formatMonthYear(kpiData.latestMonth, 'abbreviated')}` 
                      : `${formatMonthYear(startMonth, 'abbreviated')} to ${formatMonthYear(endMonth, 'abbreviated')}`}
                    trend={kpiData.revenueMom}
                    colors={colors}
                  />
                  <KPICard
                    label="Total Gross Profit"
                    value={formatCurrency(kpiData.totalProfit)}
                    subtitle={`${((kpiData.totalProfit / kpiData.totalRevenue) * 100).toFixed(1)}% margin`}
                    colors={colors}
                  />
                  <KPICard
                    label="Average AOV"
                    value={`$${kpiData.avgAov.toFixed(0)}`}
                    subtitle={startMonth === availableMonths[0] && endMonth === availableMonths[availableMonths.length - 1]
                      ? "Across all months"
                      : `${formatMonthYear(startMonth, 'abbreviated')} to ${formatMonthYear(endMonth, 'abbreviated')}`}
                    colors={colors}
                  />
                  <KPICard
                    label="Total Orders"
                    value={kpiData.totalOrders.toLocaleString()}
                    subtitle={startMonth === availableMonths[0] && endMonth === availableMonths[availableMonths.length - 1]
                      ? `Latest: ${formatMonthYear(kpiData.latestMonth, 'abbreviated')}`
                      : `${formatMonthYear(startMonth, 'abbreviated')} to ${formatMonthYear(endMonth, 'abbreviated')}`}
                    colors={colors}
                  />
                </div>
                </>
              ) : null}
              <div style={{ 
                display: 'grid', 
                gap: isMobile ? 16 : 20, 
                gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
              }}>
                <InteractiveChart
                  type="line"
                  dataUrl={ordersMonthCsv}
                  title="Revenue vs Gross Profit (Monthly)"
                  description="Monthly revenue and gross profit trends"
                  colors={colors}
                  xKey="ym"
                  dataKeys={[
                    { key: 'revenue', name: 'Revenue', color: colors.primary },
                    { key: 'gross_profit', name: 'Gross Profit', color: colors.success },
                  ]}
                  formatValue={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
                    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
                    return `$${value.toFixed(0)}`
                  }}
                  height={350}
                />
                <InteractiveChart
                  type="line"
                  dataUrl={ordersMonthCsv}
                  title="Revenue MoM Growth"
                  description="Month-over-month revenue growth percentage"
                  colors={colors}
                  xKey="ym"
                  dataKey="revenue_mom_pct"
                  dataKeys={[
                    { 
                      key: 'revenue_mom_pct', 
                      name: 'MoM Growth %', 
                      color: colors.primary,
                      colorMap: (value) => value > 0 ? colors.success : colors.error
                    },
                  ]}
                  formatValue={(value) => {
                    if (value == null) return 'N/A'
                    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
                  }}
                  height={350}
                />
                <InteractiveChart
                  type="stackedBar"
                  dataUrl={ordersMonthCsv}
                  title="Domestic vs Export Revenue"
                  description="UK domestic vs international export breakdown"
                  colors={colors}
                  xKey="ym"
                  dataKeys={[
                    { key: 'revenue_domestic', name: 'Domestic', color: colors.primary },
                    { key: 'revenue_export', name: 'Export', color: colors.secondary || '#8b5cf6' },
                  ]}
                  formatValue={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
                    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
                    return `$${value.toFixed(0)}`
                  }}
                  height={350}
                />
                <InteractiveChart
                  type="line"
                  dataUrl={ordersMonthCsv}
                  title="Average Order Value (Monthly)"
                  description="Average order value trend over time"
                  colors={colors}
                  xKey="ym"
                  dataKey="aov"
                  formatValue={(value) => `$${value.toFixed(2)}`}
                  height={350}
                />
              </div>
              {/* Fallback static charts section - can be removed after testing */}
              <div style={{ 
                display: 'none',
                gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
                gap: isMobile ? 16 : 20,
                marginTop: 20,
              }}>
                <ChartCard
                  title="Revenue vs Gross Profit (Monthly) - Static"
                  img={revgp}
                  csv={ordersMonthCsv}
                  description="Monthly revenue and gross profit trends (static fallback)"
                  colors={colors}
                />
              </div>
            </div>
          )}

          {tab === TABS.MARKETS && (
            <MarketsTab 
              colors={colors} 
              isMobile={isMobile}
              countrySummaryCsv={countrySummaryCsv}
              topCountries={topCountries}
            />
          )}

          {tab === TABS.CUSTOMERS && (
            <CustomersTab 
              colors={colors} 
              isMobile={isMobile}
              topCustomersCsv={topCustomersCsv}
              topCustomers={topCustomers}
            />
          )}

          {tab === TABS.PRODUCTS && (
            <ProductsTab 
              colors={colors} 
              isMobile={isMobile}
              skuAbcCsv={skuAbcCsv}
              topSkus={topSkus}
            />
          )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Markets Tab Component
function MarketsTab({ colors, isMobile, countrySummaryCsv, topCountries }) {
  const { data, loading } = useCsvData(countrySummaryCsv)

  const columns = [
    { key: 'country', label: 'Country', sortable: true },
    { key: 'revenue', label: 'Revenue', format: 'currency', align: 'right', sortable: true },
    { key: 'gross_profit', label: 'Gross Profit', format: 'currency', align: 'right', sortable: true },
    { key: 'gross_margin_pct', label: 'Margin', format: 'percentage', align: 'right', sortable: true },
    { key: 'orders', label: 'Orders', format: 'number', align: 'right', sortable: true },
    { key: 'revenue_share', label: 'Share', format: 'percentage', align: 'right', sortable: true },
  ]


  return (
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }}>
      <InteractiveChart
        type="horizontalBar"
        dataUrl={countrySummaryCsv}
        title="Top 10 Countries by Revenue"
        description="Geographic revenue distribution and market share"
        colors={colors}
        xKey="country"
        sortKey="revenue"
        limit={10}
        reverse={true}
        dataKeys={[
          { key: 'revenue', name: 'Revenue', color: colors.primary },
        ]}
        formatValue={(value) => {
          if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
          if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
          return `$${value.toFixed(0)}`
        }}
        height={400}
      />
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>
          Loading country data...
        </div>
      ) : (
        <SearchableTable
          data={data}
          columns={columns}
          searchPlaceholder="Search countries..."
          colors={colors}
          title="All Countries"
        />
      )}
    </div>
  )
}

// Customers Tab Component
function CustomersTab({ colors, isMobile, topCustomersCsv, topCustomers }) {
  const { data, loading } = useCsvData(topCustomersCsv)

  const columns = [
    { key: 'customer_id', label: 'Customer ID', sortable: true },
    { key: 'revenue', label: 'Revenue', format: 'currency', align: 'right', sortable: true },
    { key: 'gross_profit', label: 'Gross Profit', format: 'currency', align: 'right', sortable: true },
    { key: 'orders', label: 'Orders', format: 'number', align: 'right', sortable: true },
    { key: 'avg_order_value', label: 'Avg Order Value', format: 'currency', align: 'right', sortable: true },
    { key: 'revenue_rank', label: 'Rank', format: 'number', align: 'right', sortable: true },
  ]


  return (
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }}>
      <InteractiveChart
        type="horizontalBar"
        dataUrl={topCustomersCsv}
        title="Top 15 Customers by Lifetime Revenue"
        description="Highest-value customers ranked by total revenue"
        colors={colors}
        xKey="customer_id"
        sortKey="revenue"
        limit={15}
        reverse={true}
        dataKeys={[
          { key: 'revenue', name: 'Revenue', color: colors.primary },
        ]}
        formatValue={(value) => {
          if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
          if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
          return `$${value.toFixed(0)}`
        }}
        height={500}
      />
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>
          Loading customer data...
        </div>
      ) : (
        <SearchableTable
          data={data}
          columns={columns}
          searchPlaceholder="Search customer IDs..."
          colors={colors}
          title="All Customers"
        />
      )}
    </div>
  )
}

// Products Tab Component
function ProductsTab({ colors, isMobile, skuAbcCsv, topSkus }) {
  const { data, loading } = useCsvData(skuAbcCsv)

  const columns = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'revenue', label: 'Revenue', format: 'currency', align: 'right', sortable: true },
    { key: 'gross_profit', label: 'Gross Profit', format: 'currency', align: 'right', sortable: true },
    { key: 'units', label: 'Units', format: 'number', align: 'right', sortable: true },
    { key: 'revenue_share', label: 'Share', format: 'percentage', align: 'right', sortable: true },
    { key: 'abc_class', label: 'ABC Class', sortable: true },
  ]


  // ABC class color mapping
  const getAbcColor = (abcClass) => {
    switch (abcClass) {
      case 'A':
        return colors.success || '#10b981'
      case 'B':
        return '#f59e0b' // amber
      case 'C':
        return colors.textSecondary || '#6b7280'
      default:
        return colors.primary
    }
  }

  return (
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }}>
      <InteractiveChart
        type="horizontalBar"
        dataUrl={skuAbcCsv}
        title="Top 20 SKUs by Revenue (ABC Classification)"
        description="Product performance with Pareto analysis (A=top 80%, B=80-95%, C=bottom 5%)"
        colors={colors}
        xKey="sku"
        sortKey="revenue"
        limit={20}
        reverse={true}
        dataKeys={[
          { 
            key: 'revenue', 
            name: 'Revenue', 
            color: colors.primary,
            colorMap: (value, entry) => getAbcColor(entry.abc_class),
          },
        ]}
        formatValue={(value) => {
          if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
          if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
          return `$${value.toFixed(0)}`
        }}
        height={600}
      />
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>
          Loading SKU data...
        </div>
      ) : (
        <SearchableTable
          data={data}
          columns={columns}
          searchPlaceholder="Search SKUs..."
          colors={colors}
          title="All SKUs (3,829 total)"
        />
      )}
    </div>
  )
}
