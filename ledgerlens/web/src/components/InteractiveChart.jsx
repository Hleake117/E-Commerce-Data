import { useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Cell } from 'recharts'
import { useCsvData } from '../hooks/useCsvData'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { formatMonthYear, isMonthYearFormat } from '../utils/dateFormatters'

export default function InteractiveChart({ 
  type, 
  dataUrl, 
  data: propData, // Allow passing data directly
  title, 
  description, 
  colors,
  xKey = 'ym',
  dataKey,
  dataKeys,
  formatValue,
  height = 400,
  sortKey, // Key to sort by for top N items
  limit, // Limit number of items to display
  reverse = false, // Reverse order for display
}) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  // Only fetch if dataUrl is provided and no propData is provided
  const shouldFetch = !propData && dataUrl
  const { data: fetchedData, loading, error } = useCsvData(shouldFetch ? dataUrl : null)
  
  const defaultColors = {
    primary: '#2563eb',
    secondary: '#10b981',
    success: '#10b981',
    error: '#dc2626',
    text: '#111827',
    textSecondary: '#6b7280',
    white: '#ffffff',
    border: '#e5e7eb',
    background: '#f3f4f6',
  }
  const themeColors = colors || defaultColors

  const chartData = useMemo(() => {
    try {
      // Use prop data if provided, otherwise use fetched data
      const sourceData = propData || fetchedData
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('InteractiveChart - sourceData:', sourceData)
        console.log('InteractiveChart - propData:', propData)
        console.log('InteractiveChart - fetchedData:', fetchedData)
        console.log('InteractiveChart - loading:', loading)
        console.log('InteractiveChart - error:', error)
      }
      
      if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('InteractiveChart - No source data available')
        }
        return []
      }
      
      let processedData = sourceData.map(row => {
        if (!row || typeof row !== 'object') {
          return null
        }
        // Ensure the xKey value is preserved as a string (important for date formatting)
        const xValue = row[xKey]
        const xValueStr = xValue != null ? String(xValue) : ''
        return {
          ...row,
          // Preserve original xKey value as string for proper formatting
          [xKey]: xValueStr,
        }
      }).filter(Boolean) // Remove null entries
      
      if (process.env.NODE_ENV === 'development') {
        console.log('InteractiveChart - processedData length:', processedData.length)
        console.log('InteractiveChart - first row:', processedData[0])
      }
      
      // Apply sorting and limiting if specified
      if (sortKey && limit) {
        processedData = [...processedData]
          .sort((a, b) => {
            const aVal = a[sortKey] || 0
            const bVal = b[sortKey] || 0
            return bVal - aVal // Descending order
          })
          .slice(0, limit)
      }
      
      // Reverse if needed (for horizontal bar charts)
      if (reverse && processedData.length > 0) {
        processedData = [...processedData].reverse()
      }
      
      return processedData
    } catch (err) {
      console.error('Error processing chart data:', err)
      return []
    }
  }, [propData, fetchedData, xKey, sortKey, limit, reverse, loading, error])

  const formatTooltipValue = (value, name) => {
    try {
      if (formatValue) {
        return formatValue(value, name)
      }
      if (value == null || value === undefined || value === '') {
        return 'N/A'
      }
      if (typeof value === 'number') {
        if (isNaN(value)) return 'N/A'
        if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
        if (value < 1 && value > 0) return `${(value * 100).toFixed(1)}%`
        return `$${value.toFixed(2)}`
      }
      return String(value)
    } catch (err) {
      console.error('Error formatting tooltip value:', err)
      return String(value)
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Format label if it's a date in YYYY-MM format
      const formattedLabel = isMonthYearFormat(label) ? formatMonthYear(label, 'abbreviated') : label
      
      return (
        <div style={{
          background: themeColors.white,
          border: `1px solid ${themeColors.border}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: themeColors.text }}>
            {formattedLabel}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color }}>
              {`${entry.name}: ${formatTooltipValue(entry.value, entry.dataKey)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Only show loading if we're fetching from URL and no propData is provided
  const isLoading = shouldFetch && loading
  const hasError = shouldFetch && error
  const hasData = chartData && Array.isArray(chartData) && chartData.length > 0
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('InteractiveChart render:', {
      title,
      isLoading,
      hasError,
      hasData,
      chartDataLength: chartData?.length || 0,
      fetchedDataLength: fetchedData?.length || 0,
      propDataLength: propData?.length || 0,
      shouldFetch,
      loading,
      error,
      dataUrl: dataUrl?.substring(0, 50) + '...',
    })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: themeColors.textSecondary,
        background: themeColors.white,
        borderRadius: '12px',
        border: `1px solid ${themeColors.border}`,
        minHeight: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        Loading chart data...
      </div>
    )
  }

  // Show error if fetching failed
  if (hasError) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: themeColors.error,
        background: themeColors.white,
        borderRadius: '12px',
        border: `1px solid ${themeColors.border}`,
        minHeight: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 600 }}>⚠️ Chart Error</div>
        <div style={{ fontSize: '12px' }}>
          {error}
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '8px', fontSize: '10px', color: themeColors.textSecondary }}>
            URL: {dataUrl}
          </div>
        )}
      </div>
    )
  }

  // Show message if no data (but only after loading is complete)
  if (!hasData && !isLoading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: themeColors.textSecondary,
        background: themeColors.white,
        borderRadius: '12px',
        border: `1px solid ${themeColors.border}`,
        minHeight: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 600 }}>No Data Available</div>
        <div style={{ fontSize: '12px' }}>
          {!dataUrl && !propData 
            ? 'No data source provided' 
            : 'Data is empty or could not be loaded'}
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '8px', fontSize: '10px', color: themeColors.textSecondary, textAlign: 'left' }}>
            <div>fetchedData length: {fetchedData?.length || 0}</div>
            <div>propData length: {propData?.length || 0}</div>
            <div>chartData length: {chartData?.length || 0}</div>
            <div>shouldFetch: {String(shouldFetch)}</div>
            <div>loading: {String(loading)}</div>
            <div>error: {String(error)}</div>
            <div>dataUrl: {dataUrl ? dataUrl.substring(0, 80) + '...' : 'none'}</div>
            {fetchedData && fetchedData.length > 0 && (
              <div>First row: {JSON.stringify(fetchedData[0])}</div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderChart = () => {
    // Validate that we have data
    if (!chartData || chartData.length === 0) {
      return null
    }

    // Validate that we have required props
    if (!xKey) {
      console.error('InteractiveChart: xKey is required')
      return null
    }

    // Validate that dataKeys or dataKey is provided
    if (!dataKeys && !dataKey) {
      console.error('InteractiveChart: dataKeys or dataKey is required')
      return null
    }

    try {
      switch (type) {
        case 'line':
          return (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
            <XAxis 
              type="category"
              dataKey={xKey} 
              stroke={themeColors.textSecondary}
              tick={{ fill: themeColors.textSecondary, fontSize: isMobile ? 9 : 11 }}
              angle={isMobile ? -45 : -30}
              textAnchor={isMobile ? 'end' : 'end'}
              height={isMobile ? 70 : 50}
              interval={0}
              tickFormatter={(value) => {
                return isMonthYearFormat(value) ? formatMonthYear(value, 'abbreviated') : value
              }}
            />
            <YAxis 
              stroke={themeColors.textSecondary}
              tick={{ fill: themeColors.textSecondary, fontSize: isMobile ? 10 : 12 }}
              tickFormatter={(value) => {
                try {
                  return formatTooltipValue(value)
                } catch (err) {
                  return String(value)
                }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }} />
            {Array.isArray(dataKeys) && dataKeys.length > 0 ? (
              dataKeys.map((key, index) => (
                <Line
                  key={typeof key === 'object' ? (key.key || `line-${index}`) : `line-${index}`}
                  type="monotone"
                  dataKey={typeof key === 'object' ? key.key : key}
                  name={typeof key === 'object' ? key.name : key}
                  stroke={typeof key === 'object' ? (key.color || (index === 0 ? themeColors.primary : themeColors.secondary)) : (index === 0 ? themeColors.primary : themeColors.secondary)}
                  strokeWidth={2}
                  dot={{ r: isMobile ? 3 : 4 }}
                  activeDot={{ r: isMobile ? 5 : 6 }}
                />
              ))
            ) : dataKey ? (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={themeColors.primary}
                strokeWidth={2}
                dot={{ r: isMobile ? 3 : 4 }}
                activeDot={{ r: isMobile ? 5 : 6 }}
              />
            ) : null}
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
            <XAxis 
              type="category"
              dataKey={xKey} 
              stroke={themeColors.textSecondary}
              tick={{ fill: themeColors.textSecondary, fontSize: isMobile ? 9 : 11 }}
              angle={isMobile ? -45 : -30}
              textAnchor={isMobile ? 'end' : 'end'}
              height={isMobile ? 70 : 50}
              interval={0}
              tickFormatter={(value) => {
                return isMonthYearFormat(value) ? formatMonthYear(value, 'abbreviated') : value
              }}
            />
            <YAxis 
              stroke={themeColors.textSecondary}
              tick={{ fill: themeColors.textSecondary, fontSize: isMobile ? 10 : 12 }}
              tickFormatter={(value) => {
                try {
                  return formatTooltipValue(value)
                } catch (err) {
                  return String(value)
                }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }} />
            {Array.isArray(dataKeys) && dataKeys.length > 0 ? (
              dataKeys.map((key, index) => (
                <Bar
                  key={typeof key === 'object' ? (key.key || `bar-${index}`) : `bar-${index}`}
                  dataKey={typeof key === 'object' ? key.key : key}
                  name={typeof key === 'object' ? key.name : key}
                  fill={typeof key === 'object' ? (key.color || (index === 0 ? themeColors.primary : themeColors.secondary)) : (index === 0 ? themeColors.primary : themeColors.secondary)}
                />
              ))
            ) : dataKey ? (
              <Bar dataKey={dataKey} fill={themeColors.primary} />
            ) : null}
          </BarChart>
        )

      case 'stackedBar':
        return (
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
            <XAxis 
              type="category"
              dataKey={xKey} 
              stroke={themeColors.textSecondary}
              tick={{ fill: themeColors.textSecondary, fontSize: isMobile ? 9 : 11 }}
              angle={isMobile ? -45 : -30}
              textAnchor={isMobile ? 'end' : 'end'}
              height={isMobile ? 70 : 50}
              interval={0}
              tickFormatter={(value) => {
                return isMonthYearFormat(value) ? formatMonthYear(value, 'abbreviated') : value
              }}
            />
            <YAxis 
              stroke={themeColors.textSecondary}
              tick={{ fill: themeColors.textSecondary, fontSize: isMobile ? 10 : 12 }}
              tickFormatter={(value) => {
                try {
                  return formatTooltipValue(value)
                } catch (err) {
                  return String(value)
                }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }} />
            {Array.isArray(dataKeys) && dataKeys.length > 0 ? (
              dataKeys.map((key, index) => (
                <Bar
                  key={typeof key === 'object' ? (key.key || `stacked-bar-${index}`) : `stacked-bar-${index}`}
                  dataKey={typeof key === 'object' ? key.key : key}
                  name={typeof key === 'object' ? key.name : key}
                  stackId="a"
                  fill={typeof key === 'object' ? (key.color || (index === 0 ? themeColors.primary : themeColors.secondary)) : (index === 0 ? themeColors.primary : themeColors.secondary)}
                />
              ))
            ) : null}
          </BarChart>
        )

      case 'horizontalBar':
        return (
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
            <XAxis 
              type="number"
              stroke={themeColors.textSecondary}
              tick={{ fill: themeColors.textSecondary, fontSize: isMobile ? 10 : 12 }}
              tickFormatter={(value) => {
                try {
                  return formatTooltipValue(value)
                } catch (err) {
                  return String(value)
                }
              }}
            />
            <YAxis 
              type="category"
              dataKey={xKey} 
              stroke={themeColors.textSecondary}
              tick={{ fill: themeColors.textSecondary, fontSize: isMobile ? 9 : 11 }}
              width={isMobile ? 90 : 110}
              tickFormatter={(value) => {
                return isMonthYearFormat(value) ? formatMonthYear(value, 'abbreviated') : value
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }} />
            {Array.isArray(dataKeys) && dataKeys.length > 0 ? (
              dataKeys.map((key, index) => {
                const keyObj = typeof key === 'object' ? key : { key, name: key }
                const dataKey = keyObj.key || key
                const baseFill = keyObj.color || (index === 0 ? themeColors.primary : themeColors.secondary)
                return (
                  <Bar
                    key={dataKey || `horizontal-bar-${index}`}
                    dataKey={dataKey}
                    name={keyObj.name || dataKey}
                    fill={baseFill}
                  >
                    {keyObj.colorMap && chartData.map((entry, entryIndex) => {
                      const cellColor = keyObj.colorMap(entry[dataKey], entry) || baseFill
                      return <Cell key={`cell-${entryIndex}`} fill={cellColor} />
                    })}
                  </Bar>
                )
              })
            ) : dataKey ? (
              <Bar dataKey={dataKey} fill={themeColors.primary} />
            ) : null}
          </BarChart>
        )

      default:
        console.error(`InteractiveChart: Unknown chart type: ${type}`)
        return null
    }
    } catch (err) {
      console.error('Error in renderChart:', err)
      throw err // Re-throw to be caught by outer error boundary
    }
  }

  return (
    <div style={{
      padding: isMobile ? '16px' : '20px',
      borderRadius: '12px',
      background: themeColors.white,
      boxShadow: '0 2px 10px rgba(0,0,0,.06)',
      border: `1px solid ${themeColors.border}`,
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      {title && (
        <h3 style={{
          marginBottom: description ? '8px' : '16px',
          fontSize: isMobile ? '16px' : '18px',
          fontWeight: 600,
          color: themeColors.text,
          lineHeight: 1.3,
        }}>
          {title}
        </h3>
      )}
      {description && (
        <p style={{
          marginBottom: '16px',
          fontSize: isMobile ? '12px' : '13px',
          color: themeColors.textSecondary,
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      )}
      {hasData ? (
        <ResponsiveContainer width="100%" height={height}>
          {(() => {
            try {
              const chart = renderChart()
              if (!chart) {
                if (process.env.NODE_ENV === 'development') {
                  console.error('InteractiveChart - renderChart returned null')
                }
                return (
                  <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: themeColors.error,
                    fontSize: '12px',
                  }}>
                    Chart rendering returned null. Check console for details.
                  </div>
                )
              }
              return chart
            } catch (err) {
              console.error('Error rendering chart:', err)
              return (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: themeColors.error,
                  background: themeColors.white,
                  borderRadius: '12px',
                  border: `1px solid ${themeColors.border}`,
                  height: `${height}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}>
                  <div style={{ marginBottom: '8px', fontWeight: 600 }}>⚠️ Chart Rendering Error</div>
                  <div style={{ fontSize: '12px' }}>
                    {err.message || 'An error occurred while rendering the chart'}
                  </div>
                </div>
              )
            }
          })()}
        </ResponsiveContainer>
      ) : (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: themeColors.textSecondary,
          fontSize: '14px',
        }}>
          No data available to render chart
        </div>
      )}
    </div>
  )
}

