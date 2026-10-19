import { useMemo, useState } from "react"
import ToolHeader from "../components/ToolHeader"
import UploadBox from "../components/UploadBox"
import ResultCard from "../components/ResultCard"
import createPDFResult from "../utils/pdfResult"
import useUploadPDF from "../hooks/useUploadPDF"

function EditPDF() {
  const { file, setFile, filename, pages, uploadPDF, loading, progress, error: uploadError } = useUploadPDF()
  const [uploaded, setUploaded] = useState(false)
  const [rotations, setRotations] = useState({})
  const [deletedPages, setDeletedPages] = useState([])
  const [pageOrder, setPageOrder] = useState([])
  const [draggedPage, setDraggedPage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)
  const remainingPages = useMemo(
    () => pageOrder.filter(page => pages.includes(page) && !deletedPages.includes(page)),
    [pageOrder, pages, deletedPages]
  )
  const orderedPages = useMemo(() => {
    const known = pageOrder.filter(page => pages.includes(page))
    const missing = pages.filter(page => !known.includes(page))
    return [...known, ...missing]
  }, [pageOrder, pages])

  function resetForFile(nextFile) {
    setFile(nextFile); setUploaded(false); setRotations({}); setDeletedPages([])
    setPageOrder([]); setDraggedPage(null)
    setBusy(false); setError(""); setResult(null)
  }

  async function handleUpload() {
    setError(""); setResult(null)
    const data = await uploadPDF()
    if (data?.filename) {
      setUploaded(true); setRotations({}); setDeletedPages([])
      setPageOrder(Array.from({ length: Number(data.pages) || 0 }, (_, index) => index + 1))
    }
  }

  function rotatePage(page) {
    setRotations(current => ({ ...current, [page]: ((current[page] || 0) + 90) % 360 }))
    setError(""); setResult(null)
  }

  function toggleDelete(page) {
    setDeletedPages(current => current.includes(page) ? current.filter(item => item !== page) : [...current, page])
    setError(""); setResult(null)
  }

  function movePage(dragged, target) {
    if (dragged == null || dragged === target) return
    setPageOrder(current => {
      const next = [...current]
      const from = next.indexOf(dragged)
      const to = next.indexOf(target)
      if (from < 0 || to < 0) return current
      next.splice(from, 1)
      next.splice(to, 0, dragged)
      return next
    })
    setError(""); setResult(null)
  }

  async function applyEdits() {
    if (!uploaded || !filename) { setError("Please upload a PDF first."); return }
    if (remainingPages.length < 1) { setError("Keep at least one page in the PDF."); return }
    if (Object.values(rotations).every(degrees => degrees === 0) && deletedPages.length === 0) {
      setError("Rotate or delete at least one page before applying changes."); return
    }
    setBusy(true); setError(""); setResult(null)
    try {
      const params = new URLSearchParams({
        filename,
        rotations: JSON.stringify(Object.fromEntries(Object.entries(rotations).filter(([, degrees]) => degrees !== 0))),
        delete_pages: deletedPages.join(","),
        page_order: JSON.stringify(remainingPages)
      })
      const response = await fetch(`${import.meta.env.VITE_API_URL}/edit_pdf?${params}`, { method: "POST" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Could not edit this PDF.")
      if (!data.filename) throw new Error("The edited PDF was not created.")
      setResult({
        info: createPDFResult({ filename: data.filename, pages: data.pages, size: data.size || "" }),
        url: `${import.meta.env.VITE_API_URL}/download/${encodeURIComponent(data.filename)}`
      })
    } catch (err) { setError(err.message || "Could not edit this PDF.") }
    finally { setBusy(false) }
  }

  return (
    <div className="page">
      <ToolHeader icon="📝" title="Edit PDF" description="Rotate pages or remove unwanted pages, then download a new PDF." />
      <UploadBox onUpload={resetForFile} />
      {file && <div style={{ textAlign: "center", margin: "16px 0" }}>
        <button className="primary-btn" onClick={handleUpload} disabled={loading || busy}>
          {loading ? "Uploading..." : uploaded ? "PDF Uploaded" : "Upload PDF"}
        </button>
      </div>}
      {progress > 0 && progress < 100 && <div className="upload-progress">
        <div className="progress-bar"><div className="progress-inner" style={{ width: `${progress}%` }} /></div>
        <p>Uploading {progress}%</p>
      </div>}
      {uploaded && filename && <section style={{ maxWidth: 1080, margin: "28px auto", padding: "0 16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
          <div><h2 style={{ marginBottom: 6 }}>Organize your pages</h2>
            <p style={{ margin: 0, color: "#64748b" }}>{remainingPages.length} of {pages.length} pages kept · Drag pages to reorder; rotations apply clockwise.</p></div>
          <button className="secondary-btn" onClick={() => { setRotations({}); setDeletedPages([]); setPageOrder(pages); setError(""); setResult(null) }} disabled={busy}>Reset Changes</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 16 }}>
          {orderedPages.map(page => {
            const deleted = deletedPages.includes(page); const rotation = rotations[page] || 0
            return <article key={page} draggable={!busy} onDragStart={event => { setDraggedPage(page); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(page)) }} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "move" }} onDrop={event => { event.preventDefault(); const dragged = draggedPage ?? Number(event.dataTransfer.getData("text/plain")); movePage(dragged, page); setDraggedPage(null) }} onDragEnd={() => setDraggedPage(null)} style={{ border: deleted ? "1px solid #fca5a5" : "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: deleted ? "#fff7f7" : "#fff", opacity: deleted ? 0.72 : 1, cursor: busy ? "default" : "grab", outline: draggedPage === page ? "2px dashed #2563eb" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8 }}>
                <strong><span aria-hidden="true" style={{ color: "#94a3b8", marginRight: 5 }}>⠿</span>Page {page}</strong>{deleted && <span style={{ color: "#b91c1c", fontSize: 12 }}>Will be removed</span>}
              </div>
              <div style={{ height: 210, background: "#f1f5f9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 12 }}>
                <img src={`${import.meta.env.VITE_API_URL}/preview/${encodeURIComponent(filename)}/${page}`} alt={`Preview of page ${page}`} loading="lazy"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transform: `rotate(${rotation}deg)`, transition: "transform 160ms ease" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="secondary-btn" onClick={() => rotatePage(page)} disabled={busy || deleted} style={{ flex: 1, padding: "8px 6px", fontSize: 13 }} title="Rotate clockwise">↻ Rotate</button>
                <button className="secondary-btn" onClick={() => toggleDelete(page)} disabled={busy} style={{ flex: 1, padding: "8px 6px", fontSize: 13, color: deleted ? "#166534" : "#b91c1c" }}>{deleted ? "Keep page" : "Delete"}</button>
              </div>
              {rotation !== 0 && !deleted && <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 12 }}>Rotation: {rotation}°</p>}
            </article>
          })}
        </div>
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          <button className="primary-btn" onClick={applyEdits} disabled={busy}>{busy ? "Applying Changes..." : "Apply Changes & Create PDF"}</button>
        </div>
      </section>}
      {(uploadError || error) && <div className="error-message" role="alert">⚠️ {uploadError || error}</div>}
      {result && <ResultCard title="PDF editing completed" message="Your edited PDF is ready. The original file has not been changed." info={result.info} downloadUrl={result.url} downloadText="Download Edited PDF" />}
      <section style={{ maxWidth: 900, margin: "56px auto 0", padding: "0 16px 48px", lineHeight: 1.7 }}>
        <h2>Edit PDF Pages Online</h2><p>Preview your PDF pages, rotate pages clockwise, or remove pages you no longer need. Download your changes as a new PDF while keeping your original file unchanged.</p>
      </section>
    </div>
  )
}

export default EditPDF
