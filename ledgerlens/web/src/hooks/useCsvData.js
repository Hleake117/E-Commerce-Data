import { useState, useEffect } from 'react'

// Simple cache to avoid re-fetching the same CSV
const csvCache = new Map()

// Helper function to clear cache (useful when parsing logic changes)
export function clearCsvCache() {
  csvCache.clear()
}

export function useCsvData(csvUrl) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // If no URL provided, skip fetching
    if (!csvUrl) {
      setData([])
      setLoading(false)
      return
    }

    // Check cache first
    if (csvCache.has(csvUrl)) {
      setData(csvCache.get(csvUrl))
      setLoading(false)
      return
    }

    // Reset states
    setLoading(true)
    setError(null)

    // Fetch CSV
    if (process.env.NODE_ENV === 'development') {
      console.log('useCsvData - Fetching CSV from:', csvUrl)
    }
    
    fetch(csvUrl)
      .then((res) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('useCsvData - Fetch response:', {
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            url: res.url,
          })
        }
        
        if (!res.ok) {
          throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`)
        }
        return res.text()
      })
      .then((text) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('useCsvData - Received text length:', text.length)
          console.log('useCsvData - First 200 chars:', text.substring(0, 200))
        }
        
        try {
          const lines = text.trim().split('\n').filter(line => line.trim().length > 0)
          
          if (process.env.NODE_ENV === 'development') {
            console.log('useCsvData - Lines after split:', lines.length)
          }
          
          if (lines.length < 2) {
            console.warn('useCsvData - Not enough lines in CSV:', lines.length)
            setData([])
            setLoading(false)
            return
          }

          // Parse CSV manually (handles quoted values and empty fields)
          const parseCSVLine = (line) => {
            const result = []
            let current = ''
            let inQuotes = false
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i]
              
              if (char === '"') {
                inQuotes = !inQuotes
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim())
                current = ''
              } else {
                current += char
              }
            }
            // Add the last field
            result.push(current.trim())
            return result
          }

          const headers = parseCSVLine(lines[0]).map(h => h.trim())
          
          if (process.env.NODE_ENV === 'development') {
            console.log('useCsvData - Headers:', headers)
            console.log('useCsvData - Header count:', headers.length)
          }
          
          const parsedData = lines.slice(1)
            .map((line, lineIndex) => {
              const values = parseCSVLine(line)
              
              // Ensure we have the same number of values as headers
              while (values.length < headers.length) {
                values.push('')
              }
              
              const obj = {}
              headers.forEach((header, i) => {
                const val = values[i] || ''
                // Try to parse as number (handle empty strings)
                if (val === '' || val === null || val === undefined) {
                  obj[header] = null
                } else {
                  const trimmedVal = String(val).trim()
                  if (trimmedVal === '') {
                    obj[header] = null
                  } else {
                    // Preserve date-like strings (YYYY-MM format) as strings
                    // Check if it matches YYYY-MM pattern before parsing as number
                    const isDateLike = /^\d{4}-\d{2}(-\d{2})?$/.test(trimmedVal)
                    if (isDateLike) {
                      obj[header] = trimmedVal
                    } else {
                      const numVal = parseFloat(trimmedVal)
                      // Only use number if it's actually a valid number and not NaN
                      obj[header] = isNaN(numVal) ? trimmedVal : numVal
                    }
                  }
                }
              })
              return obj
            })
            .filter(obj => obj && Object.keys(obj).length > 0) // Filter out empty objects

          if (process.env.NODE_ENV === 'development') {
            console.log('useCsvData - Parsed data:', {
              url: csvUrl,
              rows: parsedData.length,
              firstRow: parsedData[0],
              headers: headers.length,
              sampleData: parsedData.slice(0, 3),
            })
          }

          // Cache the result
          csvCache.set(csvUrl, parsedData)
          
          setData(parsedData)
          setLoading(false)
        } catch (parseError) {
          console.error('Failed to parse CSV:', parseError, {
            url: csvUrl,
            error: parseError.message,
            stack: parseError.stack,
          })
          setError(`Failed to parse CSV: ${parseError.message}`)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Failed to load CSV:', err, {
          url: csvUrl,
          error: err.message,
          stack: err.stack,
        })
        setError(`Failed to load CSV: ${err.message}`)
        setLoading(false)
      })
  }, [csvUrl])

  return { data, loading, error }
}

