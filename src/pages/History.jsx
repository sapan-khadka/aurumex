import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { walletAPI } from '../services/api'
import Sidebar from '../components/layout/Sidebar.jsx'

function normalizeHistoryPayload(raw) {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object' && Array.isArray(raw.history)) return raw.history
  return []
}

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await walletAPI.getHistory()
        const raw = res.data?.data ?? res.data
        setHistory(normalizeHistoryPayload(raw))
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear()
          navigate('/login')
        }
        console.error('History error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [navigate])

  const filtered = history.filter((item) => {
    if (filter === 'trades' && item.type !== 'trade') return false
    if (filter === 'deposits' && item.type !== 'deposit') return false
    if (filter === 'withdrawals' && item.type !== 'withdrawal') return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        (item.pair || '').toLowerCase().includes(q) ||
        (item.asset || '').toLowerCase().includes(q) ||
        (item.side || '').toLowerCase().includes(q) ||
        (item.type || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div style={{ display: 'flex', background: 'var(--navy)', minHeight: '100vh' }}>
      <Sidebar activePage="history" user={user} />

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
            Transaction History
          </h1>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text3)',
              letterSpacing: '0.5px',
            }}
          >
            All your trades, deposits, and withdrawals
          </p>
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
            {[
              { id: 'all', label: 'All' },
              { id: 'trades', label: 'Trades' },
              { id: 'deposits', label: 'Deposits' },
              { id: 'withdrawals', label: 'Withdrawals' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  border:
                    filter === f.id
                      ? '0.5px solid var(--gold-dim)'
                      : '0.5px solid var(--navy-b)',
                  background:
                    filter === f.id
                      ? 'rgba(201,166,70,0.08)'
                      : 'var(--navy-card)',
                  color: filter === f.id ? 'var(--gold)' : 'var(--text2)',
                  fontFamily: 'inherit',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by asset, pair, or type..."
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '8px 12px',
              background: 'var(--navy-card)',
              border: '0.5px solid var(--navy-b)',
              borderRadius: '5px',
              color: 'var(--text1)',
              fontSize: '0.78rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
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
              TOTAL ACTIVITY
            </div>
            <div
              style={{
                fontSize: '1.3rem',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--gold)',
                fontWeight: 500,
              }}
            >
              {history.length}
            </div>
          </div>
          <div
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
              TRADES
            </div>
            <div
              style={{
                fontSize: '1.3rem',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--emerald)',
                fontWeight: 500,
              }}
            >
              {history.filter((h) => h.type === 'trade').length}
            </div>
          </div>
          <div
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
              DEPOSITS / WITHDRAWALS
            </div>
            <div
              style={{
                fontSize: '1.3rem',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--text1)',
                fontWeight: 500,
              }}
            >
              {
                history.filter(
                  (h) =>
                    h.type === 'deposit' || h.type === 'withdrawal',
                ).length
              }
            </div>
          </div>
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
              gridTemplateColumns: '140px 90px 1fr 1fr 1fr 1fr 100px',
              padding: '14px 20px',
              borderBottom: '0.5px solid var(--navy-b)',
              fontSize: '0.62rem',
              color: 'var(--text3)',
              letterSpacing: '1.5px',
              minWidth: '900px',
            }}
          >
            <div>DATE</div>
            <div>TYPE</div>
            <div>ASSET / PAIR</div>
            <div style={{ textAlign: 'right' }}>AMOUNT</div>
            <div style={{ textAlign: 'right' }}>PRICE</div>
            <div style={{ textAlign: 'right' }}>TOTAL</div>
            <div style={{ textAlign: 'right' }}>STATUS</div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--text3)',
                  fontSize: '0.8rem',
                }}
              >
                Loading history...
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--text3)',
                  fontSize: '0.8rem',
                }}
              >
                No activity yet
              </div>
            ) : (
              filtered.map((item, i) => {
                const rowKey =
                  item.id != null
                    ? String(item.id)
                    : `${i}-${item.createdAt ?? ''}-${item.type ?? ''}`
                const d = item.createdAt ? new Date(item.createdAt) : null
                const dateLbl =
                  d && !Number.isNaN(d.getTime())
                    ? d.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'
                const st = item.status ?? '—'
                const stLower = String(st).toLowerCase()

                return (
                  <div
                    key={rowKey}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '140px 90px 1fr 1fr 1fr 1fr 100px',
                      padding: '14px 20px',
                      alignItems: 'center',
                      borderBottom:
                        i < filtered.length - 1
                          ? '0.5px solid rgba(255,255,255,0.04)'
                          : 'none',
                      fontSize: '0.78rem',
                      minWidth: '900px',
                    }}
                  >
                    <div style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>
                      {dateLbl}
                    </div>

                    <div>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                          background:
                            item.type === 'trade'
                              ? item.side === 'buy'
                                ? 'rgba(29,158,117,0.12)'
                                : 'rgba(226,75,74,0.12)'
                              : item.type === 'deposit'
                                ? 'rgba(29,158,117,0.12)'
                                : 'rgba(201,166,70,0.12)',
                          color:
                            item.type === 'trade'
                              ? item.side === 'buy'
                                ? 'var(--emerald)'
                                : 'var(--red)'
                              : item.type === 'deposit'
                                ? 'var(--emerald)'
                                : 'var(--gold)',
                        }}
                      >
                        {item.type === 'trade'
                          ? item.side || item.type
                          : item.type}
                      </span>
                    </div>

                    <div
                      style={{
                        color: 'var(--text1)',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                      }}
                    >
                      {item.pair || item.asset || '—'}
                    </div>

                    <div
                      style={{
                        textAlign: 'right',
                        fontFamily: "'DM Mono', monospace",
                        color: 'var(--text1)',
                      }}
                    >
                      {Number(item.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 8,
                      })}{' '}
                      {item.asset || item.pair?.split('/')[0] || ''}
                    </div>

                    <div
                      style={{
                        textAlign: 'right',
                        fontFamily: "'DM Mono', monospace",
                        color: 'var(--text2)',
                      }}
                    >
                      {item.price != null &&
                      item.price !== '' &&
                      Number.isFinite(Number(item.price))
                        ? `$${Number(item.price).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : '—'}
                    </div>

                    <div
                      style={{
                        textAlign: 'right',
                        fontFamily: "'DM Mono', monospace",
                        color: 'var(--text1)',
                      }}
                    >
                      {item.total != null &&
                      item.total !== '' &&
                      Number.isFinite(Number(item.total))
                        ? `$${Number(item.total).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : '—'}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                          background:
                            stLower === 'filled' ||
                            stLower === 'completed'
                              ? 'rgba(29,158,117,0.12)'
                              : stLower === 'pending'
                                ? 'rgba(201,166,70,0.12)'
                                : 'rgba(226,75,74,0.12)',
                          color:
                            stLower === 'filled' ||
                            stLower === 'completed'
                              ? 'var(--emerald)'
                              : stLower === 'pending'
                                ? 'var(--gold)'
                                : 'var(--red)',
                        }}
                      >
                        {st}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
