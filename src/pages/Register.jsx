import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

const card = {
  width: '100%',
  maxWidth: '400px',
  background: 'var(--navy-card)',
  border: '0.5px solid var(--navy-b)',
  borderRadius: '12px',
  padding: '2.5rem',
}

const inputStyle = {
  width: '100%',
  background: 'var(--navy)',
  border: '0.5px solid var(--navy-b)',
  borderRadius: '6px',
  padding: '10px 14px',
  color: 'var(--text1)',
  fontSize: '0.9rem',
  marginBottom: '12px',
  outline: 'none',
  fontFamily: 'inherit',
}

const errorBox = {
  background: 'var(--red-bg)',
  border: '0.5px solid var(--red-b)',
  color: 'var(--red)',
  padding: '10px 14px',
  borderRadius: '6px',
  fontSize: '0.82rem',
  marginBottom: '12px',
}

const goldBtn = {
  width: '100%',
  padding: '12px',
  background: 'var(--gold)',
  color: 'var(--navy)',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.9rem',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const res = await authAPI.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
      })
      const { accessToken, refreshToken, user } = res.data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--gold)',
            }}
          >
            AURUMEX
          </div>
        </div>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text1)',
            textAlign: 'center',
            marginTop: '1rem',
          }}
        >
          Create your account
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--text2)',
            fontSize: '0.9rem',
            marginTop: '8px',
            marginBottom: '8px',
          }}
        >
          Start trading digital gold and crypto
        </p>

        <div
          style={{
            height: '1px',
            background: 'var(--gold)',
            opacity: 0.45,
            margin: '1.25rem 0',
          }}
        />

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--text3)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Full name
          </label>
          <input
            type="text"
            autoComplete="name"
            value={formData.full_name}
            onChange={(e) => setField('full_name', e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--gold-dim)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = ''
            }}
          />

          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--text3)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setField('email', e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--gold-dim)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = ''
            }}
          />

          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--text3)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Password
          </label>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setField('password', e.target.value)}
              required
              style={{
                ...inputStyle,
                marginBottom: 0,
                paddingRight: '44px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--gold-dim)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = ''
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: '18px' }} />
            </button>
          </div>

          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--text3)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Confirm password
          </label>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) => setField('confirmPassword', e.target.value)}
              required
              style={{
                ...inputStyle,
                marginBottom: 0,
                paddingRight: '44px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--gold-dim)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = ''
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
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
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              <i className={`ti ${showConfirm ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: '18px' }} />
            </button>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              marginBottom: '16px',
              fontSize: '0.82rem',
              color: 'var(--text2)',
              lineHeight: 1.45,
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: '3px', accentColor: 'var(--gold)' }}
            />
            <span>I agree to the Terms of Service and Risk Disclosure</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...goldBtn,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {error ? <div style={{ ...errorBox, marginTop: '12px' }}>{error}</div> : null}

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--text3)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
