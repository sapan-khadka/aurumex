import { Link } from 'react-router-dom'

const MAIN_NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'ti-layout-dashboard',
    to: '/dashboard',
  },
  {
    id: 'trade',
    label: 'Trade',
    icon: 'ti-chart-candle',
    to: '/trading',
  },
  {
    id: 'markets',
    label: 'Markets',
    icon: 'ti-trending-up',
    to: '/markets',
  },
  { id: 'earn', label: 'Earn', icon: 'ti-coin', to: '/earn' },
]

const ACCOUNT_NAV = [
  { id: 'wallet', label: 'Wallet', icon: 'ti-wallet', to: '/wallet' },
  { id: 'kyc', label: 'KYC', icon: 'ti-id-badge', to: '/kyc' },
  { id: 'history', label: 'History', icon: 'ti-history', to: '/history' },
  {
    id: 'security',
    label: 'Security',
    icon: 'ti-shield-lock',
    to: '/security',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'ti-settings',
    to: '/settings',
  },
]

const linkBase = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 14px 10px 16px',
  textDecoration: 'none',
  fontFamily: 'inherit',
  fontSize: '13px',
  fontWeight: 500,
  width: '100%',
  boxSizing: 'border-box',
  lineHeight: 1.4,
  cursor: 'pointer',
}

const sectionLabelStyle = {
  padding: '0 16px 8px',
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text3)',
}

function NavSection({ title, items, activePage }) {
  return (
    <>
      <div style={{ ...sectionLabelStyle, marginTop: title === 'Main' ? 0 : 20 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {items.map((item) => {
          const isActive = activePage === item.id
          return (
            <Link
              key={item.id}
              to={item.to}
              style={{
                ...linkBase,
                borderLeft: isActive
                  ? '2px solid var(--gold)'
                  : '2px solid transparent',
                color: isActive ? 'var(--gold)' : 'var(--text2)',
                background: isActive ? 'var(--gold-glow)' : 'transparent',
              }}
            >
              <i
                className={`ti ${item.icon}`}
                style={{ fontSize: '18px', opacity: isActive ? 1 : 0.88 }}
                aria-hidden
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}

export default function Sidebar({ activePage }) {
  return (
    <aside
      style={{
        width: '192px',
        minHeight: '100vh',
        background: 'var(--navy-mid)',
        borderRight: '0.5px solid var(--navy-b)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '22px 16px 20px' }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: 'var(--gold)',
            lineHeight: 1.15,
          }}
        >
          AURUMEX
        </div>
        <div
          style={{
            marginTop: '6px',
            fontSize: '9px',
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text3)',
          }}
        >
          GLOBAL MARKETS
        </div>
      </div>

      <nav
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '12px',
          overflow: 'auto',
        }}
      >
        <NavSection title="Main" items={MAIN_NAV} activePage={activePage} />
        <NavSection title="Account" items={ACCOUNT_NAV} activePage={activePage} />
      </nav>

      <div
        style={{
          padding: '16px',
          borderTop: '0.5px solid var(--navy-b2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--gold)',
            color: 'var(--navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}
        >
          TB
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              color: 'var(--text1)',
              fontWeight: 500,
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Thomas B.
          </div>
          <div
            style={{
              color: 'var(--emerald)',
              fontSize: '11px',
              marginTop: '2px',
            }}
          >
            Verified ✓
          </div>
        </div>
      </div>
    </aside>
  )
}
