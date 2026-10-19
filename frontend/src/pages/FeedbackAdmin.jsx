import { useCallback, useEffect, useState } from "react"

const API_URL = import.meta.env.VITE_API_URL

export default function FeedbackAdmin() {
  const [token, setToken] = useState("")
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = "Author Inbox | HotPDF"
    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots) }
    const previous = robots.content
    robots.content = "noindex, nofollow, noarchive"
    return () => { robots.content = previous }
  }, [])

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) }
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.detail || `Request failed (${response.status})`)
    return data
  }, [token])

  async function loadMessages(event) {
    event?.preventDefault()
    setLoading(true); setError("")
    try {
      const data = await request("/author/feedback")
      setItems(data.items || []); setTotal(data.total || 0)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function updateStatus(id, status) {
    try {
      await request(`/author/feedback/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
      setItems(current => current.map(item => item.id === id ? { ...item, status } : item))
    } catch (err) { setError(err.message) }
  }

  async function removeMessage(id) {
    if (!window.confirm("Permanently delete this message?")) return
    try {
      await request(`/author/feedback/${id}`, { method: "DELETE" })
      setItems(current => current.filter(item => item.id !== id)); setTotal(value => Math.max(0, value - 1))
    } catch (err) { setError(err.message) }
  }

  return (
    <main className="page" style={{ width: "min(100% - 32px, 1000px)", margin: "40px auto 80px" }}>
      <h1>HotPDF author inbox</h1>
      <p>This page uses the server-side admin token. The token is kept only in this page's memory and is not saved to browser storage.</p>
      <form onSubmit={loadMessages} style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "20px 0" }}>
        <input type="password" autoComplete="current-password" value={token} onChange={event => setToken(event.target.value)} placeholder="Author access token" required style={{ flex: "1 1 280px", minWidth: 0, padding: 12, border: "1px solid #cbd5e1", borderRadius: 8 }} />
        <button className="primary-btn" type="submit" disabled={loading}>{loading ? "Loading…" : "Unlock inbox"}</button>
      </form>
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {items.length > 0 && <p>{total} message(s) total</p>}
      <div style={{ display: "grid", gap: 14 }}>
        {items.map(item => (
          <article key={item.id} style={{ border: "1px solid #dfe3ea", borderRadius: 12, padding: 18, background: "#fff" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
              <strong>{item.name}</strong><small>{new Date(item.created_at).toLocaleString()}</small>
            </div>
            {item.email && <p style={{ margin: "8px 0" }}>Email: <a href={`mailto:${encodeURIComponent(item.email)}`}>{item.email}</a></p>}
            <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.message}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <label>Status: <select value={item.status} onChange={event => updateStatus(item.id, event.target.value)} style={{ padding: 7, borderRadius: 6 }}>
                <option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option>
              </select></label>
              <button type="button" onClick={() => removeMessage(item.id)} style={{ padding: "7px 10px", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 6, background: "white" }}>Delete</button>
            </div>
          </article>
        ))}
      </div>
      {!items.length && total === 0 && <p>Unlock the inbox to view messages. If it is already unlocked and there are no cards, there may be no messages yet.</p>}
    </main>
  )
}
