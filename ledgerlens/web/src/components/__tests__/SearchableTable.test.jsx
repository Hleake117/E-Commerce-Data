import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SearchableTable from '../SearchableTable'

const mockColors = {
  text: '#111827',
  textSecondary: '#6b7280',
  white: '#ffffff',
  border: '#e5e7eb',
  background: '#f3f4f6',
}

const mockData = [
  { id: 1, name: 'Item 1', value: 100 },
  { id: 2, name: 'Item 2', value: 200 },
  { id: 3, name: 'Item 3', value: 300 },
]

const mockColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'value', label: 'Value', format: 'currency', sortable: true },
]

describe('SearchableTable', () => {
  it('renders table with data', () => {
    render(
      <SearchableTable
        data={mockData}
        columns={mockColumns}
        colors={mockColors}
      />
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('displays search input', () => {
    render(
      <SearchableTable
        data={mockData}
        columns={mockColumns}
        colors={mockColors}
        searchPlaceholder="Search items..."
      />
    )

    const searchInput = screen.getByPlaceholderText('Search items...')
    expect(searchInput).toBeInTheDocument()
  })

  it('filters data based on search term', async () => {
    const { user } = await import('@testing-library/user-event')
    const userEvent = user.setup()

    render(
      <SearchableTable
        data={mockData}
        columns={mockColumns}
        colors={mockColors}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search...')
    await userEvent.type(searchInput, 'Item 1')

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument()
  })

  it('shows pagination when data exceeds items per page', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: (i + 1) * 100,
    }))

    render(
      <SearchableTable
        data={largeData}
        columns={mockColumns}
        colors={mockColors}
      />
    )

    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument()
  })

  it('displays empty state when no results', () => {
    render(
      <SearchableTable
        data={[]}
        columns={mockColumns}
        colors={mockColors}
      />
    )

    expect(screen.getByText('No results found')).toBeInTheDocument()
  })
})

