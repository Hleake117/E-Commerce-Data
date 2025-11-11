import { useState } from 'react'
import ChartCard from './components/ChartCard'
import revgp from './assets/rev_gp.png'
import aov from './assets/aov.png'
import ordersMonthCsv from './data/orders_month.csv?url'

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 12px',
        borderRadius: '8px 8px 0 0',
        background: active ? 'white' : '#e5e7eb',
        fontWeight: active ? 700 : 500,
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

export default function App() {
  const [tab, setTab] = useState('overview')

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800 }}>
          LedgerLens (MVP)
        </h1>
        <p style={{ marginTop: 0, color: '#6b7280' }}>SQL-first revenue analytics</p>

        <div style={{ display: 'flex', gap: 8 }}>
          <Tab active={tab === 'overview'} onClick={() => setTab('overview')}>
            Overview
          </Tab>
        </div>

        <div
          style={{
            background: 'white',
            padding: 16,
            borderRadius: '0 8px 8px 8px',
            boxShadow: '0 2px 10px rgba(0,0,0,.06)',
          }}
        >
          {tab === 'overview' && (
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
              <ChartCard
                title="Revenue vs Gross Profit (Monthly)"
                img={revgp}
                csv={ordersMonthCsv}
              />
              <ChartCard
                title="Average Order Value (Monthly)"
                img={aov}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
