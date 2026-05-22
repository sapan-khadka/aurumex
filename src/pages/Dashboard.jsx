import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Sidebar from '../components/layout/Sidebar.jsx'
import { walletAPI, ordersAPI, pricesAPI } from '../services/api'

const fmtUsd = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

function DistributionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload
  if (!p) return null
  return (
    <div
      style={{
        background: 'var(--navy-mid)',
        border: '0.5px solid var(--navy-b)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        color: 'var(--text1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '3px',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: p.fill,
            display: 'inline-block',
          }}
        />
        <span style={{ fontWeight: 600 }}>{p.name}</span>
      </div>
      <div style={{ fontFamily: 'DM Mono, monospace' }}>
        {fmtUsd(p.usd)}
        <span style={{ color: 'var(--text3)' }}> · {p.pct.toFixed(1)}%</span>
      </div>
    </div>
  )
}

const card = {
  background: 'var(--navy-card)',
  borderRadius: '10px',
  border: '0.5px solid var(--navy-b2)',
}

const labelUpper = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text3)',
  marginBottom: '12px',
}

const ASSET_FILL = {
  BTC: 'var(--emerald)',
  ETH: 'var(--blue)',
  GOLD: 'var(--gold)',
  USDT: 'var(--text3)',
  DEFAULT: 'var(--purple)',
}

function ActionBtn({ bg, color, icon, label, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 10px',
        borderRadius: '8px',
        border: 'none',
        background: bg,
        color,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '12px',
        fontWeight: 600,
        opacity: hover ? 0.92 : 1,
        transform: hover ? 'translateY(-1px)' : 'none',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: '22px' }} aria-hidden />
      <span>{label}</span>
    </button>
  )
}

