import { useEffect, useState } from "react"

const API_URL = import.meta.env.VITE_API_URL

export default function Feedback() {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => { document.title = "Leave Feedback | HotPDF" }, [])

  function update(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSending(true)
    setError("")
    setSuccess("")
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.detail || `Request failed (${response.status})`)
      setSuccess(result.message || "Thank you for your feedback.")
      setForm({ name: "", email: "", message: "", website: "" })
    } catch (err) {
      setError(err.message || "Could not send your message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="page" style={{ width: "min(100% - 32px, 720px)", margin: "48px auto 80px" }}>
      <h1>Leave a message for the HotPDF author</h1>
      <p>Your feedback is sent to HotPDF and stored in its protected website backend. Please do not include passwords or other sensitive information.</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 16, padding: 24, border: "1px solid #dfe3ea", borderRadius: 14, background: "#fff" }}>
        <label style={{ display: "grid", gap: 6 }}>Name *
          <input name="name" value={form.name} onChange={update} required maxLength={80} autoComplete="name" style={fieldStyle} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>Email (optional)
          <input name="email" type="email" value={form.email} onChange={update} maxLength={254} autoComplete="email" style={fieldStyle} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>Message *
          <textarea name="message" value={form.message} onChange={update} required minLength={5} maxLength={5000} rows={7} style={{ ...fieldStyle, resize: "vertical" }} />
          <small>{form.message.length}/5000 characters</small>
        </label>
        <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
          <label>Leave this field empty<input name="website" value={form.website} onChange={update} tabIndex={-1} autoComplete="off" /></label>
        </div>
        {error && <p role="alert" style={{ color: "#b91c1c", margin: 0 }}>{error}</p>}
        {success && <p role="status" style={{ color: "#166534", margin: 0 }}>{success}</p>}
        <button className="primary-btn" type="submit" disabled={sending}>{sending ? "Sending…" : "Send message"}</button>
      </form>
    </main>
  )
}

const fieldStyle = { width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: 8, padding: "11px 12px", font: "inherit" }
