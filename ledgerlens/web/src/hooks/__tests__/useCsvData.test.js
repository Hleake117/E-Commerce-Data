import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCsvData } from '../useCsvData'

// Mock fetch
global.fetch = vi.fn()

describe('useCsvData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load and parse CSV data correctly', async () => {
    const csvContent = `name,value,count
Item1,100,5
Item2,200,10`

    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => csvContent,
    })

    const { result } = renderHook(() => useCsvData('/test.csv'))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data[0]).toEqual({
      name: 'Item1',
      value: 100,
      count: 5,
    })
    expect(result.current.data[1]).toEqual({
      name: 'Item2',
      value: 200,
      count: 10,
    })
  })

  it('should handle empty CSV', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'header1,header2',
    })

    const { result } = renderHook(() => useCsvData('/empty.csv'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })

  it('should handle fetch errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCsvData('/error.csv'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.data).toEqual([])
  })

  it('should cache CSV data', async () => {
    const csvContent = `name,value
Item1,100`

    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => csvContent,
    })

    const { result: result1 } = renderHook(() => useCsvData('/test.csv'))
    await waitFor(() => {
      expect(result1.current.loading).toBe(false)
    })

    // Second hook should use cache
    const { result: result2 } = renderHook(() => useCsvData('/test.csv'))
    expect(result2.current.loading).toBe(false)
    expect(result2.current.data).toHaveLength(1)

    // Fetch should only be called once
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

