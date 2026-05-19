import { Link } from 'react-router-dom'

const TICKER = [
  { pair: 'BTC/USDT', price: '$103,842', ch: '+2.14%', up: true },
  { pair: 'ETH/USDT', price: '$3,821', ch: '+1.76%', up: true },
  { pair: 'GOLD/USDT', price: '$2,341', ch: '+1.84%', up: true },
  { pair: 'OIL/USDT', price: '$78.45', ch: '-0.32%', up: false },
  { pair: 'SOL/USDT', price: '$178', ch: '+3.41%', up: true },
  { pair: 'BNB/USDT', price: '$612', ch: '+0.95%', up: true },
  { pair: 'XAG/USDT', price: '$29.81', ch: '-0.17%', up: false },
  { pair: 'DOGE/USDT', price: '$0.184', ch: '+5.22%', up: true },
]

const HERO_ASSETS = [
  { sym: 'BTC', price: '$103,842', ch: '+2.14%', up: true },
  { sym: 'ETH', price: '$3,821', ch: '+1.76%', up: true },
  { sym: 'GOLD', price: '$2,341', ch: '+1.84%', up: true },
  { sym: 'OIL', price: '$78.45', ch: '-0.32%', up: false },
]

const FEATURES = [
  { icon: 'ti-shield-lock', title: 'Bank-grade security', text: 'Cold storage, multi-sig custody, and continuous adversarial testing.' },
  { icon: 'ti-coin', title: 'Real-asset backing', text: 'Gold and commodity exposure alongside leading crypto markets.' },
  { icon: 'ti-bolt', title: 'Instant execution', text: 'Low-latency matching and deep aggregated liquidity routes.' },
  { icon: 'ti-chart-line', title: 'Advanced charting', text: 'Multi-timeframe tools built for precision entries and exits.' },
  { icon: 'ti-layout-grid', title: 'Multi-asset in one place', text: 'Spot metals, energy, majors, and alts from a single account.' },
  { icon: 'ti-certificate', title: 'Compliant & regulated', text: 'KYC tiers, audit-ready reporting, and jurisdictional controls.' },
]

