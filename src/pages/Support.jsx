import { useState, useEffect, useCallback } from 'react'
import { supportAPI } from '../services/api'
import Sidebar from '../components/layout/Sidebar.jsx'

const FAQS = [
  {
    q: 'How do I deposit funds?',
    a: 'Go to Wallet → Deposit, pick the asset, and send to the generated deposit address. Funds appear after network confirmation.',
  },
  {
    q: 'How do I withdraw?',
    a: 'Go to Wallet → Withdraw, enter the destination address and amount. Withdrawals require KYC Level 1.',
  },
  {
    q: 'What is KYC and why is it required?',
    a: 'KYC is identity verification required for AML compliance. Completing it unlocks higher trading and withdrawal limits.',
  },
  {
    q: 'What are the trading fees?',
    a: 'AURUMEX charges a flat 0.1% fee per executed trade, with no hidden spreads.',
  },
  {
    q: 'Which assets can I trade?',
    a: 'Crypto (BTC, ETH, SOL, BNB, DOGE) and tokenized commodities (GOLD, OIL, Silver), all priced against USDT.',
  },
  {
    q: 'How does Earn work?',
    a: 'Subscribe a balance to an Earn product to receive APY. Flexible products have no lockup; fixed products lock funds for a set term.',
  },
  {
    q: 'How long do withdrawals take?',
    a: 'Crypto withdrawals are usually processed within minutes once confirmed on-chain. Larger amounts may need manual review.',
  },
  {
    q: 'Is my account secure?',
    a: 'We use bcrypt-hashed passwords, JWT sessions, and optional two-factor authentication. Enable 2FA in Security for extra protection.',
  },
]

const CATEGORIES = [
  { value: 'General', label: 'General' },
  { value: 'Deposit', label: 'Deposit' },
  { value: 'Withdrawal', label: 'Withdrawal' },
  { value: 'KYC', label: 'KYC' },
  { value: 'Trading', label: 'Trading' },
  { value: 'Account', label: 'Account' },
]

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

function normalizeTicketsPayload(raw) {
  if (!raw) return []
  const d = raw.data ?? raw
  if (Array.isArray(d)) return d
  if (Array.isArray(d.tickets)) return d.tickets
  if (Array.isArray(d.items)) return d.items
  return []
}

function normalizeTicketPayload(raw) {
  const d = raw?.data?.data ?? raw?.data ?? raw ?? {}
  return d && typeof d === 'object' ? d : {}
}

function normalizeMessages(ticket) {
  const msgs = ticket?.messages ?? ticket?.Messages ?? ticket?.conversation ?? []
  if (!Array.isArray(msgs)) return []
  return [...msgs].sort((a, b) => {
    const ta = new Date(a.createdAt ?? a.created_at ?? a.sentAt ?? 0).getTime()
    const tb = new Date(b.createdAt ?? b.created_at ?? b.sentAt ?? 0).getTime()
    return ta - tb
  })
}

function messageBody(m) {
  return (
    m?.message ??
    m?.body ??
    m?.text ??
    m?.content ??
    ''
  )
}

function messageRole(m) {
  const r = String(
    m?.senderRole ?? m?.sender_role ?? m?.role ?? m?.sender ?? '',
  ).toLowerCase()
  if (r === 'support' || r === 'agent' || r === 'admin' || r === 'staff')
    return 'support'
  return 'user'
}

