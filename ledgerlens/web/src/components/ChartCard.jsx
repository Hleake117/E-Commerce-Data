import { useState, useEffect, useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function ChartCard({ title, img, csv, description, colors }) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [csvError, setCsvError] = useState(false)
  const imgRef = useRef(null)
  
  const defaultColors = {
    text: '#111827',
    textSecondary: '#6b7280',
    white: '#ffffff',
    border: '#e5e7eb',
    background: '#f3f4f6',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    error: '#dc2626',
    errorBg: '#fef2f2',
    errorBorder: '#fecaca',
  }
  const themeColors = colors || defaultColors

  // Check if image is already loaded (from cache) when component mounts or img changes
  useEffect(() => {
    if (!img) {
      setImageLoading(false)
      return
    }
    
    // Reset states when image changes
    setImageLoading(true)
    setImageError(false)
    
    // Create image to check if already cached
    const testImage = new Image()
    testImage.onload = () => {
      setImageLoading(false)
    }
    testImage.onerror = () => {
      setImageError(true)
      setImageLoading(false)
    }
    testImage.src = img
    
    // If image is already complete (cached), it won't fire onload
    // So we check immediately
    if (testImage.complete) {
      setImageLoading(false)
    }
  }, [img])

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleCsvClick = (e) => {
    if (!csv) {
      e.preventDefault()
      setCsvError(true)
      return
    }
    setCsvError(false)
  }

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
      <h3 style={{ 
        marginBottom: 8, 
        fontSize: isMobile ? '16px' : '18px', 
        fontWeight: 600, 
        color: themeColors.text,
        lineHeight: 1.3,
      }}>
        {title}
      </h3>
      {description && (
        <p style={{ 
          marginBottom: 12, 
          fontSize: isMobile ? '12px' : '13px', 
          color: themeColors.textSecondary, 
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      )}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        {imageLoading && !imageError && (
          <div
            style={{
              width: '100%',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: themeColors.background,
              borderRadius: 8,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <div style={{ color: themeColors.textSecondary, fontSize: '14px' }}>Loading chart...</div>
          </div>
        )}
        {imageError ? (
          <div
            style={{
              width: '100%',
              height: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: themeColors.errorBg,
              borderRadius: 8,
              border: `1px solid ${themeColors.errorBorder}`,
              color: themeColors.error,
              fontSize: '14px',
              padding: 20,
            }}
          >
            <div style={{ marginBottom: 8, fontWeight: 600 }}>⚠️ Chart not available</div>
            <div style={{ fontSize: '12px', textAlign: 'center' }}>
              The chart image could not be loaded. Please regenerate charts using the Python script.
            </div>
          </div>
        ) : (
          <img
            ref={imgRef}
            alt={title}
            src={img}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              width: '100%',
              borderRadius: 8,
              border: `1px solid ${themeColors.border}`,
              display: imageLoading ? 'none' : 'block',
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s',
            }}
          />
        )}
      </div>
      {csv && (
        <div>
          <a
            href={csv}
            download
            onClick={handleCsvClick}
            style={{
              display: 'inline-block',
              marginTop: 8,
              padding: '8px 16px',
              background: csvError ? themeColors.error : themeColors.primary,
              color: themeColors.text === '#f9fafb' ? themeColors.text : '#ffffff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!csvError) {
                e.target.style.background = themeColors.primaryHover
              }
            }}
            onMouseLeave={(e) => {
              if (!csvError) {
                e.target.style.background = themeColors.primary
              }
            }}
          >
            {csvError ? 'CSV unavailable' : 'Download CSV'}
          </a>
          {csvError && (
            <div style={{ marginTop: 8, fontSize: '12px', color: themeColors.error }}>
              CSV file not found. Please regenerate data files.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
