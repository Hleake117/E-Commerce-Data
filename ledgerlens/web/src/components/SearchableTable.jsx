import { useState, useMemo } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

const ITEMS_PER_PAGE = 20

export default function SearchableTable({ 
  data, 
  columns, 
  searchPlaceholder = 'Search...',
  colors,
  title,
}) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('desc')

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(row => {
        return columns.some(col => {
          const value = row[col.key]
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        const comparison = typeof aVal === 'number' 
          ? aVal - bVal 
          : String(aVal || '').localeCompare(String(bVal || ''))
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [data, searchTerm, sortColumn, sortDirection, columns])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  const formatValue = (value, format) => {
    if (value == null) return '-'
    if (format === 'currency') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
      return `$${value.toFixed(0)}`
    }
    if (format === 'percentage') {
      return `${(value * 100).toFixed(1)}%`
    }
    if (format === 'number') {
      return value.toLocaleString()
    }
    return String(value)
  }

  return (
    <div style={{
      background: colors.white,
      borderRadius: 12,
      border: `1px solid ${colors.border}`,
      overflow: 'hidden',
    }}>
      {title && (
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${colors.border}`,
          background: colors.background || '#f9fafb',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 600,
            color: colors.text,
          }}>
            {title}
          </h3>
        </div>
      )}
      
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            background: colors.white,
            color: colors.text,
            fontSize: '14px',
          }}
        />
        <div style={{
          marginTop: 8,
          fontSize: '12px',
          color: colors.textSecondary,
        }}>
          Showing {paginatedData.length} of {filteredAndSortedData.length} results
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: isMobile ? '12px' : '14px',
        }}>
          <thead>
            <tr style={{
              background: colors.background || '#f9fafb',
              borderBottom: `2px solid ${colors.border}`,
            }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    padding: '12px',
                    textAlign: col.align || 'left',
                    fontWeight: 600,
                    color: colors.text,
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {col.sortable !== false && sortColumn === col.key && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                }}>
                  No results found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: `1px solid ${colors.border}`,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.background || '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      style={{
                        padding: '12px',
                        textAlign: col.align || 'left',
                        color: colors.text,
                      }}
                    >
                      {formatValue(row[col.key], col.format)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '6px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              background: currentPage === 1 ? colors.background : colors.white,
              color: currentPage === 1 ? colors.textSecondary : colors.text,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Previous
          </button>
          <span style={{
            color: colors.textSecondary,
            fontSize: '14px',
          }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              background: currentPage === totalPages ? colors.background : colors.white,
              color: currentPage === totalPages ? colors.textSecondary : colors.text,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

