import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import { adminAPI } from '../services/api'
import { userIsAdmin } from '../utils/adminAccess.js'

const ORDER_PAIRS = [
  '',
  'BTC/USDT',
  'ETH/USDT',
  'GOLD/USDT',
  'OIL/USDT',
  'SOL/USDT',
  'BNB/USDT',
  'XAG/USDT',
  'DOGE/USDT',
]

const statCardBase = {
  background: 'var(--navy-card)',
  border: '0.5px solid var(--navy-b)',
  borderRadius: '8px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
}

const labelUpper = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text3)',
}

function normalizeUsers(payload) {
  const d = payload?.data ?? payload
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.users)) return d.users
  return []
}

function normalizeOrders(payload) {
  const d = payload?.data ?? payload
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.orders)) return d.orders
  return []
}

function pickStat(stats, keys, fallback = null) {
  if (!stats || typeof stats !== 'object') return fallback
  for (const k of keys) {
    const v = stats[k]
    if (v !== undefined && v !== null && v !== '') return v
  }
  return fallback
}

function fmtUsd(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `$${Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function fmtInt(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('en-US')
}

function userRowId(u) {
  return u?.id ?? u?.user_id ?? u?.uuid ?? u?.email
}

function isUserSuspended(u) {
  const st = String(u?.status || '').toLowerCase()
  if (st === 'suspended' || st === 'inactive') return true
  if (u?.suspended === true) return true
  if (u?.is_active === false) return true
  return false
}

export default function Admin() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [authorized, setAuthorized] = useState(null)
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState('users')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [orderStatus, setOrderStatus] = useState('')
  const [orderPair, setOrderPair] = useState('')
  const [toggleBusyId, setToggleBusyId] = useState(null)

  useEffect(() => {
    if (!userIsAdmin(user)) {
      navigate('/dashboard', { replace: true })
      return
    }
    setAuthorized(true)
  }, [navigate])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats()
      setStats(res.data?.data ?? res.data ?? null)
    } catch (err) {
      console.error('Admin stats error:', err)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      const res = await adminAPI.getUsers(params)
      setUsers(normalizeUsers(res.data))
    } catch (err) {
      console.error('Admin users error:', err)
    }
  }, [debouncedSearch])

  const fetchOrders = useCallback(async () => {
    try {
      const params = {}
      if (orderStatus) params.status = orderStatus
      if (orderPair) params.pair = orderPair
      const res = await adminAPI.getOrders(params)
      setOrders(normalizeOrders(res.data))
    } catch (err) {
      console.error('Admin orders error:', err)
    }
  }, [orderStatus, orderPair])

  useEffect(() => {
    if (!authorized) return

    fetchStats()
    const interval = setInterval(() => {
      fetchStats()
      if (tab === 'users') fetchUsers()
      if (tab === 'orders') fetchOrders()
    }, 30000)

    return () => clearInterval(interval)
  }, [authorized, tab, fetchStats, fetchUsers, fetchOrders])

  useEffect(() => {
    if (!authorized || tab !== 'users') return
    fetchUsers()
  }, [authorized, tab, debouncedSearch, fetchUsers])

  useEffect(() => {
    if (!authorized || tab !== 'orders') return
    fetchOrders()
  }, [authorized, tab, orderStatus, orderPair, fetchOrders])

  const handleToggleUser = async (row) => {
    const id = userRowId(row)
    if (id == null) return
    setToggleBusyId(id)
    try {
      await adminAPI.toggleUserActive(id)
      await fetchUsers()
    } catch (err) {
      console.error('Toggle user error:', err)
    } finally {
      setToggleBusyId(null)
    }
  }

  if (!authorized) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--navy)',
          color: 'var(--gold)',
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        Checking access...
      </div>
    )
  }

  const totalUsersVal = fmtInt(pickStat(stats, ['totalUsers', 'total_users', 'users']))
  const volumeVal = fmtUsd(pickStat(stats, ['volume24hUSD', 'volume24h', 'totalVolume24h']))
  const activeUsersVal = fmtInt(pickStat(stats, ['activeUsers24h', 'active_users_24h']))
  const feesVal = fmtUsd(pickStat(stats, ['fees24hUSD', 'fees24h', 'totalFees24h']))

  const selectStyle = {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '0.5px solid var(--navy-b2)',
    background: 'var(--navy-card2)',
    color: 'var(--text1)',
    fontFamily: 'inherit',
    fontSize: '12px',
    cursor: 'pointer',
    minWidth: '140px',
  }

  const inputSearchStyle = {
    width: '100%',
    maxWidth: '320px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '0.5px solid var(--navy-b2)',
    background: 'var(--navy-card2)',
    color: 'var(--text1)',
    fontFamily: 'inherit',
    fontSize: '13px',
  }

  const thStyle = {
    padding: '10px 12px',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text3)',
    borderBottom: '0.5px solid var(--navy-b2)',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  }

  const tdStyle = {
    padding: '12px',
    fontSize: '12px',
    color: 'var(--text1)',
    borderBottom: '0.5px solid rgba(255,255,255,0.04)',
    verticalAlign: 'middle',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activePage="admin" user={user} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: 'var(--navy)',
        }}
      >
        <header
          style={{
            height: '50px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.2rem',
            background: 'var(--navy-mid)',
            borderBottom: '0.5px solid var(--navy-b)',
          }}
        >
          <span style={{ fontWeight: 500, color: 'var(--gold)' }}>
            Admin Dashboard
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
            Auto-refresh · 30s
          </span>
        </header>

        <div
          style={{
            flex: 1,
            padding: '1.2rem',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                ...statCardBase,
                borderLeft: '4px solid var(--gold)',
              }}
            >
              <div style={labelUpper}>Total Users</div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '1.55rem',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {totalUsersVal}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                Registered accounts
              </div>
            </div>
            <div
              style={{
                ...statCardBase,
                borderLeft: '4px solid var(--emerald)',
              }}
            >
              <div style={labelUpper}>Total Volume 24h</div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '1.55rem',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {volumeVal}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                Platform-wide trading volume
              </div>
            </div>
            <div
              style={{
                ...statCardBase,
                borderLeft: '4px solid var(--blue)',
              }}
            >
              <div style={labelUpper}>Active Users 24h</div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '1.55rem',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {activeUsersVal}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                Unique sessions / activity window
              </div>
            </div>
            <div
              style={{
                ...statCardBase,
                borderLeft: '4px solid var(--gold)',
              }}
            >
              <div style={labelUpper}>Total Fees 24h</div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '1.55rem',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {feesVal}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                Fees collected (USD)
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--navy-card)',
              border: '0.5px solid var(--navy-b2)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', borderBottom: '0.5px solid var(--navy-b2)' }}>
              {[
                { id: 'users', label: 'Users' },
                { id: 'orders', label: 'Orders' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    background: tab === t.id ? 'var(--navy-card2)' : 'transparent',
                    color: tab === t.id ? 'var(--gold)' : 'var(--text2)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    borderBottom:
                      tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '14px 16px 18px' }}>
              {tab === 'users' ? (
                <>
                  <input
                    placeholder="Search by email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{ ...inputSearchStyle, marginBottom: '14px' }}
                  />
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: '920px',
                      }}
                    >
                      <thead>
                        <tr>
                          {[
                            'Email',
                            'Name',
                            'Joined',
                            'KYC',
                            'Balance',
                            'Status',
                            'Action',
                          ].map((h) => (
                            <th key={h} style={thStyle}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              style={{
                                ...tdStyle,
                                textAlign: 'center',
                                color: 'var(--text3)',
                                padding: '28px',
                              }}
                            >
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((u, idx) => {
                            const rowKey = userRowId(u) ?? `user-${idx}`
                            const suspended = isUserSuspended(u)
                            const kyc =
                              u.kyc_level ?? u.kycLevel ?? u.kyc ?? 0
                            const joined =
                              u.created_at ??
                              u.createdAt ??
                              u.joined_at ??
                              u.joinedAt
                            const balanceUsd =
                              u.total_balance_usd ??
                              u.balanceUsd ??
                              u.totalUsd ??
                              u.balanceUSD ??
                              0

                            const kycColors = [
                              'rgba(255,255,255,0.08)',
                              'rgba(201,166,70,0.15)',
                              'rgba(29,158,117,0.15)',
                            ]
                            const kycBorder = [
                              '0.5px solid var(--navy-b)',
                              '0.5px solid rgba(201,166,70,0.35)',
                              '0.5px solid rgba(29,158,117,0.35)',
                            ]

                            return (
                              <tr key={rowKey}>
                                <td style={tdStyle}>{u.email || '—'}</td>
                                <td style={tdStyle}>
                                  {u.full_name ?? u.fullName ?? '—'}
                                </td>
                                <td style={{ ...tdStyle, color: 'var(--text3)' }}>
                                  {joined
                                    ? new Date(joined).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })
                                    : '—'}
                                </td>
                                <td style={tdStyle}>
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      padding: '4px 10px',
                                      borderRadius: '999px',
                                      background: kycColors[Number(kyc)] ?? kycColors[0],
                                      border:
                                        kycBorder[Number(kyc)] ?? kycBorder[0],
                                      color:
                                        Number(kyc) >= 2
                                          ? 'var(--emerald)'
                                          : Number(kyc) >= 1
                                            ? 'var(--gold)'
                                            : 'var(--text2)',
                                    }}
                                  >
                                    Level {Number(kyc) >= 0 ? Number(kyc) : 0}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    ...tdStyle,
                                    fontFamily: "'DM Mono', monospace",
                                  }}
                                >
                                  {fmtUsd(balanceUsd)}
                                </td>
                                <td style={tdStyle}>
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      padding: '4px 10px',
                                      borderRadius: '999px',
                                      background: suspended
                                        ? 'rgba(226,75,74,0.12)'
                                        : 'rgba(29,158,117,0.12)',
                                      border: suspended
                                        ? '0.5px solid rgba(226,75,74,0.35)'
                                        : '0.5px solid rgba(29,158,117,0.35)',
                                      color: suspended ? 'var(--red)' : 'var(--emerald)',
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {suspended ? 'Suspended' : 'Active'}
                                  </span>
                                </td>
                                <td style={tdStyle}>
                                  <button
                                    type="button"
                                    disabled={toggleBusyId === rowKey}
                                    onClick={() => handleToggleUser(u)}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      border: suspended
                                        ? '0.5px solid rgba(29,158,117,0.35)'
                                        : '0.5px solid rgba(226,75,74,0.35)',
                                      background: suspended
                                        ? 'rgba(29,158,117,0.12)'
                                        : 'rgba(226,75,74,0.12)',
                                      color: suspended ? 'var(--emerald)' : 'var(--red)',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      cursor:
                                        toggleBusyId === rowKey
                                          ? 'not-allowed'
                                          : 'pointer',
                                      fontFamily: 'inherit',
                                      opacity: toggleBusyId === rowKey ? 0.55 : 1,
                                    }}
                                  >
                                    {suspended ? 'Activate' : 'Suspend'}
                                  </button>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: '14px',
                    }}
                  >
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">All statuses</option>
                      <option value="open">Open</option>
                      <option value="filled">Filled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                      value={orderPair}
                      onChange={(e) => setOrderPair(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">All pairs</option>
                      {ORDER_PAIRS.filter(Boolean).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: '980px',
                      }}
                    >
                      <thead>
                        <tr>
                          {[
                            'Time',
                            'User',
                            'Pair',
                            'Side',
                            'Type',
                            'Amount',
                            'Price',
                            'Status',
                            'Fee',
                          ].map((h) => (
                            <th key={h} style={thStyle}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              style={{
                                ...tdStyle,
                                textAlign: 'center',
                                color: 'var(--text3)',
                                padding: '28px',
                              }}
                            >
                              No orders match filters
                            </td>
                          </tr>
                        ) : (
                          orders.map((o, idx) => {
                            const oid =
                              o.id ??
                              `${o.pair}-${o.createdAt}-${idx}`
                            const userLabel =
                              o.user_email ??
                              o.email ??
                              o.userEmail ??
                              o.user?.email ??
                              '—'
                            const created =
                              o.created_at ?? o.createdAt ?? o.updated_at
                            const priceNum = Number(o.price)

                            return (
                              <tr key={oid}>
                                <td style={{ ...tdStyle, color: 'var(--text3)' }}>
                                  {created
                                    ? new Date(created).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : '—'}
                                </td>
                                <td style={tdStyle}>{userLabel}</td>
                                <td style={tdStyle}>{o.pair || '—'}</td>
                                <td
                                  style={{
                                    ...tdStyle,
                                    color:
                                      o.side === 'buy'
                                        ? 'var(--emerald)'
                                        : 'var(--red)',
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {o.side || '—'}
                                </td>
                                <td style={{ ...tdStyle, textTransform: 'capitalize' }}>
                                  {o.type || '—'}
                                </td>
                                <td
                                  style={{
                                    ...tdStyle,
                                    fontFamily: "'DM Mono', monospace",
                                  }}
                                >
                                  {Number(o.amount).toLocaleString('en-US', {
                                    maximumFractionDigits: 6,
                                  })}
                                </td>
                                <td
                                  style={{
                                    ...tdStyle,
                                    fontFamily: "'DM Mono', monospace",
                                  }}
                                >
                                  {Number.isFinite(priceNum) && priceNum > 0
                                    ? `$${priceNum.toLocaleString('en-US')}`
                                    : '—'}
                                </td>
                                <td style={{ ...tdStyle, textTransform: 'capitalize' }}>
                                  {o.status || '—'}
                                </td>
                                <td
                                  style={{
                                    ...tdStyle,
                                    fontFamily: "'DM Mono', monospace",
                                  }}
                                >
                                  {o.fee != null && o.fee !== ''
                                    ? `$${Number(o.fee).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 4,
                                      })}`
                                    : '—'}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
