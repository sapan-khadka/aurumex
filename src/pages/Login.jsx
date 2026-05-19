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

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      const { accessToken, refreshToken, user } = res.data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
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
          <div
            style={{
              marginTop: '6px',
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text3)',
            }}
          >
            GLOBAL MARKETS
          </div>
        </div>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text1)',
            textAlign: 'center',
            marginTop: '1.25rem',
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--text2)',
            fontSize: '0.9rem',
            marginTop: '8px',
          }}
        >
          Sign in to your account
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
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <Link
              to="/forgot-password"
              style={{
                color: 'var(--gold)',
                fontSize: '0.82rem',
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...goldBtn,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {error ? <div style={{ ...errorBox, marginTop: '12px' }}>{error}</div> : null}

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--text3)',
          }}
        >
          Don&apos;t have an account?
        </div>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <Link
            to="/register"
            style={{
              color: 'var(--gold)',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
