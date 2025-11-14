import { useMediaQuery } from '../hooks/useMediaQuery'

export default function KPICard({ label, value, subtitle, trend, colors }) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const defaultColors = {
    text: '#111827',
    textSecondary: '#6b7280',
    white: '#ffffff',
    border: '#e5e7eb',
    success: '#10b981',
    error: '#ef4444',
  }
  const themeColors = colors || defaultColors
  
  return (
    <div
      style={{
        padding: isMobile ? '16px' : '20px',
        borderRadius: 12,
        background: themeColors.white,
        boxShadow: '0 2px 10px rgba(0,0,0,.06)',
        border: `1px solid ${themeColors.border}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      <div style={{ 
        fontSize: isMobile ? '11px' : '13px', 
        color: themeColors.textSecondary, 
        marginBottom: 8, 
        fontWeight: 500,
        lineHeight: 1.4,
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: isMobile ? '22px' : '28px', 
        fontWeight: 700, 
        color: themeColors.text, 
        marginBottom: 4,
        lineHeight: 1.2,
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ 
          fontSize: isMobile ? '11px' : '12px', 
          color: themeColors.textSecondary, 
          marginTop: 4,
          lineHeight: 1.4,
        }}>
          {subtitle}
        </div>
      )}
      {trend && (
        <div
          style={{
            fontSize: isMobile ? '11px' : '12px',
            color: trend > 0 ? themeColors.success : trend < 0 ? themeColors.error : themeColors.textSecondary,
            marginTop: 8,
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  )
}

