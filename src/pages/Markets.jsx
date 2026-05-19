import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { pricesAPI } from '../services/api'
import Sidebar from '../components/layout/Sidebar.jsx'

const ASSET_INFO = {
  'BTC/USDT': { name: 'Bitcoin', symbol: 'BTC', category: 'crypto', icon: '₿' },
  'ETH/USDT': { name: 'Ethereum', symbol: 'ETH', category: 'crypto', icon: 'Ξ' },
  'SOL/USDT': { name: 'Solana', symbol: 'SOL', category: 'crypto', icon: 'S' },
  'BNB/USDT': { name: 'BNB', symbol: 'BNB', category: 'crypto', icon: 'B' },
  'DOGE/USDT': { name: 'Dogecoin', symbol: 'DOGE', category: 'crypto', icon: 'D' },
  'GOLD/USDT': {
    name: 'Digital Gold',
    symbol: 'GOLD',
    category: 'commodity',
    icon: 'Au',
  },
  'OIL/USDT': {
    name: 'Crude Oil',
    symbol: 'OIL',
    category: 'commodity',
    icon: 'O',
  },
  'XAG/USDT': { name: 'Silver', symbol: 'XAG', category: 'commodity', icon: 'Ag' },
}

export default function Markets() {
  const navigate = useNavigate()
  const [prices, setPrices] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('volume')
  const [sortDir, setSortDir] = useState('desc')
  const [filter, setFilter] = useState('all')

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await pricesAPI.getAll()
        setPrices(res.data.data || {})
      } catch (err) {
        console.error('Markets fetch error:', err)
      }
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 5000)
    return () => clearInterval(interval)
  }, [])

  const marketsList = Object.keys(ASSET_INFO)
    .map((pair) => {
      const info = ASSET_INFO[pair]
      const p = prices[pair] || {}
      return {
        pair,
        ...info,
        price: p.price || 0,
        change24h: p.change24h || 0,
        volume24h: p.volume24h || 0,
        marketCap: (p.price || 0) * 1000000,
      }
    })
    .filter((m) => {
      if (filter !== 'all' && m.category !== filter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          m.name.toLowerCase().includes(q) ||
          m.symbol.toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'price') return (a.price - b.price) * mult
      if (sortBy === 'change') return (a.change24h - b.change24h) * mult
      if (sortBy === 'volume') return (a.volume24h - b.volume24h) * mult
      return 0
    })

  const totalVolume = marketsList.reduce((sum, m) => sum + m.volume24h, 0)
  const gainers = marketsList.filter((m) => m.change24h > 0).length
  const losers = marketsList.filter((m) => m.change24h < 0).length

  return (
    <div
      style={{
        display: 'flex',
        background: 'var(--navy)',
        minHeight: '100vh',
      }}
    >
      <Sidebar activePage="markets" user={user} />

      <main style={{ flex: 1, padding: '28px 40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.8rem',
              color: 'var(--text1)',
              marginBottom: '4px',
              fontWeight: 500,
            }}
          >
            Markets
          </h1>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text3)',
              letterSpacing: '0.5px',
            }}
          >
            Trade digital gold, crypto, and tokenized commodities
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {[
            {
              label: 'TOTAL MARKETS',
              value: marketsList.length,
              color: 'var(--gold)',
            },
            {
              label: '24H VOLUME',
              value: `$${(totalVolume / 1e9).toFixed(2)}B`,
              color: 'var(--emerald)',
            },
            { label: 'GAINERS', value: gainers, color: 'var(--emerald)' },
            { label: 'LOSERS', value: losers, color: 'var(--red)' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: 'var(--navy-card)',
                border: '0.5px solid var(--navy-b)',
                borderRadius: '8px',
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontSize: '0.62rem',
                  color: 'var(--text3)',
                  letterSpacing: '1.5px',
                  marginBottom: '6px',
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: '1.3rem',
                  fontFamily: "'DM Mono', monospace",
                  color: stat.color,
                  fontWeight: 500,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'crypto', 'commodity'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  border:
                    filter === f
                      ? '0.5px solid var(--gold-dim)'
                      : '0.5px solid var(--navy-b)',
                  background:
                    filter === f
                      ? 'rgba(201,166,70,0.08)'
                      : 'var(--navy-card)',
                  color: filter === f ? 'var(--gold)' : 'var(--text2)',
                  textTransform: 'capitalize',
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markets..."
            style={{
              flex: 1,
              minWidth: '180px',
              padding: '8px 12px',
              background: 'var(--navy-card)',
              border: '0.5px solid var(--navy-b)',
              borderRadius: '5px',
              color: 'var(--text1)',
              fontSize: '0.78rem',
              outline: 'none',
              fontFamily: '"DM Sans", sans-serif',
            }}
          />
        </div>

        <div
          style={{
            background: 'var(--navy-card)',
            border: '0.5px solid var(--navy-b)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 2fr 1fr 1fr 1.5fr 100px',
              padding: '14px 20px',
              borderBottom: '0.5px solid var(--navy-b)',
              fontSize: '0.62rem',
              color: 'var(--text3)',
              letterSpacing: '1.5px',
            }}
          >
            <div>#</div>
            <div>NAME</div>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (sortBy === 'price') setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                  else {
                    setSortBy('price')
                    setSortDir('desc')
                  }
                }
              }}
              onClick={() => {
                if (sortBy === 'price') setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                else {
                  setSortBy('price')
                  setSortDir('desc')
                }
              }}
              style={{ textAlign: 'right', cursor: 'pointer' }}
            >
              PRICE {sortBy === 'price' && (sortDir === 'asc' ? '↑' : '↓')}
            </div>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (sortBy === 'change')
                    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                  else {
                    setSortBy('change')
                    setSortDir('desc')
                  }
                }
              }}
              onClick={() => {
                if (sortBy === 'change')
                  setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                else {
                  setSortBy('change')
                  setSortDir('desc')
                }
              }}
              style={{ textAlign: 'right', cursor: 'pointer' }}
            >
              24H CHANGE {sortBy === 'change' && (sortDir === 'asc' ? '↑' : '↓')}
            </div>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (sortBy === 'volume')
                    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                  else {
                    setSortBy('volume')
                    setSortDir('desc')
                  }
                }
              }}
              onClick={() => {
                if (sortBy === 'volume')
                  setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                else {
                  setSortBy('volume')
                  setSortDir('desc')
                }
              }}
              style={{ textAlign: 'right', cursor: 'pointer' }}
            >
              24H VOLUME {sortBy === 'volume' && (sortDir === 'asc' ? '↑' : '↓')}
            </div>
            <div style={{ textAlign: 'right' }}>ACTION</div>
          </div>

          {marketsList.map((m, i) => (
            <div
              key={m.pair}
              onClick={() => navigate('/trading', { state: { pair: m.pair } })}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 2fr 1fr 1fr 1.5fr 100px',
                padding: '14px 20px',
                alignItems: 'center',
                borderBottom:
                  i < marketsList.length - 1
                    ? '0.5px solid rgba(255,255,255,0.04)'
                    : 'none',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <div style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>
                {i + 1}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background:
                      m.category === 'commodity'
                        ? 'rgba(201,166,70,0.1)'
                        : 'rgba(29,158,117,0.1)',
                    color:
                      m.category === 'commodity'
                        ? 'var(--gold)'
                        : 'var(--emerald)',
                    border: '0.5px solid',
                    borderColor:
                      m.category === 'commodity'
                        ? 'var(--gold-dim)'
                        : 'rgba(29,158,117,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {m.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text1)',
                      fontWeight: 500,
                    }}
                  >
                    {m.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--text3)',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {m.symbol} •{' '}
                    {m.category === 'commodity' ? 'Commodity' : 'Crypto'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  textAlign: 'right',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.82rem',
                  color: 'var(--text1)',
                }}
              >
                $
                {Number(m.price).toLocaleString('en-US', {
                  minimumFractionDigits: m.price < 1 ? 4 : 2,
                  maximumFractionDigits: m.price < 1 ? 4 : 2,
                })}
              </div>

              <div
                style={{
                  textAlign: 'right',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.78rem',
                  color: m.change24h >= 0 ? 'var(--emerald)' : 'var(--red)',
                }}
              >
                {m.change24h >= 0 ? '+' : ''}
                {Number(m.change24h).toFixed(2)}%
              </div>

              <div
                style={{
                  textAlign: 'right',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.78rem',
                  color: 'var(--text2)',
                }}
              >
                ${(m.volume24h / 1e6).toFixed(2)}M
              </div>

              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/trading', { state: { pair: m.pair } })
                  }}
                  style={{
                    padding: '6px 14px',
                    background: 'var(--gold)',
                    color: 'var(--navy)',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: '"DM Sans", sans-serif',
                  }}
                >
                  Trade
                </button>
              </div>
            </div>
          ))}

          {marketsList.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text3)',
                fontSize: '0.8rem',
              }}
            >
              No markets match your filter
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
