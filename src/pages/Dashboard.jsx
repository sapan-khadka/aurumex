import { Link } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import Sidebar from '../components/layout/Sidebar.jsx'

const DISTRIBUTION = [
  { name: 'GOLD', value: 41, fill: 'var(--gold)' },
  { name: 'BTC', value: 28, fill: 'var(--emerald)' },
  { name: 'ETH', value: 18, fill: 'var(--blue)' },
  { name: 'Other', value: 13, fill: 'var(--text3)' },
]

const HOLDINGS = [
  {
    name: 'Digital Gold',
    amount: '8.24g',
    usd: '$19,716',
    change: '+1.84%',
    changeType: 'up',
  },
  {
    name: 'Bitcoin',
    amount: '0.1312 BTC',
    usd: '$13,624',
    change: '+2.14%',
    changeType: 'up',
  },
  {
    name: 'Ethereum',
    amount: '2.281 ETH',
    usd: '$8,717',
    change: '+1.76%',
    changeType: 'up',
  },
  {
    name: 'USDT',
    amount: '6,263.64',
    usd: '$6,264',
    change: 'Stable',
    changeType: 'stable',
  },
]

const TRANSACTIONS = [
  {
    icon: 'ti-coin',
    iconBg: 'var(--gold-glow)',
    iconColor: 'var(--gold)',
    title: 'Digital Gold Purchase',
    date: 'May 16, 2026',
    amount: '+2.40 g',
    usd: '$5,748.00',
    usdTone: 'var(--text1)',
  },
  {
    icon: 'ti-currency-bitcoin',
    iconBg: 'var(--em-bg)',
    iconColor: 'var(--emerald)',
    title: 'Buy Bitcoin',
    date: 'May 15, 2026',
    amount: '+0.0312 BTC',
    usd: '$3,246.00',
    usdTone: 'var(--emerald)',
  },
  {
    icon: 'ti-arrow-bar-down',
    iconBg: 'var(--em-bg)',
    iconColor: 'var(--emerald)',
    title: 'USDT Deposit',
    date: 'May 14, 2026',
    amount: '+$5,000.00',
    usd: '$5,000.00',
    usdTone: 'var(--text1)',
  },
  {
    icon: 'ti-chart-line',
    iconBg: 'var(--red-bg)',
    iconColor: 'var(--red)',
    title: 'Spot Fee Rebate',
    date: 'May 12, 2026',
    amount: '+$42.80',
    usd: '$42.80',
    usdTone: 'var(--gold)',
  },
]

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

function ActionBtn({ bg, color, icon, label }) {
  return (
    <button
      type="button"
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
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: '22px' }} aria-hidden />
      <span>{label}</span>
    </button>
  )
}

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activePage="dashboard" />
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
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'var(--text2)',
                display: 'flex',
              }}
              aria-label="Notifications"
            >
              <i className="ti ti-bell" style={{ fontSize: '20px' }} />
            </button>
            <Link
              to="/settings"
              style={{
                color: 'var(--text2)',
                display: 'flex',
                lineHeight: 0,
              }}
              aria-label="Settings"
            >
              <i className="ti ti-settings" style={{ fontSize: '20px' }} />
            </Link>
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
                $48,320.64
              </div>
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
                +$1,284.20 today +2.73%
              </div>
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
                />
                <ActionBtn
                  bg="var(--gold)"
                  color="var(--navy)"
                  icon="ti-building-bank"
                  label="Withdraw"
                />
                <ActionBtn
                  bg="var(--blue)"
                  color="var(--navy)"
                  icon="ti-chart-candle"
                  label="Trade"
                />
              </div>
            </div>

            <div style={{ ...card, padding: '1.25rem' }}>
              <div style={labelUpper}>Asset Distribution</div>
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
                        data={DISTRIBUTION}
                        dataKey="value"
                        nameKey="name"
                        cx="42%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={88}
                        paddingAngle={2}
                        stroke="var(--navy-card)"
                        strokeWidth={1}
                      >
                        {DISTRIBUTION.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{
                          paddingLeft: '8px',
                          fontSize: '12px',
                          color: 'var(--text2)',
                        }}
                        formatter={(value, entry) => (
                          <span style={{ color: 'var(--text1)' }}>
                            {value}{' '}
                            <span style={{ color: 'var(--text3)' }}>
                              {entry.payload?.value}%
                            </span>
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
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
            {[
              {
                label: 'Today P&L',
                value: '+$1,284.20',
                valueColor: 'var(--emerald)',
                serif: false,
              },
              {
                label: 'Open Orders',
                value: '3',
                valueColor: 'var(--text1)',
                serif: true,
              },
              {
                label: '30-Day Return',
                value: '+14.8%',
                valueColor: 'var(--emerald)',
                serif: false,
              },
              {
                label: 'Fee Saved',
                value: '$42.80',
                valueColor: 'var(--gold)',
                serif: false,
              },
            ].map((stat) => (
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
                {HOLDINGS.map((h, i) => (
                  <div
                    key={h.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '14px 0',
                      borderTop:
                        i === 0 ? 'none' : '0.5px solid var(--navy-b2)',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--text1)',
                          fontSize: '13px',
                        }}
                      >
                        {h.name}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text3)',
                          marginTop: '2px',
                        }}
                      >
                        {h.amount}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--text1)',
                          fontSize: '13px',
                        }}
                      >
                        {h.usd}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          marginTop: '2px',
                          fontWeight: 500,
                          color:
                            h.changeType === 'stable'
                              ? 'var(--text2)'
                              : 'var(--emerald)',
                        }}
                      >
                        {h.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...card, padding: '1.25rem' }}>
              <div style={labelUpper}>Recent Transactions</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {TRANSACTIONS.map((tx, i) => (
                  <div
                    key={`${tx.title}-${tx.date}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderTop:
                        i === 0 ? 'none' : '0.5px solid var(--navy-b2)',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: tx.iconBg,
                        color: tx.iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <i className={`ti ${tx.icon}`} style={{ fontSize: '18px' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--text1)',
                          fontSize: '13px',
                        }}
                      >
                        {tx.title}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text3)',
                          marginTop: '2px',
                        }}
                      >
                        {tx.date}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text1)',
                        }}
                      >
                        {tx.amount}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: tx.usdTone,
                          marginTop: '2px',
                          fontWeight: 500,
                        }}
                      >
                        {tx.usd}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
