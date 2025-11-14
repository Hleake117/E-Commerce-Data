// Format YYYY-MM to abbreviated "Mon YYYY" (e.g., "2010-12" -> "Dec 2010")
export function formatMonthYear(ym, format = 'abbreviated') {
  if (!ym || typeof ym !== 'string') return ym
  
  try {
    const [year, month] = ym.split('-')
    if (!year || !month) return ym
    
    const monthNum = parseInt(month, 10)
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return ym
    
    if (format === 'abbreviated') {
      // Abbreviated format: "Dec 2010"
      const monthAbbrevs = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
      return `${monthAbbrevs[monthNum - 1]} ${year}`
    } else if (format === 'short') {
      // Short format: "Dec '10"
      const monthAbbrevs = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
      const shortYear = year.slice(-2)
      return `${monthAbbrevs[monthNum - 1]} '${shortYear}`
    } else {
      // Full format: "December 2010"
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      return `${monthNames[monthNum - 1]} ${year}`
    }
  } catch (err) {
    console.error('Error formatting month year:', err)
    return ym
  }
}

// Check if a value is in YYYY-MM format
export function isMonthYearFormat(value) {
  if (!value || typeof value !== 'string') return false
  const match = value.match(/^\d{4}-\d{2}$/)
  return match !== null
}

