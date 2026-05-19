import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Sidebar from '../components/layout/Sidebar.jsx'
import { pricesAPI, ordersAPI, walletAPI } from '../services/api'

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

const MAJOR_PAIRS = ['BTC/USDT', 'ETH/USDT', 'GOLD/USDT', 'SOL/USDT']

const cardInner = {
  background: 'var(--navy-card)',
  border: '0.5px solid var(--navy-b2)',
  borderRadius: '8px',
}

function buildChartData(mid) {
  return Array.from({ length: 20 }, (_, i) => {
    const wave =
      Math.sin(i * 0.35) * mid * 0.004 + Math.cos(i * 0.22) * mid * 0.002
    return {
      i: `${i + 1}`,
      p: Number(
        (mid + wave + (i - 10) * mid * 0.00015).toFixed(mid >= 100 ? 2 : 4),
      ),
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

function normalizeOrdersPayload(data) {
  if (data == null) return []
  if (Array.isArray(data.orders)) return data.orders
  if (Array.isArray(data)) return data
  return []
}

export default function Trading() {
  const location = useLocation()
  const navigate = useNavigate()

  const [prices, setPrices] = useState({})
  const [connected, setConnected] = useState(false)

  const [pair, setPair] = useState('GOLD/USDT')
  const [timeframe, setTimeframe] = useState('1H')
  const [bottomTab, setBottomTab] = useState('open')
  const [side, setSide] = useState('buy')
  const [orderType, setOrderType] = useState('market')
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')

  const [walletBalance, setWalletBalance] = useState({ USDT: 0 })
  const [baseBalance, setBaseBalance] = useState(0)
  const [orderError, setOrderError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState('')
  const [orderLoading, setOrderLoading] = useState(false)
  const [openOrders, setOpenOrders] = useState([])
  const [orderHistory, setOrderHistory] = useState([])

  useEffect(() => {
    const p = location.state?.pair
    if (typeof p === 'string' && p.includes('/')) {
      setPair(p)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state?.pair, navigate])

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await pricesAPI.getAll()
        setPrices(res.data.data)
        setConnected(true)
      } catch (err) {
        console.error('Price fetch error:', err)
        setConnected(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, openRes, historyRes] = await Promise.all([
          walletAPI.getBalances(),
          ordersAPI.getOpen(),
          ordersAPI.getHistory(),
        ])

        const wd = walletRes.data.data ?? {}
        const wallets = wd.wallets ?? []
        const balances = { USDT: 0 }
        wallets.forEach((w) => {
          balances[w.asset] = Number(w.balance)
        })
        setWalletBalance(balances)

        const [b0] = pair.split('/')
        setBaseBalance(Number(balances[b0]) || 0)

        setOpenOrders(normalizeOrdersPayload(openRes.data.data))
        setOrderHistory(normalizeOrdersPayload(historyRes.data.data))
      } catch (err) {
        console.error('Fetch error:', err)
      }
    }
    fetchData()
  }, [pair])

  const pairList = [
    'BTC/USDT',
    'ETH/USDT',
    'GOLD/USDT',
    'OIL/USDT',
    'SOL/USDT',
    'BNB/USDT',
    'XAG/USDT',
    'DOGE/USDT',
  ].map((sym) => ({
    sym,
    price: prices[sym]?.price
      ? `$${Number(prices[sym].price).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : '...',
    chg:
      prices[sym]?.change24h !== undefined
        ? `${Number(prices[sym].change24h) >= 0 ? '+' : ''}${Number(prices[sym].change24h).toFixed(2)}%`
        : '...',
    up: (prices[sym]?.change24h || 0) >= 0,
  }))

  const selPriceNum = Number(prices[pair]?.price)
  const mid =
    Number.isFinite(selPriceNum) && selPriceNum > 0
      ? selPriceNum
      : MID_PRICE[pair] ?? 1

  const selVol = Number(prices[pair]?.volume24h)
  const selHigh = Number(prices[pair]?.high24h ?? prices[pair]?.high24)
  const selLow = Number(prices[pair]?.low24h ?? prices[pair]?.low24)

  const chartData = useMemo(() => buildChartData(mid), [mid, pair])
  const book = useMemo(() => buildBook(mid), [mid, pair])

  const isGold = pair.startsWith('GOLD')
  const unit = isGold ? 'g' : pair.split('/')[0]

  const effectivePrice =
    orderType === 'market' ? mid : parseFloat(price) || mid
  const amtNum = parseFloat(amount) || 0
  const total = amtNum * effectivePrice
  const fee = total * 0.001

  const baseAsset = pair.split('/')[0]
  const quoteAsset = pair.split('/')[1] || 'USDT'
  const availableBalance =
    side === 'buy'
      ? walletBalance[quoteAsset] || 0
      : walletBalance[baseAsset] || 0

  const handlePctClick = (pct) => {
    const max = availableBalance
    const currentPrice = Number(prices[pair]?.price) || 0
    if (max <= 0) return
    if (side === 'buy') {
      if (!currentPrice) return
      setAmount(((max * pct) / currentPrice).toFixed(6))
    } else {
      setAmount((max * pct).toFixed(6))
    }
  }

  const handlePlaceOrder = async () => {
    setOrderError('')
    setOrderSuccess('')

    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) {
      setOrderError('Please enter a valid amount')
      return
    }

    if (orderType !== 'market' && (!price || parseFloat(price) <= 0)) {
      setOrderError('Please enter a valid price')
      return
    }

    const currentPrice = Number(prices[pair]?.price) || 0

    const cost =
      side === 'buy'
        ? amountNum * (parseFloat(price) || currentPrice || 0)
        : amountNum

    if (side === 'buy' && orderType === 'market' && !currentPrice) {
      setOrderError('No market price available for this pair')
      return
    }

    if (cost > availableBalance) {
      setOrderError(
        `Insufficient ${side === 'buy' ? quoteAsset : baseAsset} balance`,
      )
      return
    }

    setOrderLoading(true)

    try {
      const orderData = {
        pair,
        side,
        type: orderType,
        amount: amountNum,
      }

      if (orderType !== 'market') {
        orderData.price = parseFloat(price)
      }

      const res = await ordersAPI.create(orderData)
      const created = res?.data?.data?.order ?? res?.data?.data
      const st = created?.status

      setOrderSuccess(
        `Order ${st === 'filled' ? 'executed' : 'placed'} successfully!`,
      )
      setAmount('')
      setPrice('')

      const [walletRes, openRes, historyRes] = await Promise.all([
        walletAPI.getBalances(),
        ordersAPI.getOpen(),
        ordersAPI.getHistory(),
      ])

      const wd = walletRes.data.data ?? {}
      const wallets = wd.wallets ?? []
      const balances = { USDT: 0 }
      wallets.forEach((w) => {
        balances[w.asset] = Number(w.balance)
      })
      setWalletBalance(balances)
      const [b0] = pair.split('/')
      setBaseBalance(Number(balances[b0]) || 0)
      setOpenOrders(normalizeOrdersPayload(openRes.data.data))
      setOrderHistory(normalizeOrdersPayload(historyRes.data.data))

      setTimeout(() => setOrderSuccess(''), 3000)
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Order placement failed')
    } finally {
      setOrderLoading(false)
    }
  }

  const fmtPrice = (p) =>
    p >= 1000
      ? p.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : p.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })

  const displayHigh =
    Number.isFinite(selHigh) && selHigh > 0 ? selHigh : mid * 1.012
  const displayLow =
    Number.isFinite(selLow) && selLow > 0 ? selLow : mid * 0.988
  const displayVol =
    Number.isFinite(selVol) && selVol > 0 ? selVol : mid * 1842

  const change24hLabel =
    prices[pair]?.change24h != null &&
    Number.isFinite(Number(prices[pair].change24h))
      ? `${Number(prices[pair].change24h) > 0 ? '+' : ''}${Number(prices[pair].change24h).toFixed(2)}%`
      : '...'

  const change24hColor =
    (Number(prices[pair]?.change24h) || 0) >= 0
      ? 'var(--emerald)'
      : 'var(--red)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div
        style={{
          overflow: 'hidden',
          borderBottom: '0.5px solid var(--navy-b)',
          background: 'var(--navy-mid)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 'max-content',
          }}
          className="trading-ticker-dupe"
        >
          {[0, 1].map((dup) => (
            <div key={dup} style={{ display: 'flex' }}>
              {pairList.map((item) => (
                <div
                  key={`${dup}-${item.sym}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '11px',
                    borderRight: '0.5px solid var(--navy-b2)',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: item.up ? 'var(--emerald)' : 'var(--red)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 700, color: 'var(--text1)' }}>
                    {item.sym}
                  </span>
                  <span
                    style={{
                      color: 'var(--text1)',
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {item.price}
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: item.up ? 'var(--emerald)' : 'var(--red)',
                    }}
                  >
                    {item.chg}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
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
            {pairList.map((item) => {
              const active = item.sym === pair
              return (
                <button
                  key={item.sym}
                  type="button"
                  onClick={() => setPair(item.sym)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    borderLeft: active
                      ? '2px solid var(--gold)'
                      : '2px solid transparent',
                    background: active ? 'var(--gold-glow)' : 'transparent',
                    color: active ? 'var(--gold)' : 'var(--text2)',
                    fontSize: '12px',
                    fontWeight: active ? 600 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <div>{item.sym}</div>
                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '11px',
                      fontFamily: "'DM Mono', monospace",
                      color: active ? 'var(--gold-light)' : 'var(--text3)',
                    }}
                  >
                    {prices[item.sym]?.price
                      ? `$${Number(prices[item.sym].price).toLocaleString()}`
                      : '...'}
                    <span
                      style={{
                        marginLeft: '6px',
                        fontWeight: 600,
                        color:
                          (Number(prices[item.sym]?.change24h) || 0) >= 0
                            ? 'var(--emerald)'
                            : 'var(--red)',
                      }}
                    >
                      {prices[item.sym]?.change24h !== undefined
                        ? `${Number(prices[item.sym].change24h) >= 0 ? '+' : ''}${Number(prices[item.sym].change24h).toFixed(2)}%`
                        : ''}
                    </span>
                  </div>
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                      minHeight: '18px',
                    }}
                  >
                    {connected ? (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: '0.65rem',
                          color: 'var(--emerald)',
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--emerald)',
                            animation: 'pulsedot 1.5s ease infinite',
                            display: 'inline-block',
                          }}
                        />
                        LIVE
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>
                        Connecting...
                      </span>
                    )}
                  </div>
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
                    $
                    {fmtPrice(
                      Number.isFinite(selPriceNum) && selPriceNum > 0
                        ? selPriceNum
                        : mid,
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: '10px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px 20px',
                      fontSize: '11px',
                      color: 'var(--text2)',
                    }}
                  >
                    {MAJOR_PAIRS.map((mp) => {
                      const n = Number(prices[mp]?.price)
                      const p =
                        Number.isFinite(n) && n > 0 ? n : MID_PRICE[mp]
                      return (
                        <span key={mp}>
                          <span style={{ color: 'var(--text3)' }}>
                            {mp.split('/')[0]}
                          </span>{' '}
                          <span
                            style={{
                              fontWeight: 600,
                              color: 'var(--text1)',
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            ${fmtPrice(p)}
                          </span>
                        </span>
                      )
                    })}
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
                      24h change{' '}
                      <span
                        style={{
                          color: change24hColor,
                          fontWeight: 600,
                        }}
                      >
                        {change24hLabel}
                      </span>
                    </span>
                    <span>
                      24h high{' '}
                      <span style={{ color: 'var(--text1)' }}>
                        ${fmtPrice(displayHigh)}
                      </span>
                    </span>
                    <span>
                      24h low{' '}
                      <span style={{ color: 'var(--text1)' }}>
                        ${fmtPrice(displayLow)}
                      </span>
                    </span>
                    <span>
                      24h vol{' '}
                      <span style={{ color: 'var(--text1)' }}>
                        $
                        {displayVol.toLocaleString('en-US', {
                          maximumFractionDigits: 0,
                        })}
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
                          timeframe === tf
                            ? 'var(--gold-glow)'
                            : 'var(--navy-card2)',
                        color:
                          timeframe === tf ? 'var(--gold)' : 'var(--text2)',
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
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={`goldFill-${pair.replace('/', '')}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--gold)"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--gold)"
                        stopOpacity={0}
                      />
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
                      color:
                        bottomTab === t.id ? 'var(--gold)' : 'var(--text2)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      borderBottom:
                        bottomTab === t.id
                          ? '2px solid var(--gold)'
                          : '2px solid transparent',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: '0 12px 12px', overflowX: 'auto' }}>
                {bottomTab === 'open' &&
                  (openOrders.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '30px',
                        color: 'var(--text3)',
                        fontSize: '0.8rem',
                      }}
                    >
                      No open orders
                    </div>
                  ) : (
                    openOrders.map((order) => {
                      const filledAmt =
                        Number(order.filledAmount ?? order.filled ?? 0) || 0
                      const amt = Number(order.amount) || 0
                      const pct = amt ? Math.round((filledAmt / amt) * 100) : 0
                      const priceNum = Number(order.price)
                      const priceLbl =
                        order.type === 'market' ||
                        !Number.isFinite(priceNum) ||
                        priceNum <= 0
                          ? 'Market'
                          : `$${priceNum.toLocaleString('en-US')}`
                      return (
                        <div
                          key={order.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              '80px 100px 60px 110px 110px 70px 70px',
                            padding: '10px 0',
                            alignItems: 'center',
                            fontSize: '0.74rem',
                            borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                            minWidth: '640px',
                          }}
                        >
                          <span style={{ color: 'var(--text3)' }}>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleTimeString(
                                  'en-US',
                                  { hour: '2-digit', minute: '2-digit' },
                                )
                              : '—'}
                          </span>
                          <span>{order.pair}</span>
                          <span
                            style={{
                              color:
                                order.side === 'buy'
                                  ? 'var(--emerald)'
                                  : 'var(--red)',
                              textTransform: 'capitalize',
                            }}
                          >
                            {order.side}
                          </span>
                          <span
                            style={{
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {priceLbl}
                          </span>
                          <span
                            style={{
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {Number(order.amount).toFixed(4)}
                          </span>
                          <span>{pct}%</span>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await ordersAPI.cancel(order.id)
                                const res = await ordersAPI.getOpen()
                                setOpenOrders(
                                  normalizeOrdersPayload(res.data.data),
                                )
                              } catch (cancelErr) {
                                console.error('Cancel error:', cancelErr)
                              }
                            }}
                            style={{
                              padding: '3px 8px',
                              background: 'rgba(226,75,74,0.12)',
                              border: '0.5px solid rgba(226,75,74,0.3)',
                              color: 'var(--red)',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )
                    })
                  ))}
                {bottomTab === 'orders' &&
                  (orderHistory.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '30px',
                        color: 'var(--text3)',
                        fontSize: '0.8rem',
                      }}
                    >
                      No order history
                    </div>
                  ) : (
                    orderHistory.map((order) => (
                      <div
                        key={order.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            '75px 1fr 50px 60px 100px 1fr 72px minmax(80px,1fr)',
                          padding: '10px 0',
                          alignItems: 'center',
                          fontSize: '0.74rem',
                          borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                          gap: '6px',
                          minWidth: '720px',
                        }}
                      >
                        <span style={{ color: 'var(--text3)' }}>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleTimeString(
                                'en-US',
                                { hour: '2-digit', minute: '2-digit' },
                              )
                            : '—'}
                        </span>
                        <span>{order.pair}</span>
                        <span
                          style={{
                            color:
                              order.side === 'buy'
                                ? 'var(--emerald)'
                                : 'var(--red)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {order.side}
                        </span>
                        <span style={{ color: 'var(--text3)' }}>
                          {(order.type || '—').toString()}
                        </span>
                        <span style={{ fontFamily: "'DM Mono', monospace" }}>
                          {(() => {
                            const p = Number(order.price)
                            return Number.isFinite(p) && p > 0
                              ? `$${p.toLocaleString('en-US')}`
                              : '—'
                          })()}
                        </span>
                        <span style={{ fontFamily: "'DM Mono', monospace" }}>
                          {Number(order.amount).toFixed(4)}
                        </span>
                        <span style={{ textTransform: 'capitalize' }}>
                          {order.status || '—'}
                        </span>
                        <span style={{ color: 'var(--text3)', fontSize: '0.68rem' }}>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                'en-US',
                                { month: 'short', day: 'numeric' },
                              )
                            : '—'}
                        </span>
                      </div>
                    ))
                  ))}
                {bottomTab === 'trades' &&
                  (() => {
                    const trades = orderHistory.filter((o) => {
                      const s = String(o.status || '').toLowerCase()
                      return (
                        s === 'filled' ||
                        s === 'partially_filled' ||
                        s === 'partially filled'
                      )
                    })
                    return trades.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '30px',
                          color: 'var(--text3)',
                          fontSize: '0.8rem',
                        }}
                      >
                        No trade history
                      </div>
                    ) : (
                      trades.map((order) => (
                        <div
                          key={order.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              '75px 1fr 50px 60px 100px 1fr 72px minmax(80px,1fr)',
                            padding: '10px 0',
                            alignItems: 'center',
                            fontSize: '0.74rem',
                            borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                            gap: '6px',
                            minWidth: '720px',
                          }}
                        >
                          <span style={{ color: 'var(--text3)' }}>
                            {order.updatedAt || order.createdAt
                              ? new Date(
                                  order.updatedAt ?? order.createdAt,
                                ).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </span>
                          <span>{order.pair}</span>
                          <span
                            style={{
                              color:
                                order.side === 'buy'
                                  ? 'var(--emerald)'
                                  : 'var(--red)',
                              textTransform: 'capitalize',
                            }}
                          >
                            {order.side}
                          </span>
                          <span style={{ color: 'var(--text3)' }}>
                            {(order.type || '—').toString()}
                          </span>
                          <span style={{ fontFamily: "'DM Mono', monospace" }}>
                            {(() => {
                              const p = Number(order.price)
                              return Number.isFinite(p) && p > 0
                                ? `$${p.toLocaleString('en-US')}`
                                : '—'
                            })()}
                          </span>
                          <span style={{ fontFamily: "'DM Mono', monospace" }}>
                            {Number(
                              order.filledAmount ?? order.amount ?? 0,
                            ).toFixed(4)}
                          </span>
                          <span style={{ textTransform: 'capitalize' }}>
                            {order.status || '—'}
                          </span>
                          <span
                            style={{
                              color: 'var(--text3)',
                              fontSize: '0.68rem',
                            }}
                          >
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                  },
                                )
                              : '—'}
                          </span>
                        </div>
                      ))
                    )
                  })()}
              </div>
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0 4px 4px',
                }}
              >
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
                  <span style={{ color: 'var(--emerald)' }}>
                    {fmtPrice(b.price)}
                  </span>
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
                      color: side === s ? 'var(--navy)' : 'var(--text2)',
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
                        color:
                          orderType === id ? 'var(--gold)' : 'var(--text3)',
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
              <div style={{ padding: '4px 0 8px' }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text3)',
                    textAlign: 'center',
                    marginBottom: '8px',
                  }}
                >
                  Available{' '}
                  {availableBalance.toLocaleString('en-US', {
                    minimumFractionDigits: side === 'buy' ? 2 : 4,
                    maximumFractionDigits: side === 'buy' ? 2 : 4,
                  })}{' '}
                  {side === 'buy' ? quoteAsset : baseAsset}
                </div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--text3)',
                    marginBottom: '4px',
                  }}
                >
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
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--text3)',
                    marginBottom: '4px',
                  }}
                >
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
                <button
                  type="button"
                  onClick={() => handlePctClick(0.25)}
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
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handlePctClick(0.5)}
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
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handlePctClick(0.75)}
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
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => handlePctClick(0.99)}
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
                  Max
                </button>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--text3)',
                    marginBottom: '4px',
                  }}
                >
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
                  $
                  {total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '12px' }}>
                Fee (0.1%){' '}
                <span style={{ color: 'var(--text1)' }}>
                  $
                  {fee.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </span>
              </div>
              {orderError ? (
                <div
                  style={{
                    background: 'rgba(226,75,74,0.12)',
                    border: '0.5px solid rgba(226,75,74,0.3)',
                    color: 'var(--red)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    marginTop: '8px',
                    textAlign: 'center',
                  }}
                >
                  {orderError}
                </div>
              ) : null}
              {orderSuccess ? (
                <div
                  style={{
                    background: 'rgba(29,158,117,0.12)',
                    border: '0.5px solid rgba(29,158,117,0.3)',
                    color: 'var(--emerald)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    marginTop: '8px',
                    textAlign: 'center',
                  }}
                >
                  {orderSuccess}
                </div>
              ) : null}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={orderLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: side === 'buy' ? 'var(--emerald)' : 'var(--red)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: orderLoading ? 'not-allowed' : 'pointer',
                  opacity: orderLoading ? 0.6 : 1,
                  marginTop: '12px',
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                {orderLoading
                  ? 'Placing order...'
                  : `${side === 'buy' ? 'Buy' : 'Sell'} ${baseAsset}`}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @keyframes trading-ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .trading-ticker-dupe {
          animation: trading-ticker-scroll 55s linear infinite;
        }
        .trading-ticker-dupe:hover {
          animation-play-state: paused;
        }
        @keyframes pulsedot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}
