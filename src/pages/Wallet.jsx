import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'

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

const ASSETS = [
  {
    id: 'gold',
    label: 'Digital Gold (Au)',
    balance: '8.24g',
    usd: '$19,716',
    h24: '+1.84%',
    up: true,
  },
  {
    id: 'btc',
    label: 'Bitcoin (₿)',
    balance: '0.1312 BTC',
    usd: '$13,624',
    h24: '+2.14%',
    up: true,
  },
  {
    id: 'eth',
    label: 'Ethereum (Ξ)',
    balance: '2.281 ETH',
    usd: '$8,717',
    h24: '+1.76%',
    up: true,
  },
  {
    id: 'usdt',
    label: 'USDT ($)',
    balance: '6,263.64',
    usd: '$6,264',
    h24: '+0.01%',
    up: true,
  },
  {
    id: 'sol',
    label: 'Solana (◎)',
    balance: '0.000',
    usd: '$0.00',
    h24: '+3.41%',
    up: true,
  },
]

const DEPOSIT_ADDRESS = 'TJK8x4mBrV9cLfQz2nHpW3dYsE6uA1oNv'

const MAX_BY_ASSET = {
  usdt: 6263.64,
  btc: 0.1312,
  eth: 2.281,
  gold: 8.24,
  sol: 0,
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
  const [depositAsset, setDepositAsset] = useState('usdt')
  const [withdrawAsset, setWithdrawAsset] = useState('usdt')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const networkFee = 1.2
  const amt = parseFloat(withdrawAmount) || 0
  const youReceive = Math.max(0, amt - networkFee)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const setMaxAmount = () => {
    const m = MAX_BY_ASSET[withdrawAsset] ?? 0
    setWithdrawAmount(m > 0 ? String(m) : '')
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
                  $48,320.64
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
                    <strong style={{ color: 'var(--text1)' }}>$6,264.22</strong>
                  </span>
                  <span style={{ color: 'var(--text3)', opacity: 0.5 }}>|</span>
                  <span>
                    In orders{' '}
                    <strong style={{ color: 'var(--amber)' }}>$3,180</strong>
                  </span>
                  <span style={{ color: 'var(--text3)', opacity: 0.5 }}>|</span>
                  <span>
                    Unrealized PnL{' '}
                    <strong style={{ color: 'var(--emerald)' }}>+$2,847.40</strong>
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
                  +$1,284.20
                </div>
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text2)',
                  }}
                >
                  +2.73% today
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...card, padding: '0', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--navy-b2)' }}>
              <div style={labelUpper}>Asset Holdings</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                }}
              >
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text3)' }}>
                    {['Asset', 'Balance', 'USD Value', '24h', 'Actions'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 16px',
                          fontWeight: 600,
                          fontSize: '10px',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          borderBottom: '0.5px solid var(--navy-b2)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ASSETS.map((a) => (
                    <tr
                      key={a.id}
                      style={{
                        borderBottom: '0.5px solid var(--navy-b2)',
                      }}
                    >
                      <td
                        style={{
                          padding: '14px 16px',
                          fontWeight: 600,
                          color: 'var(--text1)',
                        }}
                      >
                        {a.label}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text2)' }}>
                        {a.balance}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          fontWeight: 600,
                          color: 'var(--text1)',
                        }}
                      >
                        {a.usd}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          fontWeight: 600,
                          color:
                            a.up === false
                              ? 'var(--red)'
                              : 'var(--emerald)',
                        }}
                      >
                        {a.h24}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => scrollTo('wallet-deposit')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'var(--em-bg)',
                              color: 'var(--emerald)',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            Deposit
                          </button>
                          <Link
                            to="/trading"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '0.5px solid var(--navy-b)',
                              background: 'transparent',
                              color: 'var(--gold)',
                              fontSize: '11px',
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-block',
                            }}
                          >
                            Trade
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  value={depositAsset}
                  onChange={setDepositAsset}
                  options={[{ value: 'usdt', label: 'USDT (TRC-20)' }]}
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
                    {DEPOSIT_ADDRESS}
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
              <div style={labelUpper}>Withdraw</div>
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
                  value={withdrawAsset}
                  onChange={setWithdrawAsset}
                  options={[
                    { value: 'usdt', label: 'USDT (TRC-20)' },
                    { value: 'btc', label: 'Bitcoin' },
                    { value: 'eth', label: 'Ethereum' },
                    { value: 'gold', label: 'Digital Gold' },
                    { value: 'sol', label: 'Solana' },
                  ]}
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
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
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
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
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
                type="button"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--gold)',
                  color: 'var(--navy)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Confirm Withdrawal
              </button>
              <p
                style={{
                  marginTop: '12px',
                  fontSize: '11px',
                  color: 'var(--text3)',
                  lineHeight: 1.5,
                }}
              >
                2FA required. Withdrawals are processed within 10–30 minutes after
                network confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
