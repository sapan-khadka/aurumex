import { useState, useEffect } from 'react'
import { earnAPI } from '../services/api'
import Sidebar from '../components/layout/Sidebar.jsx'

function listFromAxiosData(res, key) {
  const raw = res?.data?.data ?? res?.data
  if (raw == null) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object' && Array.isArray(raw[key])) return raw[key]
  return []
}

export default function Earn() {
  const [products, setProducts] = useState([])
  const [positions, setPositions] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [amount, setAmount] = useState('')
  const [subscribeError, setSubscribeError] = useState('')
  const [subscribeSuccess, setSubscribeSuccess] = useState('')
  const [filter, setFilter] = useState('all')

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchAll = async () => {
      // Products - most important, fetch independently
      try {
        const productsRes = await earnAPI.getProducts()
        setProducts(productsRes.data.data.products || [])
      } catch (err) {
        console.error('Products fetch failed:', err)
      }

      // Positions - may fail, don't let it break products
      try {
        const positionsRes = await earnAPI.getPositions()
        setPositions(positionsRes.data.data.positions || [])
      } catch (err) {
        console.error('Positions fetch failed:', err)
        setPositions([])
      }

      // Summary - may fail
      try {
        const summaryRes = await earnAPI.getSummary()
        setSummary(summaryRes.data.data || {})
      } catch (err) {
        console.error('Summary fetch failed:', err)
        setSummary({})
      }

      setLoading(false)
    }
    fetchAll()
  }, [])

  useEffect(() => {
    if (!subscribeSuccess) return
    const t = setTimeout(() => setSubscribeSuccess(''), 4000)
    return () => clearTimeout(t)
  }, [subscribeSuccess])

  const handleSubscribe = async () => {
    if (!selectedProduct) return
    setSubscribeError('')
    setSubscribeSuccess('')
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      setSubscribeError('Enter a valid amount')
      return
    }
    const minDep = Number(selectedProduct.minDeposit ?? selectedProduct.min_deposit ?? 0)
    if (minDep > 0 && amt < minDep) {
      setSubscribeError(
        `Minimum deposit is ${minDep} ${selectedProduct.asset}`,
      )
      return
    }
    try {
      await earnAPI.deposit({
        productId: selectedProduct.id,
        amount: amt,
      })
      setSubscribeSuccess('Subscribed successfully!')
      setAmount('')
      setSelectedProduct(null)
      const [positionsRes, summaryRes] = await Promise.all([
        earnAPI.getPositions(),
        earnAPI.getSummary(),
      ])
      setPositions(listFromAxiosData(positionsRes, 'positions'))
      setSummary(summaryRes.data?.data ?? summaryRes.data ?? {})
    } catch (err) {
      setSubscribeError(err.response?.data?.message || 'Subscription failed')
    }
  }

  const filteredProducts = products.filter((p) => {
    if (filter === 'all') return true
    return p.category === filter
  })

  const openModal = (product) => {
    setSubscribeError('')
    setSubscribeSuccess('')
    setSelectedProduct(product)
  }

  const closeModal = () => {
    setSelectedProduct(null)
    setSubscribeError('')
  }

  return (
    <div style={{ display: 'flex', background: 'var(--navy)', minHeight: '100vh' }}>
      <Sidebar activePage="earn" user={user} />

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
            Earn
          </h1>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text3)',
              letterSpacing: '0.5px',
            }}
          >
            Generate passive yield on your digital assets and gold
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: 'var(--navy-card)',
              border: '0.5px solid var(--navy-b)',
              borderRadius: '8px',
              padding: '18px 20px',
            }}
          >
            <div
              style={{
                fontSize: '0.62rem',
                color: 'var(--text3)',
                letterSpacing: '1.5px',
                marginBottom: '8px',
              }}
            >
              TOTAL LOCKED
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--gold)',
                fontWeight: 500,
              }}
            >
              $
              {Number(
                summary.totalLocked ?? summary.total_locked ?? 0,
              ).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div
            style={{
              background: 'var(--navy-card)',
              border: '0.5px solid var(--navy-b)',
              borderRadius: '8px',
              padding: '18px 20px',
            }}
          >
            <div
              style={{
                fontSize: '0.62rem',
                color: 'var(--text3)',
                letterSpacing: '1.5px',
                marginBottom: '8px',
              }}
            >
              TOTAL EARNED
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--emerald)',
                fontWeight: 500,
              }}
            >
              $
              {Number(
                summary.totalEarned ?? summary.total_earned ?? 0,
              ).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div
            style={{
              background: 'var(--navy-card)',
              border: '0.5px solid var(--navy-b)',
              borderRadius: '8px',
              padding: '18px 20px',
            }}
          >
            <div
              style={{
                fontSize: '0.62rem',
                color: 'var(--text3)',
                letterSpacing: '1.5px',
                marginBottom: '8px',
              }}
            >
              ACTIVE POSITIONS
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--text1)',
                fontWeight: 500,
              }}
            >
              {summary.activePositions != null ||
              summary.active_positions != null
                ? Number(
                    summary.activePositions ?? summary.active_positions,
                  )
                : positions.filter((p) => p.status === 'active').length}
            </div>
          </div>
          <div
            style={{
              background: 'var(--navy-card)',
              border: '0.5px solid var(--navy-b)',
              borderRadius: '8px',
              padding: '18px 20px',
            }}
          >
            <div
              style={{
                fontSize: '0.62rem',
                color: 'var(--text3)',
                letterSpacing: '1.5px',
                marginBottom: '8px',
              }}
            >
              AVG APY
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--emerald)',
                fontWeight: 500,
              }}
            >
              {Number(summary.averageAPY ?? summary.average_apy ?? 0).toFixed(2)}%
            </div>
          </div>
        </div>

        {positions.length > 0 ? (
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text3)',
                letterSpacing: '2px',
                marginBottom: '12px',
              }}
            >
              MY POSITIONS
            </div>
            <div
              style={{
                background: 'var(--navy-card)',
                border: '0.5px solid var(--navy-b)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
                  padding: '14px 20px',
                  borderBottom: '0.5px solid var(--navy-b)',
                  fontSize: '0.62rem',
                  color: 'var(--text3)',
                  letterSpacing: '1.5px',
                  minWidth: '720px',
                }}
              >
                <div>PRODUCT</div>
                <div style={{ textAlign: 'right' }}>STAKED</div>
                <div style={{ textAlign: 'right' }}>EARNINGS</div>
                <div style={{ textAlign: 'right' }}>APY</div>
                <div style={{ textAlign: 'right' }}>STATUS</div>
                <div style={{ textAlign: 'right' }}>ACTION</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                {positions.map((pos, i) => (
                  <div
                    key={pos.id ?? `pos-${i}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
                      padding: '14px 20px',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                      borderBottom:
                        i < positions.length - 1
                          ? '0.5px solid rgba(255,255,255,0.04)'
                          : 'none',
                      minWidth: '720px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--text1)',
                          fontWeight: 500,
                        }}
                      >
                        {pos.product?.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>
                        {pos.product?.asset} · {pos.product?.lockupDays ?? pos.product?.lockup_days ?? 0}d lockup
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: 'right',
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {Number(pos.amount).toFixed(4)} {pos.product?.asset}
                    </div>
                    <div
                      style={{
                        textAlign: 'right',
                        fontFamily: "'DM Mono', monospace",
                        color: 'var(--emerald)',
                      }}
                    >
                      +
                      {Number(
                        pos.currentEarnings ?? pos.current_earnings ?? 0,
                      ).toFixed(6)}{' '}
                      {pos.product?.asset}
                    </div>
                    <div style={{ textAlign: 'right', color: 'var(--emerald)' }}>
                      {Number(pos.product?.apy ?? 0).toFixed(2)}%
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          textTransform: 'capitalize',
                          background:
                            pos.status === 'active'
                              ? 'rgba(29,158,117,0.12)'
                              : 'rgba(138,143,168,0.12)',
                          color:
                            pos.status === 'active' ? 'var(--emerald)' : 'var(--text3)',
                        }}
                      >
                        {pos.status}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {pos.status === 'active' ? (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await earnAPI.withdraw(pos.id)
                              const [posRes, sumRes] = await Promise.all([
                                earnAPI.getPositions(),
                                earnAPI.getSummary(),
                              ])
                              setPositions(listFromAxiosData(posRes, 'positions'))
                              setSummary(sumRes.data?.data ?? sumRes.data ?? {})
                            } catch (withdrawErr) {
                              console.error(withdrawErr)
                            }
                          }}
                          style={{
                            padding: '5px 12px',
                            background: 'rgba(201,166,70,0.1)',
                            border: '0.5px solid var(--gold-dim)',
                            color: 'var(--gold)',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          Withdraw
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['all', 'commodity', 'crypto', 'stablecoin'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 14px',
                borderRadius: '5px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                border:
                  filter === f
                    ? '0.5px solid var(--gold-dim)'
                    : '0.5px solid var(--navy-b)',
                background:
                  filter === f ? 'rgba(201,166,70,0.08)' : 'var(--navy-card)',
                color: filter === f ? 'var(--gold)' : 'var(--text2)',
                textTransform: 'capitalize',
                fontFamily: 'inherit',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              color: 'var(--text3)',
              fontSize: '0.85rem',
            }}
          >
            Loading earn products...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '14px',
            }}
          >
            {filteredProducts.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--text3)',
                  fontSize: '0.85rem',
                }}
              >
                No products match this filter
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: 'var(--navy-card)',
                    border: '0.5px solid var(--navy-b)',
                    borderRadius: '10px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.62rem',
                          color: 'var(--text3)',
                          letterSpacing: '1.5px',
                          marginBottom: '4px',
                        }}
                      >
                        {product.asset}
                      </div>
                      <div
                        style={{
                          fontSize: '1rem',
                          color: 'var(--text1)',
                          fontWeight: 500,
                          fontFamily: "'Cormorant Garamond', serif",
                        }}
                      >
                        {product.name}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontFamily: "'DM Mono', monospace",
                        color: 'var(--emerald)',
                        fontWeight: 500,
                      }}
                    >
                      {Number(product.apy).toFixed(1)}%
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text3)',
                      lineHeight: 1.5,
                    }}
                  >
                    {product.description || ''}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '0.7rem',
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--text3)', marginBottom: '2px' }}>MIN</div>
                      <div
                        style={{
                          color: 'var(--text1)',
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {product.minDeposit ?? product.min_deposit ?? 0} {product.asset}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text3)', marginBottom: '2px' }}>LOCKUP</div>
                      <div
                        style={{
                          color: 'var(--text1)',
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {(product.lockupDays ?? product.lockup_days ?? 0) === 0
                          ? 'Flexible'
                          : `${product.lockupDays ?? product.lockup_days} days`}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openModal(product)}
                    style={{
                      padding: '10px',
                      background: 'var(--gold)',
                      color: 'var(--navy)',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Subscribe
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {selectedProduct ? (
          <div
            role="presentation"
            onClick={closeModal}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeModal()
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--navy-card)',
                border: '0.5px solid var(--navy-b)',
                borderRadius: '12px',
                padding: '28px',
                width: '400px',
                maxWidth: 'calc(100vw - 32px)',
              }}
            >
              <div
                style={{
                  fontSize: '0.62rem',
                  color: 'var(--text3)',
                  letterSpacing: '1.5px',
                  marginBottom: '4px',
                }}
              >
                SUBSCRIBE
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.3rem',
                  color: 'var(--text1)',
                  marginBottom: '8px',
                }}
              >
                {selectedProduct.name}
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--emerald)',
                  marginBottom: '20px',
                }}
              >
                {Number(selectedProduct.apy).toFixed(2)}% APY ·{' '}
                {(selectedProduct.lockupDays ?? selectedProduct.lockup_days ?? 0) === 0
                  ? 'Flexible'
                  : `${selectedProduct.lockupDays ?? selectedProduct.lockup_days} days`}
              </div>

              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text3)',
                  letterSpacing: '1px',
                  marginBottom: '6px',
                }}
              >
                AMOUNT ({selectedProduct.asset})
              </div>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                placeholder={`Min ${selectedProduct.minDeposit ?? selectedProduct.min_deposit ?? 0}`}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--navy)',
                  border: '0.5px solid var(--navy-b)',
                  borderRadius: '6px',
                  color: 'var(--text1)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: "'DM Mono', monospace",
                  marginBottom: '8px',
                  boxSizing: 'border-box',
                }}
              />

              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text3)',
                  marginBottom: '16px',
                }}
              >
                Estimated earnings:{' '}
                {amount ? (
                  <span style={{ color: 'var(--emerald)' }}>
                    +
                    {(
                      (parseFloat(amount) *
                        Number(selectedProduct.apy) /
                        100 *
                        (selectedProduct.lockupDays ??
                          selectedProduct.lockup_days ??
                          365)) /
                      365
                    ).toFixed(6)}{' '}
                    {selectedProduct.asset}
                  </span>
                ) : (
                  '—'
                )}
              </div>

              {subscribeError ? (
                <div
                  style={{
                    background: 'rgba(226,75,74,0.12)',
                    color: 'var(--red)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    marginBottom: '12px',
                  }}
                >
                  {subscribeError}
                </div>
              ) : null}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'transparent',
                    border: '0.5px solid var(--navy-b)',
                    color: 'var(--text2)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubscribe}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: 'var(--gold)',
                    color: 'var(--navy)',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                  }}
                >
                  Confirm Subscribe
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {subscribeSuccess ? (
          <div
            style={{
              position: 'fixed',
              bottom: 30,
              right: 30,
              background: 'rgba(29,158,117,0.15)',
              border: '0.5px solid var(--emerald)',
              color: 'var(--emerald)',
              padding: '14px 20px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              zIndex: 1100,
            }}
          >
            {subscribeSuccess}
          </div>
        ) : null}
      </main>
    </div>
  )
}
