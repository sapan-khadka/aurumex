import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'
import Sidebar from '../components/layout/Sidebar.jsx'

const cardBase = {
  background: 'var(--navy-card)',
  border: '0.5px solid var(--navy-b)',
  borderRadius: '8px',
  padding: '1.25rem',
  marginBottom: '16px',
}

const labelUpper = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text3)',
  marginBottom: '8px',
}

const inputStyle = {
  width: '100%',
  background: 'var(--navy)',
  border: '0.5px solid var(--navy-b)',
  borderRadius: '6px',
  padding: '10px 14px',
  color: 'var(--text1)',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const COUNTRIES = [
  'Nepal',
  'India',
  'Bangladesh',
  'Sri Lanka',
  'United States',
  'United Kingdom',
  'Other',
]

function normalizeProfile(raw) {
  if (!raw || typeof raw !== 'object') return {}
  return {
    fullName: raw.fullName ?? raw.full_name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    country: raw.country ?? '',
    createdAt: raw.createdAt ?? raw.created_at,
    kycStatus: raw.kycStatus ?? raw.kyc_status ?? 'unverified',
    id: raw.id ?? raw.user_id ?? raw.uuid,
    defaultCurrency: raw.defaultCurrency ?? raw.default_currency ?? 'USD',
  }
}

function truncId(id) {
  if (id == null) return '—'
  const s = String(id)
  if (s.length <= 14) return s
  return `${s.slice(0, 8)}…${s.slice(-4)}`
}

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [defaultCurrency, setDefaultCurrency] = useState('USD')
  const [emailNotif, setEmailNotif] = useState(true)
  const [saveError, setSaveError] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveToast, setSaveToast] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const p = normalizeProfile(profile)

  const loadProfile = async () => {
    try {
      const res = await userAPI.getProfile()
      const data = res.data?.data ?? res.data ?? {}
      setProfile(data)
      const n = normalizeProfile(data)
      setFullName(n.fullName)
      setPhone(n.phone)
      setCountry(n.country)
      setDefaultCurrency(n.defaultCurrency || 'USD')
    } catch (err) {
      console.error('Profile fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (!saveToast) return
    const t = setTimeout(() => setSaveToast(false), 4000)
    return () => clearTimeout(t)
  }, [saveToast])

  const handleSave = async () => {
    setSaveError('')
    setSaveLoading(true)
    try {
      await userAPI.updateProfile({ fullName, phone, country })
      setSaveToast(true)
      await loadProfile()
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save profile')
    } finally {
      setSaveLoading(false)
    }
  }

  const kycLower = String(p.kycStatus || '').toLowerCase()
  const kycBadge = {
    background:
      kycLower === 'verified'
        ? 'rgba(29,158,117,0.12)'
        : kycLower === 'pending'
          ? 'rgba(201,166,70,0.12)'
          : 'rgba(138,143,168,0.12)',
    color:
      kycLower === 'verified'
        ? 'var(--emerald)'
        : kycLower === 'pending'
          ? 'var(--gold)'
          : 'var(--text3)',
    border:
      kycLower === 'verified'
        ? '0.5px solid rgba(29,158,117,0.35)'
        : kycLower === 'pending'
          ? '0.5px solid var(--gold-dim)'
          : '0.5px solid var(--navy-b)',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy)' }}>
        <Sidebar activePage="settings" user={user} />
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold)',
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          Loading settings…
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', background: 'var(--navy)', minHeight: '100vh' }}>
      <Sidebar activePage="settings" user={user} />

      <main style={{ flex: 1, padding: '28px 40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.8rem',
              color: 'var(--text1)',
              marginBottom: '4px',
              fontWeight: 500,
            }}
          >
            Settings
          </h1>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text3)',
              letterSpacing: '0.5px',
            }}
          >
            Manage your profile and preferences
          </p>
        </div>

        <div style={{ maxWidth: '640px' }}>
          <div style={cardBase}>
            <div style={{ ...labelUpper, marginBottom: '14px' }}>Profile Information</div>

            <label style={{ ...labelUpper, marginBottom: '6px' }}>Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ ...inputStyle, marginBottom: '14px' }}
            />

            <label style={{ ...labelUpper, marginBottom: '6px' }}>Email</label>
            <input
              value={p.email}
              readOnly
              style={{
                ...inputStyle,
                marginBottom: '14px',
                color: 'var(--text3)',
                background: 'var(--navy-card2)',
                cursor: 'not-allowed',
              }}
            />

            <label style={{ ...labelUpper, marginBottom: '6px' }}>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ ...inputStyle, marginBottom: '14px' }}
              placeholder="Phone number"
            />

            <label style={{ ...labelUpper, marginBottom: '6px' }}>Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ ...inputStyle, marginBottom: '14px', cursor: 'pointer' }}
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {saveError ? (
              <div
                style={{
                  background: 'var(--red-bg)',
                  border: '0.5px solid var(--red-b)',
                  color: 'var(--red)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  marginBottom: '14px',
                }}
              >
                {saveError}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              disabled={saveLoading}
              style={{
                padding: '12px 22px',
                background: saveLoading ? 'var(--text3)' : 'var(--gold)',
                color: 'var(--navy)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: saveLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: saveLoading ? 0.85 : 1,
              }}
            >
              {saveLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

          <div style={cardBase}>
            <div style={{ ...labelUpper, marginBottom: '14px' }}>Preferences</div>

            <label style={{ ...labelUpper, marginBottom: '6px' }}>
              Default currency display
            </label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              style={{ ...inputStyle, marginBottom: '14px', cursor: 'pointer' }}
            >
              <option value="USD">USD</option>
            </select>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderTop: '0.5px solid rgba(255,255,255,0.06)',
                marginTop: '8px',
              }}
            >
              <div>
                <div style={{ color: 'var(--text1)', fontSize: '0.88rem', fontWeight: 500 }}>
                  Theme
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '4px' }}>
                  AURUMEX theme is fixed for consistency
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text3)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'var(--navy-card2)',
                  border: '0.5px solid var(--navy-b)',
                }}
              >
                Dark
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0 0',
                borderTop: '0.5px solid rgba(255,255,255,0.06)',
                marginTop: '8px',
              }}
            >
              <div>
                <div style={{ color: 'var(--text1)', fontSize: '0.88rem', fontWeight: 500 }}>
                  Email notifications
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '4px' }}>
                  Marketing &amp; account alerts (display only)
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={emailNotif}
                onClick={() => setEmailNotif((v) => !v)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  background: emailNotif ? 'var(--emerald)' : 'var(--navy-card2)',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--text1)',
                    marginLeft: emailNotif ? '20px' : '0',
                    transition: 'margin-left 0.15s ease',
                  }}
                />
              </button>
            </div>
          </div>

          <div style={{ ...cardBase, marginBottom: 0 }}>
            <div style={{ ...labelUpper, marginBottom: '14px' }}>Account</div>
            <div
              style={{
                fontSize: '0.88rem',
                color: 'var(--text2)',
                lineHeight: 1.8,
              }}
            >
              <div>
                <span style={{ color: 'var(--text3)' }}>Member since</span>{' '}
                {p.createdAt
                  ? new Date(p.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text3)' }}>KYC status</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '999px',
                    textTransform: 'capitalize',
                    ...kycBadge,
                  }}
                >
                  {p.kycStatus || '—'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text3)' }}>Account ID</span>{' '}
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    color: 'var(--text1)',
                  }}
                >
                  {truncId(p.id)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {saveToast ? (
          <div
            style={{
              position: 'fixed',
              bottom: 28,
              right: 28,
              background: 'rgba(29,158,117,0.15)',
              border: '0.5px solid var(--emerald)',
              color: 'var(--emerald)',
              padding: '14px 20px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 500,
              zIndex: 100,
            }}
          >
            Profile saved successfully
          </div>
        ) : null}
      </main>
    </div>
  )
}
