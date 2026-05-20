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

function normalize2FA(raw) {
  if (!raw || typeof raw !== 'object') return false
  if (raw.twoFactorEnabled === true || raw.two_factor_enabled === true) return true
  if (raw.is2fa === true || raw.is_2fa === true) return true
  if (raw['2fa_enabled'] === true) return true
  return false
}

function PasswordRow({ label, value, onChange, show, onToggleShow, autoComplete, marginBottom = '14px' }) {
  return (
    <div style={{ marginBottom }}>
      <label style={{ ...labelUpper, marginBottom: '6px', display: 'block' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, marginBottom: 0, paddingRight: '44px' }}
        />
        <button
          type="button"
          onClick={onToggleShow}
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text2)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
          }}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
        >
          <i className={`ti ${show ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: '18px' }} />
        </button>
      </div>
    </div>
  )
}

const TIPS = [
  'Use a strong, unique password for AURUMEX and do not reuse it on other sites.',
  'Never share your credentials, recovery codes, or one-time passwords with anyone.',
  'Enable two-factor authentication when available to protect withdrawals and sensitive actions.',
  'Log out on shared devices and review active sessions periodically.',
  'Beware of phishing — AURUMEX will never ask for your password over email or chat.',
]

export default function Security() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [profileLoading, setProfileLoading] = useState(true)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [toggle2FALoading, setToggle2FALoading] = useState(false)
  const [toggle2FAError, setToggle2FAError] = useState('')
  const [toggle2FASuccess, setToggle2FASuccess] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  const loadProfile = async () => {
    try {
      const res = await userAPI.getProfile()
      const data = res.data?.data ?? res.data ?? {}
      setTwoFAEnabled(normalize2FA(data))
    } catch (err) {
      console.error('Security profile:', err)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (!toggle2FASuccess) return
    const t = setTimeout(() => setToggle2FASuccess(''), 4000)
    return () => clearTimeout(t)
  }, [toggle2FASuccess])

  const handleChangePassword = async () => {
    setPwdError('')
    setPwdSuccess('')
    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirmation do not match.')
      return
    }
    setPwdLoading(true)
    try {
      await userAPI.changePassword({ currentPassword, newPassword })
      setPwdSuccess('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Could not update password.')
    } finally {
      setPwdLoading(false)
    }
  }

  const handleToggle2FA = async () => {
    setToggle2FAError('')
    setToggle2FASuccess('')
    setToggle2FALoading(true)
    try {
      await userAPI.toggle2FA()
      await loadProfile()
      setToggle2FASuccess(twoFAEnabled ? '2FA has been disabled.' : '2FA has been enabled.')
    } catch (err) {
      setToggle2FAError(err.response?.data?.message || 'Could not update 2FA.')
    } finally {
      setToggle2FALoading(false)
    }
  }

  const badge2FA = {
    background: twoFAEnabled ? 'rgba(29,158,117,0.12)' : 'rgba(138,143,168,0.12)',
    color: twoFAEnabled ? 'var(--emerald)' : 'var(--text3)',
    border: twoFAEnabled ? '0.5px solid rgba(29,158,117,0.35)' : '0.5px solid var(--navy-b)',
  }

  if (profileLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy)' }}>
        <Sidebar activePage="security" user={user} />
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
          Loading security…
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', background: 'var(--navy)', minHeight: '100vh' }}>
      <Sidebar activePage="security" user={user} />

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
            Security
          </h1>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text3)',
              letterSpacing: '0.5px',
            }}
          >
            Password, two-factor authentication, and account safety
          </p>
        </div>

        <div style={{ maxWidth: '640px' }}>
          <div style={cardBase}>
            <div style={{ ...labelUpper, marginBottom: '14px' }}>Change Password</div>

            <PasswordRow
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggleShow={() => setShowCurrent((v) => !v)}
              autoComplete="current-password"
            />
            <PasswordRow
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggleShow={() => setShowNew((v) => !v)}
              autoComplete="new-password"
            />
            <PasswordRow
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
              autoComplete="new-password"
              marginBottom="14px"
            />

            {pwdError ? (
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
                {pwdError}
              </div>
            ) : null}
            {pwdSuccess ? (
              <div
                style={{
                  background: 'rgba(29,158,117,0.12)',
                  border: '0.5px solid rgba(29,158,117,0.35)',
                  color: 'var(--emerald)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  marginBottom: '14px',
                }}
              >
                {pwdSuccess}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleChangePassword}
              disabled={pwdLoading}
              style={{
                padding: '12px 22px',
                background: pwdLoading ? 'var(--text3)' : 'var(--gold)',
                color: 'var(--navy)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: pwdLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: pwdLoading ? 0.85 : 1,
              }}
            >
              {pwdLoading ? 'Updating…' : 'Update Password'}
            </button>
          </div>

          <div style={cardBase}>
            <div style={{ ...labelUpper, marginBottom: '14px' }}>Two-Factor Authentication</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text2)' }}>Status</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  ...badge2FA,
                }}
              >
                {twoFAEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text3)', lineHeight: 1.6, margin: '0 0 12px' }}>
              Two-factor authentication adds a second step when signing in or performing sensitive
              actions, so a stolen password alone is not enough to access your account.
            </p>

            {toggle2FAError ? (
              <div
                style={{
                  background: 'var(--red-bg)',
                  border: '0.5px solid var(--red-b)',
                  color: 'var(--red)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  marginBottom: '12px',
                }}
              >
                {toggle2FAError}
              </div>
            ) : null}
            {toggle2FASuccess ? (
              <div
                style={{
                  background: 'rgba(29,158,117,0.12)',
                  border: '0.5px solid rgba(29,158,117,0.35)',
                  color: 'var(--emerald)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  marginBottom: '12px',
                }}
              >
                {toggle2FASuccess}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleToggle2FA}
              disabled={toggle2FALoading}
              style={{
                padding: '10px 18px',
                background: 'transparent',
                color: 'var(--gold)',
                border: '0.5px solid var(--gold-dim)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: toggle2FALoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                marginBottom: '10px',
                opacity: toggle2FALoading ? 0.75 : 1,
              }}
            >
              {toggle2FALoading
                ? 'Please wait…'
                : twoFAEnabled
                  ? 'Disable 2FA'
                  : 'Enable 2FA'}
            </button>

            <p style={{ fontSize: '0.72rem', color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text2)' }}>Note:</strong> Full TOTP setup (authenticator
              app QR codes and backup codes) is coming soon.
            </p>
          </div>

          <div style={cardBase}>
            <div style={{ ...labelUpper, marginBottom: '14px' }}>Active Sessions</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'var(--navy)',
                border: '0.5px solid var(--navy-b)',
                borderRadius: '8px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text1)', fontWeight: 500 }}>
                  This device
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>
                  Current browser session
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--emerald)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(29,158,117,0.12)',
                  border: '0.5px solid rgba(29,158,117,0.35)',
                }}
              >
                Active now
              </span>
            </div>
          </div>

          <div style={{ ...cardBase, marginBottom: 0 }}>
            <div style={{ ...labelUpper, marginBottom: '14px' }}>Security Tips</div>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.1rem',
                color: 'var(--text2)',
                fontSize: '0.85rem',
                lineHeight: 1.65,
              }}
            >
              {TIPS.map((tip) => (
                <li key={tip} style={{ marginBottom: '8px' }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