function buildDistribution(wallets) {
  if (!wallets?.length) return []
  const total = wallets.reduce((s, w) => s + (Number(w.usdValue) || 0), 0)
  if (!Number.isFinite(total) || total <= 0) return []
  return wallets
    .map((w) => {
      const usd = Number(w.usdValue) || 0
      return {
        name: w.asset,
        usd,
        pct: (usd / total) * 100,
        fill: ASSET_FILL[w.asset] || ASSET_FILL.DEFAULT,
      }
    })
    .filter((d) => d.usd > 0)
    .sort((a, b) => b.usd - a.usd)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [walletData, setWalletData] = useState(null)
  const [orders, setOrders] = useState([])
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [hoverHolding, setHoverHolding] = useState(null)
  const [hoverTx, setHoverTx] = useState(null)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [walletRes, ordersRes, pricesRes] = await Promise.all([
          walletAPI.getBalances(),
          ordersAPI.getHistory(),
          pricesAPI.getAll(),
        ])
        setWalletData(walletRes.data.data)
        const rawOrders = ordersRes.data.data
        const orderList = Array.isArray(rawOrders?.orders)
          ? rawOrders.orders
          : Array.isArray(rawOrders)
            ? rawOrders
            : []
        setOrders(orderList)
        setPrices(pricesRes.data.data || {})
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear()
          navigate('/login')
        }
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [navigate])

  const distributionData = useMemo(
    () => buildDistribution(walletData?.wallets),
    [walletData],
  )

  const openOrdersCount = useMemo(() => {
    return orders.filter((o) => {
      const s = String(o.status || '').toLowerCase()
      return s === 'open' || s === 'pending' || s === 'new'
    }).length
  }, [orders])

  const totalFeesOrderSample = useMemo(() => {
    return orders.reduce((s, o) => s + (Number(o.fee) || 0), 0)
  }, [orders])

  const todayPnL =
    walletData?.todayPnLUSD ??
    walletData?.pnl24h ??
    walletData?.dayChangeUsd ??
    null
  const todayPnLPct =
    walletData?.todayPnLPct ?? walletData?.pnl24hPct ?? walletData?.dayChangePct ?? null

  const statRows = [
    {
      label: 'Today P&L',
      value:
        todayPnL != null && Number.isFinite(Number(todayPnL))
          ? `${Number(todayPnL) >= 0 ? '+' : '-'}$${Math.abs(Number(todayPnL)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '—',
      valueColor:
        todayPnL != null && Number(todayPnL) < 0 ? 'var(--red)' : 'var(--emerald)',
      serif: false,
    },
    {
      label: 'Open Orders',
      value: String(openOrdersCount),
      valueColor: 'var(--text1)',
      serif: true,
    },
    {
      label: '30-Day Return',
      value:
        walletData?.return30dPct != null
          ? `${Number(walletData.return30dPct) >= 0 ? '+' : ''}${Number(walletData.return30dPct).toFixed(1)}%`
          : '—',
      valueColor: 'var(--emerald)',
      serif: false,
    },
    {
      label: 'Fee Saved',
      value:
        walletData?.feeSavedUSD != null
          ? `$${Number(walletData.feeSavedUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : totalFeesOrderSample > 0
            ? `$${totalFeesOrderSample.toFixed(2)}`
            : '—',
      valueColor: 'var(--gold)',
      serif: false,
    },
  ]

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--navy)',
          color: 'var(--gold)',
          fontSize: '1rem',
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        Loading your portfolio...
      </div>
    )
  }

  const totalDisplay = `$${(walletData?.totalUSD != null ? Number(walletData.totalUSD) : 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

  const showPnLBadge =
    todayPnL != null &&
    Number.isFinite(Number(todayPnL)) &&
    todayPnLPct != null &&
    Number.isFinite(Number(todayPnLPct))

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activePage="dashboard" user={user} />
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
          <span style={{ fontWeight: 500, color: 'var(--text1)' }}>
            Portfolio Overview
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'var(--red-bg)',
                color: 'var(--red)',
              }}
            >
              2 alerts
            </span>
            <button
              type="button"
              onClick={() => navigate('/history')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'var(--text2)',
                display: 'flex',
                borderRadius: '6px',
              }}
              aria-label="Notifications"
            >
              <i className="ti ti-bell" style={{ fontSize: '20px' }} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'var(--text2)',
                display: 'flex',
                lineHeight: 0,
                borderRadius: '6px',
              }}
              aria-label="Settings"
            >
              <i className="ti ti-settings" style={{ fontSize: '20px' }} />
            </button>
          </div>
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
              gridTemplateColumns: '1.4fr 1fr',
              gap: '12px',
            }}
          >
            <div style={{ ...card, padding: '1.25rem' }}>
              <div style={labelUpper}>Total Portfolio Value</div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '2.65rem',
                  fontWeight: 700,
                  color: 'var(--text1)',
                  lineHeight: 1.1,
                  letterSpacing: '0.02em',
                }}
              >
                {totalDisplay}
              </div>
              {showPnLBadge ? (
                <div
                  style={{
                    display: 'inline-flex',
                    marginTop: '12px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'var(--em-bg)',
                    color: 'var(--emerald)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {Number(todayPnL) >= 0 ? '+' : ''}$
                  {Math.abs(Number(todayPnL)).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  today {Number(todayPnLPct) >= 0 ? '+' : ''}
                  {Number(todayPnLPct).toFixed(2)}%
                </div>
              ) : null}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '22px',
                }}
              >
                <ActionBtn
                  bg="var(--emerald)"
                  color="var(--navy)"
                  icon="ti-cash-banknote"
                  label="Deposit"
                  onClick={() => navigate('/wallet', { state: { action: 'deposit' } })}
                />
                <ActionBtn
                  bg="var(--gold)"
                  color="var(--navy)"
                  icon="ti-building-bank"
                  label="Withdraw"
                  onClick={() => navigate('/wallet', { state: { action: 'withdraw' } })}
                />
                <ActionBtn
                  bg="var(--blue)"
                  color="var(--navy)"
                  icon="ti-chart-candle"
                  label="Trade"
                  onClick={() => navigate('/trade')}
                />
              </div>
            </div>

            <div style={{ ...card, padding: '1.25rem' }}>
              <div style={labelUpper}>Asset Distribution</div>
              {distributionData.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '220px',
                    gap: '14px',
                  }}
                >
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      fill="none"
                      stroke="var(--navy-b2)"
                      strokeWidth="16"
                    />
                  </svg>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text2)',
                        fontWeight: 500,
                      }}
                    >
                      No assets yet
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text3)',
                        marginTop: '4px',
                      }}
                    >
                      Deposit or trade to build your portfolio
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '220px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <Pie
                          data={distributionData}
                          dataKey="usd"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={88}
                          paddingAngle={2}
                          stroke="var(--navy-card)"
                          strokeWidth={1}
                        >
                          {distributionData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={<DistributionTooltip />}
                          cursor={{ fill: 'transparent' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div
                    style={{
                      width: '150px',
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      paddingLeft: '8px',
                    }}
                  >
                    {distributionData.map((d) => (
                      <div
                        key={d.name}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                        }}
                      >
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            background: d.fill,
                            marginTop: '4px',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--text1)',
                              fontWeight: 500,
                            }}
                          >
                            {d.name}{' '}
                            <span style={{ color: 'var(--text3)', fontWeight: 400 }}>
                              {d.pct.toFixed(1)}%
                            </span>
                          </div>
                          <div
                            style={{
                              fontFamily: 'DM Mono, monospace',
                              fontSize: '0.72rem',
                              color: 'var(--text2)',
                            }}
                          >
                            {fmtUsd(d.usd)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginTop: '12px',
            }}
          >
            {statRows.map((stat) => (
              <div key={stat.label} style={{ ...card, padding: '16px 14px' }}>
                <div
                  style={{
                    ...labelUpper,
                    marginBottom: '8px',
                    fontSize: '9px',
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: stat.serif
                      ? "'Cormorant Garamond', serif"
                      : 'inherit',
                    fontSize: stat.serif ? '1.85rem' : '1.25rem',
                    fontWeight: stat.serif ? 700 : 600,
                    color: stat.valueColor,
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '12px',
              marginTop: '12px',
            }}
          >
            <div style={{ ...card, padding: '1.25rem' }}>
              <div style={labelUpper}>Holdings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {walletData?.wallets?.length ? (
                  walletData.wallets.map((wallet) => (
                    <div
                      key={wallet.asset}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (wallet.asset === 'USDT') {
                          navigate('/trade')
                          return
                        }
                        navigate(`/trade?pair=${wallet.asset}USDT`)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          if (wallet.asset === 'USDT') {
                            navigate('/trade')
                          } else {
                            navigate(`/trade?pair=${wallet.asset}USDT`)
                          }
                        }
                      }}
                      onMouseEnter={() => setHoverHolding(wallet.asset)}
                      onMouseLeave={() => setHoverHolding(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '11px 10px',
                        margin: '0 -6px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background:
                          hoverHolding === wallet.asset
                            ? 'rgba(201,166,70,0.08)'
                            : 'transparent',
                        borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <div
                          style={{
                            width: '33px',
                            height: '33px',
                            borderRadius: '50%',
                            background: 'rgba(201,166,70,0.1)',
                            color: 'var(--gold)',
                            border: '0.5px solid var(--gold-dim)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                          }}
                        >
                          {wallet.asset === 'BTC'
                            ? '₿'
                            : wallet.asset === 'ETH'
                              ? 'Ξ'
                              : wallet.asset === 'GOLD'
                                ? 'Au'
                                : '$'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: '500' }}>
                            {wallet.asset === 'BTC'
                              ? 'Bitcoin'
                              : wallet.asset === 'ETH'
                                ? 'Ethereum'
                                : wallet.asset === 'GOLD'
                                  ? 'Digital Gold'
                                  : 'Tether USD'}
                          </div>
                          <div
                            style={{ fontSize: '0.67rem', color: 'var(--text3)' }}
                          >
                            {Number(wallet.balance).toFixed(4)} {wallet.asset}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: '0.78rem',
                          }}
                        >
                          $
                          {wallet.usdValue != null
                            ? Number(wallet.usdValue).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : '0.00'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: '16px 0',
                      color: 'var(--text3)',
                      fontSize: '13px',
                    }}
                  >
                    No holdings yet
                  </div>
                )}
              </div>
            </div>

            <div style={{ ...card, padding: '1.25rem' }}>
              <div style={labelUpper}>Recent Transactions</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {orders.slice(0, 4).length ? (
                  orders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate('/history')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate('/history')
                        }
                      }}
                      onMouseEnter={() => setHoverTx(order.id)}
                      onMouseLeave={() => setHoverTx(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 10px',
                        margin: '0 -6px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background:
                          hoverTx === order.id
                            ? 'rgba(201,166,70,0.08)'
                            : 'transparent',
                        borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '31px',
                            height: '31px',
                            borderRadius: '7px',
                            background:
                              order.side === 'buy'
                                ? 'rgba(29,158,117,0.12)'
                                : 'rgba(226,75,74,0.12)',
                            color:
                              order.side === 'buy'
                                ? 'var(--emerald)'
                                : 'var(--red)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                          }}
                        >
                          {order.side === 'buy' ? '↓' : '↑'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                            {order.side === 'buy' ? 'Bought' : 'Sold'}{' '}
                            {order.pair?.split('/')[0]}
                          </div>
                          <div
                            style={{ fontSize: '0.64rem', color: 'var(--text3)' }}
                          >
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  },
                                )
                              : '—'}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: '0.74rem',
                            color:
                              order.side === 'buy'
                                ? 'var(--emerald)'
                                : 'var(--red)',
                          }}
                        >
                          {order.side === 'buy' ? '+' : '-'}
                          {Number(order.amount).toFixed(4)}{' '}
                          {order.pair?.split('/')[0]}
                        </div>
                        <div
                          style={{ fontSize: '0.64rem', color: 'var(--text3)' }}
                        >
                          Fee: ${Number(order.fee || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: '16px 0',
                      color: 'var(--text3)',
                      fontSize: '13px',
                    }}
                  >
                    No recent orders
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
