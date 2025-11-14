import { useMediaQuery } from '../hooks/useMediaQuery'
import { formatMonthYear } from '../utils/dateFormatters'

export default function DateRangeSelector({ 
  startMonth, 
  endMonth, 
  availableMonths, 
  onStartChange, 
  onEndChange,
  colors 
}) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      marginBottom: 20,
      padding: '12px 16px',
      background: colors.white,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
    }}>
      <label style={{
        fontSize: isMobile ? '12px' : '14px',
        color: colors.text,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        Date Range:
      </label>
      <select
        value={startMonth}
        onChange={(e) => onStartChange(e.target.value)}
        style={{
          padding: '6px 12px',
          border: `1px solid ${colors.border}`,
          borderRadius: '6px',
          background: colors.white,
          color: colors.text,
          fontSize: isMobile ? '12px' : '14px',
          cursor: 'pointer',
          minWidth: isMobile ? '140px' : '160px',
        }}
      >
        {availableMonths.map(month => (
          <option key={month} value={month}>
            {formatMonthYear(month, 'abbreviated')}
          </option>
        ))}
      </select>
      <span style={{
        color: colors.textSecondary,
        fontSize: isMobile ? '12px' : '14px',
      }}>
        to
      </span>
      <select
        value={endMonth}
        onChange={(e) => onEndChange(e.target.value)}
        style={{
          padding: '6px 12px',
          border: `1px solid ${colors.border}`,
          borderRadius: '6px',
          background: colors.white,
          color: colors.text,
          fontSize: isMobile ? '12px' : '14px',
          cursor: 'pointer',
          minWidth: isMobile ? '140px' : '160px',
        }}
      >
        {availableMonths.map(month => (
          <option key={month} value={month}>
            {formatMonthYear(month, 'abbreviated')}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          if (availableMonths.length > 0) {
            onStartChange(availableMonths[0])
            onEndChange(availableMonths[availableMonths.length - 1])
          }
        }}
        style={{
          padding: '6px 12px',
          background: colors.primary,
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontSize: isMobile ? '11px' : '12px',
          cursor: 'pointer',
          fontWeight: 500,
          marginLeft: 'auto',
        }}
      >
        Reset to All
      </button>
    </div>
  )
}

