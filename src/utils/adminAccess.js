/** Frontend-only gate; server must enforce admin access on API routes. */
export function getExpectedAdminEmail() {
  return (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase()
}

export function userIsAdmin(userLike) {
  const expected = getExpectedAdminEmail()
  if (!expected) return false
  const email =
    (typeof userLike === 'string'
      ? userLike
      : userLike?.email || ''
    ).trim().toLowerCase()
  return Boolean(email && email === expected)
}
