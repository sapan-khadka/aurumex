import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import { walletAPI } from '../services/api'

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
}

function assetLabel(asset) {
  if (asset === 'BTC') return 'Bitcoin'
  if (asset === 'ETH') return 'Ethereum'
  if (asset === 'GOLD') return 'Digital Gold'
  if (asset === 'USDT') return 'Tether USD'
  return asset
}

function assetSelectLabel(asset) {
  if (asset === 'USDT') return 'USDT (TRC-20)'
  return assetLabel(asset)
}

function formatUsd(n) {
  if (n == null || Number.isNaN(Number(n))) return '$0.00'
  return `$${Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function QrPatternGold() {
  const n = 29
  const cell = 3
  const pad = 6
  const squares = []
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const corner =
        (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
      const v = corner
        ? 1
        : (Math.sin(x * 0.7 + y * 0.9) + Math.cos(x * 0.3 - y * 0.5)) > 0
          ? 1
          : 0
      squares.push(
        <rect
          key={`${x}-${y}`}
          x={pad + x * cell}
          y={pad + y * cell}
          width={cell - 0.5}
          height={cell - 0.5}
          rx={0.5}
          fill={v ? 'var(--navy)' : 'var(--gold)'}
        />,
      )
    }
  }
  const dim = pad * 2 + n * cell
  return (
    <svg
      width={dim}
      height={dim}
      style={{ borderRadius: 8, border: '0.5px solid var(--navy-b)' }}
    >
      <rect
        x={0}
        y={0}
        width={dim}
        height={dim}
        fill="var(--navy-card2)"
        rx={8}
      />
      {squares}
    </svg>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '0.5px solid var(--navy-b2)',
        background: 'var(--navy-card2)',
        color: 'var(--text1)',
        fontFamily: 'inherit',
        fontSize: '13px',
        cursor: 'pointer',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export default function Wallet() {
  const navigate = useNavigate()
  const location = useLocation()
  const [walletData, setWalletData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState('USDT')
  const [withdrawForm, setWithdrawForm] = useState({
    asset: 'USDT',
    amount: '',
    destinationAddress: '',
  })
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await walletAPI.getBalances()
        setWalletData(res.data.data)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear()
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchWallet()
  }, [navigate])

  useEffect(() => {
    const action = location.state?.action
    if (loading) return
    if (action !== 'deposit' && action !== 'withdraw') return

    const id = action === 'deposit' ? 'wallet-deposit' : 'wallet-withdraw'
    requestAnimationFrame(() => scrollTo(id))

    window.history.replaceState({}, '')
    navigate(`${location.pathname}${location.search}`, { replace: true, state: {} })
  }, [loading, location.state, navigate, location.pathname, location.search])

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setWithdrawError('')
    setWithdrawSuccess('')
    setWithdrawLoading(true)
    try {
      await walletAPI.withdraw({
        asset: withdrawForm.asset,
        amount: parseFloat(withdrawForm.amount),
        destinationAddress: withdrawForm.destinationAddress,
      })
      setWithdrawSuccess('Withdrawal submitted successfully')
      const updated = await walletAPI.getBalances()
      setWalletData(updated.data.data)
      setWithdrawForm({ asset: 'USDT', amount: '', destinationAddress: '' })
    } catch (err) {
      setWithdrawError(err.response?.data?.message || 'Withdrawal failed')
    } finally {
      setWithdrawLoading(false)
    }
  }

  const networkFee = 1.2
  const amt = parseFloat(withdrawForm.amount) || 0
  const youReceive = Math.max(0, amt - networkFee)

  const setMaxAmount = () => {
    const w = walletData?.wallets?.find((x) => x.asset === withdrawForm.asset)
    if (w?.balance == null) return
    setWithdrawForm((f) => ({
      ...f,
      amount: String(w.balance),
    }))
  }

  const totalDisplay = formatUsd(walletData?.totalUSD)
  const usdtWallet = walletData?.wallets?.find((w) => w.asset === 'USDT')
  const availableUsd = formatUsd(usdtWallet?.usdValue ?? usdtWallet?.balance)

  const walletOptions =
    walletData?.wallets?.length > 0
      ? walletData.wallets.map((w) => ({
          value: w.asset,
          label: assetSelectLabel(w.asset),
        }))
      : [{ value: 'USDT', label: 'USDT (TRC-20)' }]

  const depositAddress =
    walletData?.wallets?.find((w) => w.asset === selectedAsset)?.depositAddress ?? ''

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
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1rem',
        }}
      >
        Loading wallet...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activePage="wallet" />
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
          <span style={{ fontWeight: 500, color: 'var(--text1)' }}>Wallet</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => scrollTo('wallet-deposit')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--gold)',
                color: 'var(--navy)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() => scrollTo('wallet-withdraw')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--gold)',
                background: 'transparent',
                color: 'var(--gold)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Withdraw
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
          <div style={{ ...card, padding: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '20px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={labelUpper}>Total Balance</div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '2.4rem',
                    fontWeight: 700,
                    color: 'var(--text1)',
                    lineHeight: 1.1,
                  }}
                >
                  {totalDisplay}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px 24px',
                    marginTop: '18px',
                    fontSize: '13px',
                    color: 'var(--text2)',
                  }}
                >
                  <span>
                    Available{' '}
                    <strong style={{ color: 'var(--text1)' }}>{availableUsd}</strong>
                  </span>
                  <span style={{ color: 'var(--text3)', opacity: 0.5 }}>|</span>
                  <span>
                    In orders{' '}
                    <strong style={{ color: 'var(--amber)' }}>
                      {walletData?.inOrdersUSD != null
                        ? formatUsd(walletData.inOrdersUSD)
                        : '—'}
                    </strong>
                  </span>
                  <span style={{ color: 'var(--text3)', opacity: 0.5 }}>|</span>
                  <span>
                    Unrealized PnL{' '}
                    <strong
                      style={{
                        color:
                          walletData?.unrealizedPnLUSD != null &&
                          Number(walletData.unrealizedPnLUSD) < 0
                            ? 'var(--red)'
                            : 'var(--emerald)',
                      }}
                    >
                      {walletData?.unrealizedPnLUSD != null
                        ? `${Number(walletData.unrealizedPnLUSD) >= 0 ? '+' : '-'}${formatUsd(
                            Math.abs(Number(walletData.unrealizedPnLUSD)),
                          )}`
                        : '—'}
                    </strong>
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--emerald)',
                  }}
                >
                  {walletData?.todayPnLUSD != null ||
                  walletData?.pnl24h != null ||
                  walletData?.dayChangeUsd != null
                    ? `${Number(
                        walletData.todayPnLUSD ??
                          walletData.pnl24h ??
                          walletData.dayChangeUsd,
                      ) >= 0
                        ? '+'
                        : ''}${formatUsd(
                        Math.abs(
                          Number(
                            walletData.todayPnLUSD ??
                              walletData.pnl24h ??
                              walletData.dayChangeUsd,
                          ),
                        ),
                      )}`
                    : '—'}
                </div>
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text2)',
                  }}
                >
                  {walletData?.todayPnLPct != null ||
                  walletData?.pnl24hPct != null ||
                  walletData?.dayChangePct != null
                    ? `${Number(walletData.todayPnLPct ?? walletData.pnl24hPct ?? walletData.dayChangePct) >= 0 ? '+' : ''}${Number(walletData.todayPnLPct ?? walletData.pnl24hPct ?? walletData.dayChangePct).toFixed(2)}% today`
                    : '—'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...card, padding: '0', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--navy-b2)' }}>
              <div style={labelUpper}>Asset Holdings</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 110px',
                  alignItems: 'center',
                  padding: '12px 16px',
                  gap: '8px',
                  fontWeight: 600,
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderBottom: '0.5px solid var(--navy-b2)',
                  color: 'var(--text3)',
                  whiteSpace: 'nowrap',
                  minWidth: '520px',
                }}
              >
                <span>Asset</span>
                <span style={{ textAlign: 'right' }}>Balance</span>
                <span style={{ textAlign: 'right' }}>USD Value</span>
                <span style={{ textAlign: 'right' }}>Status</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>
              {(walletData?.wallets ?? []).map((wallet) => (
                <div
                  key={wallet.asset}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 110px',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(201,166,70,0.1)',
                        color: 'var(--gold)',
                        border: '0.5px solid var(--gold-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        flexShrink: 0,
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
                      <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                        {wallet.asset === 'BTC'
                          ? 'Bitcoin'
                          : wallet.asset === 'ETH'
                            ? 'Ethereum'
                            : wallet.asset === 'GOLD'
                              ? 'Digital Gold'
                              : 'Tether USD'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>
                        {wallet.asset}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: 'right',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '0.76rem',
                    }}
                  >
                    {Number(wallet.balance).toFixed(4)}
                  </div>
                  <div
                    style={{
                      textAlign: 'right',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '0.76rem',
                    }}
                  >
                    $
                    {wallet.usdValue?.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || '0.00'}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        padding: '2px 7px',
                        borderRadius: '10px',
                        fontWeight: '500',
                        background: 'rgba(29,158,117,0.12)',
                        color: 'var(--emerald)',
                        border: '0.5px solid rgba(29,158,117,0.3)',
                      }}
                    >
                      Active
                    </span>
                  </div>
                  <div
                    style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', flexWrap: 'wrap' }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(wallet.asset)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        cursor: 'pointer',
                        border: '0.5px solid var(--navy-b)',
                        background: 'var(--navy-card2)',
                        color: 'var(--text2)',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setWithdrawForm((f) => ({
                          ...f,
                          asset: wallet.asset,
                        }))
                      }
                      style={{
                        padding: '4px 9px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        cursor: 'pointer',
                        border: '0.5px solid var(--navy-b)',
                        background: 'var(--navy-card2)',
                        color: 'var(--text2)',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      Trade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginTop: '12px',
            }}
          >
            <div id="wallet-deposit" style={{ ...card, padding: '1.25rem' }}>
              <div style={labelUpper}>Deposit</div>
              <div style={{ marginBottom: '12px' }}>
                <div
                  style={{
                    ...labelUpper,
                    marginBottom: '8px',
                    fontSize: '9px',
                  }}
                >
                  Asset
                </div>
                <Select
                  value={selectedAsset}
                  onChange={setSelectedAsset}
                  options={walletOptions}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '18px',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <QrPatternGold />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      ...labelUpper,
                      marginBottom: '8px',
                      fontSize: '9px',
                    }}
                  >
                    Wallet address
                  </div>
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'var(--navy-card2)',
                      border: '0.5px solid var(--navy-b2)',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '13px',
                      color: 'var(--text1)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {depositAddress || '—'}
                  </div>
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'var(--red-bg)',
                      border: '0.5px solid var(--navy-b2)',
                      fontSize: '12px',
                      color: 'var(--red)',
                      fontWeight: 600,
                    }}
                  >
                    Send only USDT TRC-20 to this address
                  </div>
                </div>
              </div>
            </div>

            <div id="wallet-withdraw" style={{ ...card, padding: '1.25rem' }}>
              <form onSubmit={handleWithdraw}>
                <div style={labelUpper}>Withdraw</div>
                {withdrawError ? (
                  <div
                    style={{
                      marginBottom: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'var(--red-bg)',
                      border: '0.5px solid var(--red-b)',
                      fontSize: '12px',
                      color: 'var(--red)',
                      fontWeight: 600,
                    }}
                  >
                    {withdrawError}
                  </div>
                ) : null}
                {withdrawSuccess ? (
                  <div
                    style={{
                      marginBottom: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(29,158,117,0.12)',
                      border: '0.5px solid rgba(29,158,117,0.35)',
                      fontSize: '12px',
                      color: 'var(--emerald)',
                      fontWeight: 600,
                    }}
                  >
                    {withdrawSuccess}
                  </div>
                ) : null}
                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      ...labelUpper,
                      marginBottom: '8px',
                      fontSize: '9px',
                    }}
                  >
                    Asset
                  </div>
                  <Select
                    value={withdrawForm.asset}
                    onChange={(asset) =>
                      setWithdrawForm((f) => ({ ...f, asset }))
                    }
                    options={
                      walletData?.wallets?.length > 0
                        ? walletData.wallets.map((w) => ({
                            value: w.asset,
                            label: assetSelectLabel(w.asset),
                          }))
                        : [
                            { value: 'USDT', label: 'USDT (TRC-20)' },
                            { value: 'BTC', label: 'Bitcoin' },
                            { value: 'ETH', label: 'Ethereum' },
                            { value: 'GOLD', label: 'Digital Gold' },
                          ]
                    }
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      ...labelUpper,
                      marginBottom: '8px',
                      fontSize: '9px',
                    }}
                  >
                    Destination address
                  </div>
                  <input
                    value={withdrawForm.destinationAddress}
                    onChange={(e) =>
                      setWithdrawForm((f) => ({
                        ...f,
                        destinationAddress: e.target.value,
                      }))
                    }
                    placeholder="Enter wallet address"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '0.5px solid var(--navy-b2)',
                      background: 'var(--navy-card2)',
                      color: 'var(--text1)',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      ...labelUpper,
                      marginBottom: '8px',
                      fontSize: '9px',
                    }}
                  >
                    Amount
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={withdrawForm.amount}
                      onChange={(e) =>
                        setWithdrawForm((f) => ({
                          ...f,
                          amount: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '0.5px solid var(--navy-b2)',
                        background: 'var(--navy-card2)',
                        color: 'var(--text1)',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={setMaxAmount}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '0.5px solid var(--gold)',
                        background: 'var(--gold-glow)',
                        color: 'var(--gold)',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        flexShrink: 0,
                      }}
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--navy-card2)',
                    border: '0.5px solid var(--navy-b2)',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: 'var(--text2)',
                    }}
                  >
                    <span>Network fee</span>
                    <span style={{ color: 'var(--text1)' }}>~$1.20</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '10px',
                      fontSize: '12px',
                      color: 'var(--text2)',
                    }}
                  >
                    <span>You receive</span>
                    <span style={{ color: 'var(--text1)', fontWeight: 600 }}>
                      $
                      {youReceive.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: withdrawLoading ? 'var(--text3)' : 'var(--gold)',
                    color: 'var(--navy)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: withdrawLoading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: withdrawLoading ? 0.85 : 1,
                  }}
                >
                  {withdrawLoading ? 'Submitting…' : 'Confirm Withdrawal'}
                </button>
              </form>
              <p
                style={{
                  marginTop: '12px',
                  fontSize: '11px',
                  color: 'var(--text3)',
                  lineHeight: 1.5,
                }}
              >
                2FA required. Withdrawals are processed within 10–30 minutes after network
                confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
