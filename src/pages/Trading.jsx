import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Sidebar from '../components/layout/Sidebar.jsx'

const PAIRS = [
  'GOLD/USDT',
  'BTC/USDT',
  'ETH/USDT',
  'OIL/USDT',
  'SOL/USDT',
  'BNB/USDT',
  'XAG/USDT',
  'DOGE/USDT',
]

const MID_PRICE = {
  'GOLD/USDT': 2341.8,
  'BTC/USDT': 87234.5,
  'ETH/USDT': 3812.2,
  'OIL/USDT': 78.35,
  'SOL/USDT': 162.4,
  'BNB/USDT': 612.8,
  'XAG/USDT': 29.95,
  'DOGE/USDT': 0.1625,
}

const cardInner = {
  background: 'var(--navy-card)',
  border: '0.5px solid var(--navy-b2)',
  borderRadius: '8px',
}

function buildChartData(mid) {
  return Array.from({ length: 20 }, (_, i) => {
    const wave = Math.sin(i * 0.35) * mid * 0.004 + Math.cos(i * 0.22) * mid * 0.002
    return {
      i: `${i + 1}`,
      p: Number((mid + wave + (i - 10) * mid * 0.00015).toFixed(mid >= 100 ? 2 : 4)),
    }
  })
}

function buildBook(mid) {
  const step = mid * 0.00018 + 0.01
  const asks = []
  const bids = []
  for (let i = 8; i >= 1; i -= 1) {
    asks.push({
      price: mid + step * i,
      vol: (0.35 + i * 0.22 + (mid % 7) * 0.01).toFixed(3),
    })
  }
  for (let i = 1; i <= 8; i += 1) {
    bids.push({
      price: mid - step * i,
      vol: (0.4 + i * 0.19 + (mid % 5) * 0.01).toFixed(3),
    })
  }
  return { asks, bids }
}

