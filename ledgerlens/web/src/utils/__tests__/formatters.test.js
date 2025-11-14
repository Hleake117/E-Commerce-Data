import { describe, it, expect } from 'vitest'

// Format currency utility
export function formatCurrency(value) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

describe('formatCurrency', () => {
  it('should format millions correctly', () => {
    expect(formatCurrency(1500000)).toBe('$1.5M')
    expect(formatCurrency(5000000)).toBe('$5.0M')
  })

  it('should format thousands correctly', () => {
    expect(formatCurrency(1500)).toBe('$2K')
    expect(formatCurrency(50000)).toBe('$50K')
  })

  it('should format small values correctly', () => {
    expect(formatCurrency(100)).toBe('$100')
    expect(formatCurrency(50)).toBe('$50')
  })

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })
})

