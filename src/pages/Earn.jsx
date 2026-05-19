import { useMemo, useState } from 'react'
import Sidebar from '../components/layout/Sidebar.jsx'

const card = {
  background: 'var(--navy-card)',
  borderRadius: '10px',
  border: '0.5px solid var(--navy-b2)',
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'flexible', label: 'Flexible' },
  { id: 'fixed', label: 'Fixed' },
  { id: 'staking', label: 'Staking' },
]

const PRODUCTS = [
  {
    title: 'Gold Vault 90D',
    apy: '12.5%',
    badge: 'HOT',
    accent: 'var(--gold)',
    cats: ['fixed', 'all'],
  },
  {
    title: 'BTC Flexible',
    apy: '5.2%',
    badge: null,
    accent: 'var(--amber)',
    cats: ['flexible', 'all'],
  },
  {
    title: 'ETH Liquid Staking',
    apy: '6.8%',
    badge: null,
    accent: 'var(--blue)',
    cats: ['staking', 'all'],
  },
  {
    title: 'USDT Fixed 30D',
    apy: '8.4%',
    badge: null,
    accent: 'var(--emerald)',
    cats: ['fixed', 'all'],
  },
  {
    title: 'Dual-Asset Vault',
    apy: '18.0%',
    badge: 'NEW',
    accent: 'var(--purple)',
    cats: ['flexible', 'all'],
  },
  {
    title: 'Commodity Basket 180D',
    apy: '9.6%',
    badge: null,
    accent: 'var(--gold-dim)',
    cats: ['fixed', 'all'],
  },
]

export default function Earn() {
  const [tab, setTab] = useState('all')

  const visible = useMemo(() => {
    if (tab === 'all') return PRODUCTS
    return PRODUCTS.filter((p) => p.cats.includes(tab))
  }, [tab])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activePage="earn" />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: 'var(--navy)',
        }}
      >
        <div
          style={{
            flex: 1,
            padding: '1.2rem',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              ...card,
              padding: '1.5rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
              background: 'var(--navy-card)',
              border: '0.5px solid var(--navy-b)',
            }}
          >
            <div style={{ flex: '1 1 280px' }}>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--text1)',
                  lineHeight: 1.2,
                }}
              >
                Put your assets to work
              </h1>
              <div
                style={{
                  display: 'flex',
                  gap: '28px',
                  marginTop: '20px',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { k: '$9.2M', l: 'TVL' },
                  { k: '4200+', l: 'Earners' },
                  { k: '$1.4M', l: 'Distributed' },
                ].map((s) => (
                  <div key={s.l}>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1.45rem',
                        fontWeight: 700,
                        color: 'var(--gold)',
                      }}
                    >
                      {s.k}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: 'var(--text3)',
                        marginTop: '4px',
                      }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                width: '132px',
                height: '132px',
                borderRadius: '50%',
                border: '3px solid var(--gold)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--gold-glow)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--gold)',
                  lineHeight: 1,
                }}
              >
                12.5%
              </div>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  color: 'var(--text3)',
                  marginTop: '8px',
                  textAlign: 'center',
                }}
              >
                MAX APY
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '18px', flexWrap: 'wrap' }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '0.5px solid var(--navy-b)',
                  background: tab === t.id ? 'var(--gold-glow)' : 'var(--navy-mid)',
                  color: tab === t.id ? 'var(--gold)' : 'var(--text2)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '16px',
            }}
            className="earn-product-grid"
          >
            {visible.map((p) => (
              <div
                key={p.title}
                style={{
                  ...card,
                  padding: '1.15rem',
                  borderLeft: `3px solid ${p.accent}`,
                  position: 'relative',
                }}
              >
                {p.badge ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      fontSize: '9px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background:
                        p.badge === 'HOT' ? 'var(--red-bg)' : 'var(--navy-b2)',
                      color: p.badge === 'HOT' ? 'var(--red)' : 'var(--purple)',
                    }}
                  >
                    {p.badge}
                  </span>
                ) : null}
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text3)',
                    marginBottom: '10px',
                  }}
                >
                  Product
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--text1)',
                    paddingRight: p.badge ? '48px' : 0,
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    marginTop: '14px',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: p.accent,
                  }}
                >
                  {p.apy}{' '}
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text3)',
                    }}
                  >
                    APY
                  </span>
                </div>
                <button
                  type="button"
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '0.5px solid var(--navy-b)',
                    background: 'var(--navy-card2)',
                    color: 'var(--gold)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1100px) {
          .earn-product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .earn-product-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
