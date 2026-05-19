import { Link } from 'react-router-dom'

export default function PageTopbar({
  title,
  alertCount = 2,
  right,
}) {
  return (
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
      <span style={{ fontWeight: 500, color: 'var(--text1)' }}>{title}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {right ?? (
          <>
            {alertCount > 0 ? (
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
                {alertCount} alerts
              </span>
            ) : null}
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
          </>
        )}
      </div>
    </header>
  )
}