function messageTime(m) {
  const d = m?.createdAt ?? m?.created_at ?? m?.sentAt ?? m?.updatedAt
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function ticketUpdated(t) {
  const d = t?.updatedAt ?? t?.updated_at ?? t?.lastMessageAt ?? t?.createdAt
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function statusBadgeStyle(status) {
  const s = String(status || 'open').toLowerCase()
  if (s === 'answered' || s === 'resolved')
    return {
      background: 'rgba(29,158,117,0.12)',
      color: 'var(--emerald)',
      border: '0.5px solid rgba(29,158,117,0.35)',
    }
  if (s === 'closed')
    return {
      background: 'rgba(138,143,168,0.08)',
      color: 'var(--text3)',
      border: '0.5px solid var(--navy-b)',
    }
  return {
    background: 'rgba(138,143,168,0.12)',
    color: 'var(--text2)',
    border: '0.5px solid var(--navy-b)',
  }
}

export default function Support() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [faqOpen, setFaqOpen] = useState(null)
  const [tickets, setTickets] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [selectedId, setSelectedId] = useState(null)
  const [ticketThread, setTicketThread] = useState(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('General')
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  const [replyDraft, setReplyDraft] = useState('')
  const [replyError, setReplyError] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)

  const loadTickets = useCallback(async () => {
    setListError('')
    setListLoading(true)
    try {
      const res = await supportAPI.getMyTickets()
      setTickets(normalizeTicketsPayload(res.data))
    } catch (err) {
      setListError(err.response?.data?.message || 'Could not load tickets.')
      setTickets([])
    } finally {
      setListLoading(false)
    }
  }, [])

  const loadThread = useCallback(async (id) => {
    if (id == null) return
    setThreadError('')
    setThreadLoading(true)
    setTicketThread(null)
    try {
      const res = await supportAPI.getTicket(id)
      setTicketThread(normalizeTicketPayload(res.data))
    } catch (err) {
      setThreadError(err.response?.data?.message || 'Could not load this ticket.')
      setTicketThread(null)
    } finally {
      setThreadLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  useEffect(() => {
    if (selectedId != null) loadThread(selectedId)
  }, [selectedId, loadThread])

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!subject.trim()) {
      setFormError('Please enter a subject.')
      return
    }
    if (!message.trim()) {
      setFormError('Please enter a message.')
      return
    }
    setSubmitLoading(true)
    try {
      await supportAPI.createTicket({
        subject: subject.trim(),
        category,
        message: message.trim(),
      })
      setSubject('')
      setCategory('General')
      setMessage('')
      setShowForm(false)
      await loadTickets()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not create ticket.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (selectedId == null) return
    setReplyError('')
    const text = replyDraft.trim()
    if (!text) {
      setReplyError('Enter a message to send.')
      return
    }
    setReplyLoading(true)
    try {
      await supportAPI.addMessage(selectedId, text)
      setReplyDraft('')
      await loadThread(selectedId)
      await loadTickets()
    } catch (err) {
      setReplyError(err.response?.data?.message || 'Could not send message.')
    } finally {
      setReplyLoading(false)
    }
  }

  const threadMsgs = ticketThread ? normalizeMessages(ticketThread) : []
  const threadSubject =
    ticketThread?.subject ?? ticketThread?.title ?? 'Support ticket'

  return (
    <div style={{ display: 'flex', background: 'var(--navy)', minHeight: '100vh' }}>
      <Sidebar activePage="support" user={user} />

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
            Support
          </h1>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text3)',
              letterSpacing: '0.5px',
            }}
          >
            FAQs and help — we usually reply within a few hours
          </p>
        </div>

        <div style={{ maxWidth: '720px' }}>
          {/* Section A — FAQ */}
          <div style={cardBase}>
            <div style={{ ...labelUpper, marginBottom: '14px' }}>
              Frequently asked questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {FAQS.map((item, idx) => {
                const open = faqOpen === idx
                return (
                  <div
                    key={item.q}
                    style={{
                      borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setFaqOpen(open ? null : idx)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '14px 4px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--text1)',
                        fontFamily: 'inherit',
                        fontSize: '0.88rem',
                        fontWeight: 500,
                      }}
                    >
                      <span>{item.q}</span>
                      <span
                        style={{
                          color: 'var(--gold)',
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                      >
                        {open ? '−' : '+'}
                      </span>
                    </button>
                    {open ? (
                      <div
                        style={{
                          padding: '0 4px 14px',
                          fontSize: '0.82rem',
                          color: 'var(--text2)',
                          lineHeight: 1.55,
                        }}
                      >
                        {item.a}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section B / C — Tickets or thread */}
          <div style={{ ...cardBase, marginBottom: 0 }}>
            {selectedId == null ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ ...labelUpper, marginBottom: 0 }}>
                    My support tickets
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm((v) => !v)
                      setFormError('')
                    }}
                    style={{
                      padding: '10px 18px',
                      background: 'var(--gold)',
                      color: 'var(--navy)',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {showForm ? 'Cancel' : 'New Ticket'}
                  </button>
                </div>

                {showForm ? (
                  <form
                    onSubmit={handleCreateTicket}
                    style={{
                      marginBottom: '20px',
                      padding: '16px',
                      background: 'var(--navy)',
                      border: '0.5px solid var(--navy-b)',
                      borderRadius: '8px',
                    }}
                  >
                    <label style={{ ...labelUpper, marginBottom: '6px' }}>
                      Subject
                    </label>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      style={{ ...inputStyle, marginBottom: '12px' }}
                      placeholder="Brief summary"
                    />
                    <label style={{ ...labelUpper, marginBottom: '6px' }}>
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ ...inputStyle, marginBottom: '12px', cursor: 'pointer' }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <label style={{ ...labelUpper, marginBottom: '6px' }}>
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      style={{
                        ...inputStyle,
                        marginBottom: '12px',
                        resize: 'vertical',
                        minHeight: '100px',
                      }}
                      placeholder="Describe your issue"
                    />
                    {formError ? (
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
                        {formError}
                      </div>
                    ) : null}
                    <button
                      type="submit"
                      disabled={submitLoading}
                      style={{
                        padding: '12px 22px',
                        background: submitLoading ? 'var(--text3)' : 'var(--gold)',
                        color: 'var(--navy)',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: submitLoading ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {submitLoading ? 'Submitting…' : 'Submit ticket'}
                    </button>
                  </form>
                ) : null}

                {listError ? (
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
                    {listError}
                  </div>
                ) : null}

                {listLoading ? (
                  <div
                    style={{
                      padding: '24px 8px',
                      textAlign: 'center',
                      color: 'var(--text3)',
                      fontSize: '0.85rem',
                    }}
                  >
                    Loading tickets…
                  </div>
                ) : tickets.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 8px',
                      textAlign: 'center',
                      color: 'var(--text3)',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                    }}
                  >
                    No tickets yet — open one above if you need help
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {tickets.map((t) => {
                      const id = t.id ?? t._id ?? t.uuid
                      const stat = t.status ?? t.state ?? 'open'
                      const badges = statusBadgeStyle(stat)
                      return (
                        <button
                          key={String(id)}
                          type="button"
                          onClick={() => setSelectedId(id)}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '14px 10px',
                            margin: '0 -6px',
                            borderRadius: '8px',
                            border: 'none',
                            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '10px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.88rem',
                                fontWeight: 600,
                                color: 'var(--text1)',
                              }}
                            >
                              {t.subject ?? t.title ?? 'Ticket'}
                            </div>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: '999px',
                                textTransform: 'capitalize',
                                ...badges,
                              }}
                            >
                              {stat}
                            </span>
                          </div>
                          <div
                            style={{
                              marginTop: '6px',
                              fontSize: '0.74rem',
                              color: 'var(--text3)',
                            }}
                          >
                            {t.category ?? 'General'} · {ticketUpdated(t)}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null)
                    setTicketThread(null)
                    setReplyDraft('')
                    setReplyError('')
                    setThreadError('')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    marginBottom: '16px',
                    color: 'var(--gold)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ← Back to tickets
                </button>

                {threadLoading ? (
                  <div style={{ color: 'var(--text3)', padding: '20px 0' }}>
                    Loading conversation…
                  </div>
                ) : threadError ? (
                  <div
                    style={{
                      background: 'var(--red-bg)',
                      border: '0.5px solid var(--red-b)',
                      color: 'var(--red)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                    }}
                  >
                    {threadError}
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        ...labelUpper,
                        marginBottom: '8px',
                        fontSize: '11px',
                        color: 'var(--text2)',
                      }}
                    >
                      Thread
                    </div>
                    <h2
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1.35rem',
                        color: 'var(--text1)',
                        fontWeight: 500,
                        margin: '0 0 18px',
                      }}
                    >
                      {threadSubject}
                    </h2>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        marginBottom: '20px',
                        maxHeight: '420px',
                        overflowY: 'auto',
                        paddingRight: '4px',
                      }}
                    >
                      {threadMsgs.length === 0 ? (
                        <div style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>
                          No messages yet.
                        </div>
                      ) : (
                        threadMsgs.map((m, i) => {
                          const role = messageRole(m)
                          const isUser = role === 'user'
                          const body = messageBody(m)
                          const ts = messageTime(m)
                          return (
                            <div
                              key={m.id ?? m._id ?? i}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isUser ? 'flex-end' : 'flex-start',
                              }}
                            >
                              {!isUser ? (
                                <div
                                  style={{
                                    fontSize: '0.68rem',
                                    color: 'var(--gold)',
                                    marginBottom: '4px',
                                    fontWeight: 600,
                                  }}
                                >
                                  AURUMEX Support
                                </div>
                              ) : (
                                <div
                                  style={{
                                    fontSize: '0.68rem',
                                    color: 'var(--text3)',
                                    marginBottom: '4px',
                                  }}
                                >
                                  You
                                </div>
                              )}
                              <div
                                style={{
                                  maxWidth: '88%',
                                  padding: '12px 14px',
                                  borderRadius: '10px',
                                  fontSize: '0.85rem',
                                  lineHeight: 1.5,
                                  color: 'var(--text1)',
                                  background: isUser
                                    ? 'var(--navy)'
                                    : 'rgba(201,166,70,0.12)',
                                  border: isUser
                                    ? '0.5px solid var(--navy-b)'
                                    : '0.5px solid var(--gold-dim)',
                                  textAlign: 'left',
                                }}
                              >
                                {body}
                              </div>
                              {ts ? (
                                <div
                                  style={{
                                    fontSize: '0.66rem',
                                    color: 'var(--text3)',
                                    marginTop: '4px',
                                  }}
                                >
                                  {ts}
                                </div>
                              ) : null}
                            </div>
                          )
                        })
                      )}
                    </div>

                    <form onSubmit={handleSendReply}>
                      <label style={{ ...labelUpper, marginBottom: '6px' }}>
                        Reply
                      </label>
                      <textarea
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        rows={3}
                        style={{
                          ...inputStyle,
                          marginBottom: '10px',
                          resize: 'vertical',
                          minHeight: '80px',
                        }}
                        placeholder="Type your reply…"
                      />
                      {replyError ? (
                        <div
                          style={{
                            background: 'var(--red-bg)',
                            border: '0.5px solid var(--red-b)',
                            color: 'var(--red)',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            marginBottom: '10px',
                          }}
                        >
                          {replyError}
                        </div>
                      ) : null}
                      <button
                        type="submit"
                        disabled={replyLoading}
                        style={{
                          padding: '11px 20px',
                          background: replyLoading ? 'var(--text3)' : 'var(--gold)',
                          color: 'var(--navy)',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          cursor: replyLoading ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {replyLoading ? 'Sending…' : 'Send'}
                      </button>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