export default function Trading() {
  const [pair, setPair] = useState('GOLD/USDT')
  const [timeframe, setTimeframe] = useState('1H')
  const [bottomTab, setBottomTab] = useState('open')
  const [side, setSide] = useState('buy')
  const [orderType, setOrderType] = useState('market')
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')

  const mid = MID_PRICE[pair] ?? 1
  const chartData = useMemo(() => buildChartData(mid), [mid, pair])
  const book = useMemo(() => buildBook(mid), [mid, pair])

  const isGold = pair.startsWith('GOLD')
  const unit = isGold ? 'g' : pair.split('/')[0]

  const effectivePrice =
    orderType === 'market' ? mid : parseFloat(price) || mid
  const amtNum = parseFloat(amount) || 0
  const total = amtNum * effectivePrice
  const fee = total * 0.001

  const available = 12400

  const applyPct = (p) => {
    const maxBase = available / effectivePrice
    setAmount((maxBase * p).toFixed(isGold ? 4 : 6))
  }

  const fmtPrice = (p) =>
    p >= 1000
      ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activePage="trading" />
      <div
        style={{
          flex: 1,
          display: 'flex',
          minWidth: 0,
          background: 'var(--navy)',
        }}
      >
        <aside
          style={{
            width: '166px',
            flexShrink: 0,
            background: 'var(--navy-mid)',
            borderRight: '0.5px solid var(--navy-b)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--text3)',
              textTransform: 'uppercase',
              borderBottom: '0.5px solid var(--navy-b2)',
            }}
          >
            Markets
          </div>
          {PAIRS.map((p) => {
            const active = p === pair
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPair(p)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
                  background: active ? 'var(--gold-glow)' : 'transparent',
                  color: active ? 'var(--gold)' : 'var(--text2)',
                  fontSize: '12px',
                  fontWeight: active ? 600 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {p}
              </button>
            )
          })}
        </aside>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            borderRight: '0.5px solid var(--navy-b)',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '0.5px solid var(--navy-b2)',
              background: 'var(--navy-mid)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--text1)',
                  }}
                >
                  {pair}
                </div>
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--emerald)',
                  }}
                >
                  ${fmtPrice(mid)}
                </div>
                <div
                  style={{
                    marginTop: '8px',
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    fontSize: '12px',
                    color: 'var(--text3)',
                  }}
                >
                  <span>
                    24h high{' '}
                    <span style={{ color: 'var(--text1)' }}>${fmtPrice(mid * 1.012)}</span>
                  </span>
                  <span>
                    24h low{' '}
                    <span style={{ color: 'var(--text1)' }}>${fmtPrice(mid * 0.988)}</span>
                  </span>
                  <span>
                    24h vol{' '}
                    <span style={{ color: 'var(--text1)' }}>
                      ${(mid * 1842).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['1m', '5m', '15m', '1H', '4H', '1D'].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '0.5px solid var(--navy-b)',
                      background:
                        timeframe === tf ? 'var(--gold-glow)' : 'var(--navy-card2)',
                      color: timeframe === tf ? 'var(--gold)' : 'var(--text2)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: '300px',
              height: '360px',
              padding: '8px 12px',
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`goldFill-${pair.replace('/', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{
                    background: 'var(--navy-card)',
                    border: '0.5px solid var(--navy-b)',
                    borderRadius: 8,
                    color: 'var(--text1)',
                  }}
                  labelStyle={{ color: 'var(--text3)' }}
                  formatter={(v) => [`$${fmtPrice(Number(v))}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="p"
                  stroke="var(--emerald)"
                  strokeWidth={2}
                  fill={`url(#goldFill-${pair.replace('/', '')})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...cardInner, margin: '0 12px 12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '0.5px solid var(--navy-b2)' }}>
              {[
                { id: 'open', label: 'Open Orders' },
                { id: 'orders', label: 'Order History' },
                { id: 'trades', label: 'Trade History' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setBottomTab(t.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    background:
                      bottomTab === t.id ? 'var(--navy-card2)' : 'transparent',
                    color: bottomTab === t.id ? 'var(--gold)' : 'var(--text2)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    borderBottom:
                      bottomTab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
              }}
            >
              <thead>
                <tr style={{ color: 'var(--text3)', textAlign: 'left' }}>
                  {['Time', 'Pair', 'Side', 'Price', 'Amount', 'Filled'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '8px 12px',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['12:04', pair, 'Buy', fmtPrice(mid * 0.999), `12.4 ${unit}`, '40%'],
                  ['11:58', pair, 'Sell', fmtPrice(mid * 1.001), `4.02 ${unit}`, '100%'],
                  ['11:41', pair, 'Buy', fmtPrice(mid * 0.998), `1.20 ${unit}`, '100%'],
                ].map((row, ri) => (
                  <tr key={ri} style={{ borderTop: '0.5px solid var(--navy-b2)' }}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          padding: '10px 12px',
                          color:
                            ci === 2
                              ? cell === 'Buy'
                                ? 'var(--emerald)'
                                : 'var(--red)'
                              : 'var(--text1)',
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside
          style={{
            width: '215px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--navy-mid)',
            maxHeight: '100vh',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '10px 10px 6px',
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--text3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Order book
          </div>
          <div style={{ padding: '0 8px', fontSize: '10px', color: 'var(--text3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px 4px' }}>
              <span>Price</span>
              <span>Size</span>
            </div>
            {book.asks.map((a) => (
              <div
                key={`ask-${a.price}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '3px 4px',
                  fontSize: '11px',
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                <span style={{ color: 'var(--red)' }}>{fmtPrice(a.price)}</span>
                <span style={{ color: 'var(--text2)' }}>{a.vol}</span>
              </div>
            ))}
            <div
              style={{
                margin: '6px 0',
                padding: '8px',
                textAlign: 'center',
                borderRadius: '6px',
                background: 'var(--navy-card2)',
                border: '0.5px solid var(--navy-b)',
                color: 'var(--text1)',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              ${fmtPrice(mid)}
            </div>
            {book.bids.map((b) => (
              <div
                key={`bid-${b.price}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '3px 4px',
                  fontSize: '11px',
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                <span style={{ color: 'var(--emerald)' }}>{fmtPrice(b.price)}</span>
                <span style={{ color: 'var(--text2)' }}>{b.vol}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px 10px', borderTop: '0.5px solid var(--navy-b2)' }}>
            <div style={{ display: 'flex', marginBottom: '10px' }}>
              {['buy', 'sell'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    borderRadius: s === 'buy' ? '6px 0 0 6px' : '0 6px 6px 0',
                    background:
                      side === s
                        ? s === 'buy'
                          ? 'var(--emerald)'
                          : 'var(--red)'
                        : 'var(--navy-card2)',
                    color:
                      side === s ? 'var(--navy)' : 'var(--text2)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textTransform: 'capitalize',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
              {['Market', 'Limit', 'Stop'].map((ot) => {
                const id = ot.toLowerCase()
                return (
                  <button
                    key={ot}
                    type="button"
                    onClick={() => setOrderType(id)}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: '4px',
                      border: '0.5px solid var(--navy-b2)',
                      background:
                        orderType === id ? 'var(--gold-glow)' : 'transparent',
                      color: orderType === id ? 'var(--gold)' : 'var(--text3)',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {ot}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '8px' }}>
              Available <span style={{ color: 'var(--text1)' }}>${available.toLocaleString()}</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '4px' }}>
                Price (USDT)
              </div>
              {orderType === 'market' ? (
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: '0.5px solid var(--navy-b2)',
                    background: 'var(--navy-card2)',
                    color: 'var(--text2)',
                    fontSize: '12px',
                  }}
                >
                  Market
                </div>
              ) : (
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={fmtPrice(mid)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '0.5px solid var(--navy-b2)',
                    background: 'var(--navy-card2)',
                    color: 'var(--text1)',
                    fontFamily: 'inherit',
                    fontSize: '12px',
                  }}
                />
              )}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '4px' }}>
                Amount ({unit})
              </div>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '0.5px solid var(--navy-b2)',
                  background: 'var(--navy-card2)',
                  color: 'var(--text1)',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
              {[0.25, 0.5, 0.75, 1].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPct(p)}
                  style={{
                    flex: 1,
                    padding: '6px 2px',
                    borderRadius: '4px',
                    border: '0.5px solid var(--navy-b)',
                    background: 'var(--navy-card)',
                    color: 'var(--gold)',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {p === 1 ? 'Max' : `${p * 100}%`}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '4px' }}>
                Total (USDT)
              </div>
              <div
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: '0.5px solid var(--navy-b2)',
                  background: 'var(--navy-card2)',
                  color: 'var(--text1)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '12px' }}>
              Fee (0.1%){' '}
              <span style={{ color: 'var(--text1)' }}>
                ${fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
            </div>
            <button
              type="button"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: side === 'buy' ? 'var(--emerald)' : 'var(--red)',
                color: 'var(--navy)',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textTransform: 'capitalize',
              }}
            >
              {side} {pair.split('/')[0]}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
