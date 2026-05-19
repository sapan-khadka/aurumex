import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import PageTopbar from '../components/layout/PageTopbar.jsx'

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
}

function ToggleRow({ label, description, on, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '14px 0',
        borderTop: '0.5px solid var(--navy-b2)',
      }}
    >
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text1)', fontSize: '13px' }}>
          {label}
        </div>
        {description ? (
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>
            {description}
          </div>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
          background: on ? 'var(--emerald)' : 'var(--navy-card2)',
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
            marginLeft: on ? '20px' : '0',
            transition: 'margin-left 0.15s ease',
          }}
        />
      </button>
    </div>
  )
}

export default function KYC() {
  const [twoFA, setTwoFA] = useState(true)
  const [loginNotes, setLoginNotes] = useState(true)
  const [whitelist, setWhitelist] = useState(false)

  const topRight = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '4px',
            background: 'var(--em-bg)',
            color: 'var(--emerald)',
            letterSpacing: '0.06em',
          }}
        >
          L1 VERIFIED
        </span>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '4px',
            background: 'var(--gold-glow)',
            color: 'var(--gold)',
            letterSpacing: '0.06em',
          }}
        >
          L2 PENDING
        </span>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '4px',
            background: 'var(--navy-card2)',
            color: 'var(--text3)',
            letterSpacing: '0.06em',
          }}
        >
          L3 LOCKED
        </span>
      </div>
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
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activePage="kyc" />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: 'var(--navy)',
        }}
      >
        <PageTopbar title="Profile & KYC Verification" right={topRight} />
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
              gridTemplateColumns: '1fr 1.4fr',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ ...card, padding: '1.25rem' }}>
                <div style={labelUpper}>Profile</div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'var(--gold)',
                      color: 'var(--navy)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '18px',
                    }}
                  >
                    TB
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text1)' }}>
                      Thomas B.
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>
                      thomas.b@email.com
                    </div>
                  </div>
                </div>
                {[
                  { id: 'legal', label: 'Legal name', ph: 'Thomas Brendan' },
                  { id: 'dob', label: 'Date of birth', ph: '1988-04-12' },
                  { id: 'country', label: 'Country', ph: 'United States' },
                ].map((f) => (
                  <div key={f.id} style={{ marginTop: '14px' }}>
                    <div
                      style={{
                        ...labelUpper,
                        marginBottom: '6px',
                        fontSize: '9px',
                      }}
                    >
                      {f.label}
                    </div>
                    <input
                      defaultValue={f.ph}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '0.5px solid var(--navy-b2)',
                        background: 'var(--navy-card2)',
                        color: 'var(--text1)',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--blue)',
                    color: 'var(--navy)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Save profile
                </button>
              </div>

              <div style={{ ...card, padding: '1.25rem' }}>
                <div style={labelUpper}>Security</div>
                <div style={{ marginTop: '4px' }}>
                  <ToggleRow
                    label="Two-factor authentication"
                    description="Required for withdrawals above $10,000"
                    on={twoFA}
                    onChange={setTwoFA}
                  />
                </div>
                <div style={{ padding: '14px 0', borderTop: '0.5px solid var(--navy-b2)' }}>
                  <div style={{ ...labelUpper, marginBottom: '8px', fontSize: '9px' }}>
                    Anti-phishing code
                  </div>
                  <input
                    defaultValue="AURUM-8821"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '0.5px solid var(--navy-b2)',
                      background: 'var(--navy-card2)',
                      color: 'var(--text1)',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <ToggleRow
                  label="Login notifications"
                  description="Email alert on each new device sign-in"
                  on={loginNotes}
                  onChange={setLoginNotes}
                />
                <ToggleRow
                  label="Withdrawal whitelist"
                  description="Only send crypto to saved addresses"
                  on={whitelist}
                  onChange={setWhitelist}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ ...card, padding: '1.25rem' }}>
                <div style={labelUpper}>Verification status</div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {[
                    {
                      t: 'Level 1',
                      s: 'Complete',
                      dot: 'var(--emerald)',
                      bg: 'var(--em-bg)',
                    },
                    {
                      t: 'Level 2',
                      s: 'In review',
                      dot: 'var(--gold)',
                      bg: 'var(--gold-glow)',
                    },
                    {
                      t: 'Level 3',
                      s: 'Locked',
                      dot: 'var(--text3)',
                      bg: 'var(--navy-card2)',
                    },
                  ].map((lv) => (
                    <div
                      key={lv.t}
                      style={{
                        flex: '1 1 140px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: lv.bg,
                        border: '0.5px solid var(--navy-b2)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: lv.dot,
                          }}
                        />
                        <span style={{ fontWeight: 700, color: 'var(--text1)' }}>
                          {lv.t}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '6px' }}>
                        {lv.s}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...card, padding: '1.25rem' }}>
                <div style={labelUpper}>KYC checklist</div>
                {[
                  { label: 'Email verified', status: 'done' },
                  { label: 'Government ID', status: 'done' },
                  { label: 'Face check', status: 'done' },
                  { label: 'Proof of Address', status: 'review' },
                  { label: 'Enhanced due diligence', status: 'locked' },
                ].map((step, i) => (
                  <div
                    key={step.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderTop: i === 0 ? 'none' : '0.5px solid var(--navy-b2)',
                    }}
                  >
                    <span style={{ color: 'var(--text1)', fontSize: '13px' }}>
                      {step.label}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color:
                          step.status === 'done'
                            ? 'var(--emerald)'
                            : step.status === 'review'
                              ? 'var(--amber)'
                              : 'var(--text3)',
                      }}
                    >
                      {step.status === 'done'
                        ? '✓'
                        : step.status === 'review'
                          ? 'In review'
                          : 'Locked'}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ ...card, padding: '1.25rem' }}>
                <div style={labelUpper}>Proof of address</div>
                <div
                  style={{
                    marginTop: '12px',
                    padding: '2rem',
                    borderRadius: '10px',
                    border: '1px dashed var(--navy-b)',
                    background: 'var(--navy-card2)',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <i
                    className="ti ti-cloud-upload"
                    style={{ fontSize: '28px', color: 'var(--gold)' }}
                  />
                  <div
                    style={{
                      marginTop: '10px',
                      color: 'var(--text1)',
                      fontWeight: 600,
                      fontSize: '13px',
                    }}
                  >
                    Drop a utility bill or bank statement
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text3)' }}>
                    PDF, JPG or PNG — max 10 MB
                  </div>
                </div>
              </div>

              <div style={{ ...card, padding: '1.25rem' }}>
                <div style={labelUpper}>Active sessions</div>
                {[
                  {
                    device: 'Chrome · macOS',
                    loc: 'San Francisco, US',
                    cur: true,
                  },
                  { device: 'Safari · iPhone', loc: 'San Francisco, US', cur: false },
                  { device: 'Firefox · Windows', loc: 'New York, US', cur: false },
                ].map((s, i) => (
                  <div
                    key={s.device}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '12px 0',
                      borderTop: i === 0 ? 'none' : '0.5px solid var(--navy-b2)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text1)', fontSize: '13px' }}>
                        {s.device}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                        {s.loc}
                        {s.cur ? (
                          <span style={{ color: 'var(--emerald)', marginLeft: '8px' }}>
                            · This device
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={s.cur}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '0.5px solid var(--red)',
                        background: 'transparent',
                        color: s.cur ? 'var(--text3)' : 'var(--red)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: s.cur ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Revoke
                    </button>
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
