import { useState, useEffect } from 'react'
import { kycAPI } from '../services/api'
import Sidebar from '../components/layout/Sidebar.jsx'

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
  boxSizing: 'border-box',
}

const labelStyle = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text3)',
  marginBottom: '6px',
  display: 'block',
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

const DOC_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'driver_license', label: 'Driver License' },
]

function phonePrefix(country) {
  const m = {
    Nepal: '+977',
    India: '+91',
    Bangladesh: '+880',
    'Sri Lanka': '+94',
    'United States': '+1',
    'United Kingdom': '+44',
    Other: '+',
  }
  return m[country] || '+'
}

export default function KYC() {
  const [kycData, setKycData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    country: '',
    phone: '',
    documentType: 'passport',
    documentNumber: '',
    address: '',
  })

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await kycAPI.getStatus()
        const data = res.data?.data ?? res.data
        setKycData(data)
        if (data?.fullName) {
          setForm((f) => ({
            ...f,
            fullName: data.fullName,
            country: data.country || '',
            phone: data.phone || '',
          }))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  const kycStatus = kycData?.kycStatus ?? kycData?.kyc_status
  const kycLevel = kycData?.kycLevel ?? kycData?.kyc_level ?? 1
  const isVerified = kycStatus === 'verified'

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const validateStep1 = () => {
    if (!form.fullName?.trim() || !form.dateOfBirth || !form.country || !form.phone?.trim()) {
      setError('Please complete all personal info fields')
      return false
    }
    setError('')
    return true
  }

  const validateStep2 = () => {
    if (!form.documentNumber?.trim() || !form.address?.trim()) {
      setError('Please complete document details and address')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async () => {
    setError('')
    if (
      !form.fullName ||
      !form.dateOfBirth ||
      !form.country ||
      !form.phone ||
      !form.documentNumber ||
      !form.address
    ) {
      setError('Please fill all required fields')
      return
    }
    if (!confirmed) {
      setError('Please confirm that all information is accurate')
      return
    }
    setSubmitting(true)
    try {
      await kycAPI.submit(form)
      setSuccess(true)
      const res = await kycAPI.getStatus()
      setKycData(res.data?.data ?? res.data ?? null)
    } catch (err) {
      // Inline only — never clear auth or redirect (401/other errors handled globally if needed)
      setError(err.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const renderProgress = () => {
    const steps = [
      { n: 1, label: 'Personal Info' },
      { n: 2, label: 'Document' },
      { n: 3, label: 'Review' },
    ]
    return (
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'relative',
            padding: '0 8px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '17px',
              left: '12%',
              right: '12%',
              height: '2px',
              background: 'var(--navy-b)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '17px',
              left: '12%',
              width: step === 1 ? '0%' : step === 2 ? '38%' : '76%',
              maxWidth: '76%',
              height: '2px',
              background: 'var(--gold-dim)',
              zIndex: 0,
              transition: 'width 0.2s ease',
            }}
          />
          {steps.map((s) => {
            const completed = step > s.n
            const active = step === s.n
            return (
              <div
                key={s.n}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  textAlign: 'center',
                  width: '33%',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    margin: '0 auto 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background:
                      completed || active ? 'var(--gold-glow)' : 'var(--navy-card2)',
                    color: completed || active ? 'var(--gold)' : 'var(--text3)',
                    border:
                      active ? '2px solid var(--gold)' : '0.5px solid var(--navy-b)',
                  }}
                >
                  {completed ? '✓' : s.n}
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color:
                      active || completed ? 'var(--gold)' : 'var(--text3)',
                    letterSpacing: '0.04em',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {s.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy)' }}>
        <Sidebar activePage="kyc" user={user} />
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
          Loading…
        </main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', background: 'var(--navy)', minHeight: '100vh' }}>
      <Sidebar activePage="kyc" user={user} />

      <main style={{ flex: 1, padding: '28px 40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.8rem',
              color: 'var(--text1)',
              marginBottom: '4px',
              fontWeight: 500,
            }}
          >
            Identity Verification
          </h1>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text3)',
              letterSpacing: '0.5px',
            }}
          >
            Complete KYC to unlock trading limits and comply with AML regulations
          </p>
        </div>

        {isVerified ? (
          <div
            style={{
              background: 'var(--navy-card)',
              border: '0.5px solid var(--navy-b)',
              borderRadius: '12px',
              padding: '36px',
              maxWidth: '720px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(29,158,117,0.15)',
                  border: '2px solid var(--emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '2.2rem',
                  color: 'var(--emerald)',
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.5rem',
                  color: 'var(--text1)',
                  marginBottom: '8px',
                }}
              >
                Verification Complete
              </h2>
              <p style={{ color: 'var(--emerald)', fontSize: '0.9rem', fontWeight: 500 }}>
                Your account is verified at Level {kycLevel}
              </p>
            </div>

            <div
              style={{
                borderTop: '0.5px solid var(--navy-b)',
                paddingTop: '20px',
                marginBottom: '24px',
                fontSize: '0.88rem',
                color: 'var(--text2)',
                lineHeight: 1.7,
              }}
            >
              <div>
                <span style={{ color: 'var(--text3)' }}>Name:</span>{' '}
                {kycData?.fullName || form.fullName}
              </div>
              <div>
                <span style={{ color: 'var(--text3)' }}>Country:</span>{' '}
                {kycData?.country || form.country}
              </div>
              <div>
                <span style={{ color: 'var(--text3)' }}>Phone:</span>{' '}
                {kycData?.phone || form.phone}
              </div>
            </div>

            <div style={{ fontSize: '0.62rem', color: 'var(--text3)', letterSpacing: '1.2px', marginBottom: '12px' }}>
              VERIFICATION LEVELS
            </div>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8rem',
              }}
            >
              <tbody>
                {[
                  { lv: 0, desc: 'View only' },
                  { lv: 1, desc: 'Trade up to $10,000/day' },
                  {
                    lv: 2,
                    desc: 'Unlimited trading (requires additional docs)',
                  },
                ].map((row) => (
                  <tr
                    key={row.lv}
                    style={{
                      borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <td
                      style={{
                        padding: '12px 10px 12px 0',
                        color:
                          row.lv === kycLevel ? 'var(--gold)' : 'var(--text1)',
                        fontWeight: row.lv === kycLevel ? 600 : 500,
                        width: '100px',
                        verticalAlign: 'top',
                      }}
                    >
                      Level {row.lv}
                    </td>
                    <td
                      style={{
                        padding: '12px 0',
                        color: 'var(--text2)',
                        verticalAlign: 'top',
                      }}
                    >
                      {row.desc}
                      {row.lv === kycLevel ? (
                        <span style={{ color: 'var(--gold)', marginLeft: '6px' }}>
                          ← current
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : success && !isVerified ? (
          <div
            style={{
              background: 'var(--navy-card)',
              border: '0.5px solid var(--gold-dim)',
              borderRadius: '12px',
              padding: '36px',
              maxWidth: '560px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✓</div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: 'var(--text1)',
                marginBottom: '10px',
              }}
            >
              Application submitted
            </h2>
            <p style={{ color: 'var(--text3)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Thank you. Your verification is under review. We will notify you when your status
              updates.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--navy-card)',
              border: '0.5px solid var(--navy-b)',
              borderRadius: '12px',
              padding: '28px 32px',
              maxWidth: '560px',
            }}
          >
            {renderProgress()}

            {error ? (
              <div
                style={{
                  background: 'var(--red-bg)',
                  border: '0.5px solid var(--red-b)',
                  color: 'var(--red)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            ) : null}

            {step === 1 ? (
              <>
                <label style={labelStyle}>Full name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  style={inputStyle}
                  placeholder="Legal name as on ID"
                />
                <label style={labelStyle}>Date of birth</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setField('dateOfBirth', e.target.value)}
                  style={inputStyle}
                />
                <label style={labelStyle}>Country</label>
                <select
                  value={form.country}
                  onChange={(e) => setField('country', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <label style={labelStyle}>Phone number</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'var(--navy-card2)',
                      border: '0.5px solid var(--navy-b)',
                      borderRadius: '6px',
                      color: 'var(--gold)',
                      fontSize: '0.85rem',
                      fontFamily: "'DM Mono', monospace",
                      flexShrink: 0,
                    }}
                  >
                    {form.country ? phonePrefix(form.country) : '—'}
                  </div>
                  <input
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                    placeholder="Mobile number"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setStep(2)
                  }}
                  style={{
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
                    marginTop: '8px',
                  }}
                >
                  Next
                </button>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <label style={labelStyle}>Document type</label>
                <select
                  value={form.documentType}
                  onChange={(e) => setField('documentType', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {DOC_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <label style={labelStyle}>Document number</label>
                <input
                  value={form.documentNumber}
                  onChange={(e) => setField('documentNumber', e.target.value)}
                  style={inputStyle}
                  placeholder="ID or passport number"
                />
                <label style={labelStyle}>Residential address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setField('address', e.target.value)}
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '100px',
                    marginBottom: '16px',
                  }}
                  placeholder="Street, city, postal code"
                />
                <div
                  style={{
                    background: 'rgba(201,166,70,0.08)',
                    border: '0.5px solid var(--gold-dim)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '0.75rem',
                    color: 'var(--text3)',
                    lineHeight: 1.5,
                    marginBottom: '20px',
                  }}
                >
                  Your documents are transmitted over encrypted channels and stored securely. We
                  only use this information for regulatory KYC/AML compliance.
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setStep(1)
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'transparent',
                      border: '0.5px solid var(--navy-b)',
                      color: 'var(--text2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) setStep(3)
                    }}
                    style={{
                      flex: 2,
                      padding: '12px',
                      background: 'var(--gold)',
                      color: 'var(--navy)',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div
                  style={{
                    background: 'var(--navy)',
                    border: '0.5px solid var(--navy-b)',
                    borderRadius: '8px',
                    padding: '18px',
                    marginBottom: '20px',
                    fontSize: '0.82rem',
                    color: 'var(--text2)',
                    lineHeight: 1.65,
                  }}
                >
                  <div style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: '12px' }}>
                    Summary
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text3)' }}>Name:</strong> {form.fullName}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text3)' }}>DOB:</strong> {form.dateOfBirth}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text3)' }}>Country:</strong> {form.country}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text3)' }}>Phone:</strong>{' '}
                    {form.country ? phonePrefix(form.country) : ''} {form.phone}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text3)' }}>Document:</strong>{' '}
                    {DOC_TYPES.find((d) => d.value === form.documentType)?.label} —{' '}
                    {form.documentNumber}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text3)' }}>Address:</strong> {form.address}
                  </div>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    cursor: 'pointer',
                    marginBottom: '14px',
                    fontSize: '0.82rem',
                    color: 'var(--text1)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <span>I confirm all information is accurate</span>
                </label>

                <p
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text3)',
                    lineHeight: 1.55,
                    marginBottom: '20px',
                  }}
                >
                  By submitting, you agree that AURUMEX may process your data under applicable
                  KYC/AML laws. False information may result in account restrictions.
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setStep(2)
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'transparent',
                      border: '0.5px solid var(--navy-b)',
                      color: 'var(--text2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      flex: 2,
                      padding: '12px',
                      background: submitting ? 'var(--text3)' : 'var(--gold)',
                      color: 'var(--navy)',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 500,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      opacity: submitting ? 0.85 : 1,
                    }}
                  >
                    {submitting ? 'Submitting…' : 'Submit Verification'}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}