function TickerStrip() {
  const items = [...TICKER, ...TICKER]
  return (
    <div
      style={{
        overflow: 'hidden',
        borderBottom: '0.5px solid var(--navy-b)',
        background: 'var(--navy-mid)',
      }}
    >
      <div className="landing-ticker-track" aria-hidden={false}>
        {items.map((t, i) => (
          <div
            key={`${t.pair}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 28px',
              whiteSpace: 'nowrap',
              fontSize: '12px',
              borderRight: '0.5px solid var(--navy-b2)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: t.up ? 'var(--emerald)' : 'var(--red)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontWeight: 700, color: 'var(--text1)' }}>{t.pair}</span>
            <span style={{ color: 'var(--text1)', fontFamily: "'DM Mono', monospace" }}>
              {t.price}
            </span>
            <span
              style={{
                fontWeight: 600,
                color: t.up ? 'var(--emerald)' : 'var(--red)',
              }}
            >
              {t.ch}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '0 1.5rem',
          height: '64px',
          background: 'var(--navy-mid)',
          borderBottom: '0.5px solid var(--navy-b)',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', lineHeight: 1.15 }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.35rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--gold)',
            }}
          >
            AURUMEX
          </div>
          <div
            style={{
              fontSize: '8px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text3)',
              marginTop: '4px',
            }}
          >
            Global Markets
          </div>
        </Link>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { to: '/markets', label: 'Markets' },
            { to: '/trading', label: 'Trade' },
            { to: '/earn', label: 'Earn' },
            { to: '/wallet', label: 'Wallet' },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                color: 'var(--text2)',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/dashboard"
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid var(--gold-dim)',
              color: 'var(--gold)',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Log in
          </Link>
          <Link
            to="/dashboard"
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--gold)',
              color: 'var(--navy)',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Sign up
          </Link>
        </div>
      </nav>

      <TickerStrip />

      <section
        style={{
          position: 'relative',
          padding: '4rem 1.5rem 3rem',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 55% 50% at 50% 42%, var(--gold-glow) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', maxWidth: '820px', margin: '0 auto' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--gold)',
              marginBottom: '16px',
            }}
          >
            MULTI-ASSET TRADING PLATFORM
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
              fontWeight: 700,
              color: 'var(--text1)',
              lineHeight: 1.18,
            }}
          >
            Trade Digital Assets &{' '}
            <span style={{ color: 'var(--gold)' }}>Real-World Commodities</span>
            {' '}in One Platform
          </h1>
          <p
            style={{
              marginTop: '20px',
              color: 'var(--text2)',
              fontSize: '15px',
              maxWidth: '560px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.65,
            }}
          >
            Access spot crypto, tokenized precious metals, and energy markets with
            institutional-grade execution — all from one compliant, unified balance
            sheet designed for serious traders and long-term allocators.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '28px',
            }}
          >
            <Link
              to="/trading"
              style={{
                padding: '12px 26px',
                borderRadius: '8px',
                background: 'var(--gold)',
                color: 'var(--navy)',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '13px',
              }}
            >
              Start Trading
            </Link>
            <Link
              to="/markets"
              style={{
                padding: '12px 26px',
                borderRadius: '8px',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '13px',
                background: 'transparent',
              }}
            >
              Explore Markets
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '44px',
            }}
          >
            {HERO_ASSETS.map((a) => (
              <div
                key={a.sym}
                style={{
                  minWidth: '140px',
                  padding: '16px 18px',
                  borderRadius: '10px',
                  background: 'var(--navy-card)',
                  border: '0.5px solid var(--navy-b2)',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600 }}>
                  {a.sym}
                </div>
                <div
                  style={{
                    marginTop: '8px',
                    fontWeight: 700,
                    color: 'var(--text1)',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '14px',
                  }}
                >
                  {a.price}
                </div>
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: a.up ? 'var(--emerald)' : 'var(--red)',
                  }}
                >
                  {a.ch}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          background: 'var(--navy-b2)',
          borderTop: '0.5px solid var(--navy-b2)',
          borderBottom: '0.5px solid var(--navy-b2)',
        }}
        className="landing-stats"
      >
        {[
          { v: '$2.4B+', l: '24h trading volume' },
          { v: '50K+', l: 'Registered users' },
          { v: '99.9%', l: 'Platform uptime' },
          { v: '120+', l: 'Asset pairs listed' },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              background: 'var(--navy-mid)',
              padding: '22px 16px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.65rem',
                fontWeight: 700,
                color: 'var(--gold)',
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                marginTop: '8px',
                fontSize: '11px',
                color: 'var(--text3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </section>

      <section style={{ padding: '3.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.75rem',
            textAlign: 'center',
            color: 'var(--text1)',
            marginBottom: '2rem',
          }}
        >
          Why traders choose AURUMEX
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}
          className="landing-features"
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                padding: '1.25rem',
                borderRadius: '10px',
                background: 'var(--navy-card)',
                border: '0.5px solid var(--navy-b2)',
              }}
            >
              <i className={`ti ${f.icon}`} style={{ fontSize: '22px', color: 'var(--gold)' }} />
              <div style={{ marginTop: '12px', fontWeight: 700, color: 'var(--text1)' }}>
                {f.title}
              </div>
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text2)', lineHeight: 1.55 }}>
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 1.5rem 3.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.75rem',
            textAlign: 'center',
            color: 'var(--text1)',
            marginBottom: '2.5rem',
          }}
        >
          How it works
        </h2>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
          {[
            { n: '1', t: 'Create your account' },
            { n: '2', t: 'Fund your wallet' },
            { n: '3', t: 'Start trading' },
          ].map((step, i) => (
            <div key={step.n} style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <div style={{ flex: '0 0 auto', textAlign: 'center', width: '100%', maxWidth: '160px', margin: '0 auto' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: '2px solid var(--gold)',
                    color: 'var(--gold)',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    background: 'var(--gold-glow)',
                  }}
                >
                  {step.n}
                </div>
                <div style={{ marginTop: '14px', fontWeight: 600, color: 'var(--text1)', fontSize: '13px' }}>
                  {step.t}
                </div>
              </div>
              {i < 2 ? (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: 'var(--navy-b)',
                    marginTop: '22px',
                    minWidth: '12px',
                  }}
                  aria-hidden
                />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          borderTop: '0.5px solid var(--navy-b2)',
          padding: '2rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          background: 'var(--navy-mid)',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--gold)',
            }}
          >
            AURUMEX
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text3)', marginTop: '4px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Global Markets
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {['Terms', 'Privacy', 'Risk Disclosure', 'Legal', 'Contact'].map((label) => (
            <span
              key={label}
              style={{ color: 'var(--text2)', fontSize: '12px', cursor: 'pointer' }}
            >
              {label}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
          © {new Date().getFullYear()} AURUMEX. All rights reserved.
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .landing-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .landing-features { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .landing-features { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
