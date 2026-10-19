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
  const [insertFile, setInsertFile] = useState(null)
  const [insertFilename, setInsertFilename] = useState("")
  const [insertPages, setInsertPages] = useState([])
  const [insertPageCount, setInsertPageCount] = useState(0)
  const [insertBefore, setInsertBefore] = useState(1)
  const [insertUploading, setInsertUploading] = useState(false)
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
    setInsertFile(null); setInsertFilename(""); setInsertPages([]); setInsertPageCount(0); setInsertBefore(1); setInsertUploading(false)
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

  async function handleInsertUpload(selectedFile) {
    setInsertFile(selectedFile || null)
    setInsertFilename("")
    setInsertPages([])
    setInsertPageCount(0)
    setResult(null)
    setError("")
    if (!selectedFile) return
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.")
      return
    }
    const formData = new FormData()
    formData.append("file", selectedFile)
    setInsertUploading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, { method: "POST", body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Could not upload the second PDF.")
      setInsertFilename(data.filename)
      setInsertPageCount(Number(data.pages) || 0)
      setInsertPages(Array.from({ length: Number(data.pages) || 0 }, (_, index) => index + 1))
      setInsertBefore(remainingPages.length + 1)
    } catch (err) {
      setError(err.message || "Could not upload the second PDF.")
      setInsertFile(null)
    } finally {
      setInsertUploading(false)
    }
  }

  function toggleInsertPage(page) {
    setInsertPages(current => current.includes(page) ? current.filter(item => item !== page) : [...current, page].sort((a, b) => a - b))
    setError("")
    setResult(null)
  }

  async function applyEdits() {
    if (!uploaded || !filename) { setError("Please upload a PDF first."); return }
    if (remainingPages.length < 1) { setError("Keep at least one page in the PDF."); return }
    if (Object.values(rotations).every(degrees => degrees === 0) && deletedPages.length === 0 && insertPages.length === 0 && remainingPages.every((page, index) => pageOrder[index] === page)) {
      setError("Rotate, delete, reorder, or insert at least one page before applying changes."); return
    }
    if (insertPages.length > 0 && !insertFilename) {
      setError("Upload the second PDF before inserting pages."); return
    }
    if (insertPages.length > 0 && (insertBefore < 1 || insertBefore > remainingPages.length + 1)) {
      setError("Choose a valid insertion position."); return
    }
    setBusy(true); setError(""); setResult(null)
    try {
      const params = new URLSearchParams({
        filename,
        rotations: JSON.stringify(Object.fromEntries(Object.entries(rotations).filter(([, degrees]) => degrees !== 0))),
        delete_pages: deletedPages.join(","),
        page_order: JSON.stringify(remainingPages),
        insert_filename: insertFilename,
        insert_pages: insertPages.join(","),
        insert_before: String(insertBefore)
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
      <ToolHeader icon="📝" title="Edit PDF" description="Reorder, rotate, remove, or insert pages from another PDF, then download a new PDF." />
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
            <p style={{ margin: 0, color: "#64748b" }}>{remainingPages.length} of {pages.length} pages kept · Drag pages to reorder; insert pages from another PDF below. Rotations apply clockwise.</p></div>
          <button className="secondary-btn" onClick={() => { setRotations({}); setDeletedPages([]); setPageOrder(pages); setError(""); setResult(null) }} disabled={busy}>Reset Changes</button>
        </div>
        <section style={{ border: "1px solid #dbeafe", background: "#f8fbff", borderRadius: 12, padding: 16, marginBottom: 22 }}>
          <h3 style={{ margin: "0 0 8px" }}>Insert pages from another PDF</h3>
          <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: 14 }}>Upload a second PDF, select the pages you need, and choose where to insert them.</p>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 8, background: "#2563eb", color: "white", cursor: insertUploading || busy ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, opacity: insertUploading || busy ? 0.65 : 1 }}>
            {insertUploading ? "Uploading PDF..." : insertFilename ? "Choose another PDF" : "Choose second PDF"}
            <input type="file" accept="application/pdf,.pdf" disabled={insertUploading || busy} style={{ display: "none" }} onChange={event => { handleInsertUpload(event.target.files?.[0]); event.target.value = "" }} />
          </label>
          {insertFilename && <div style={{ marginTop: 12 }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "#334155" }}>{insertFile?.name || "Second PDF uploaded"} · {insertPageCount} pages</p>
            <label style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12 }}>
              Insert before page
              <select value={insertBefore} onChange={event => { setInsertBefore(Number(event.target.value)); setResult(null) }} disabled={busy} style={{ border: "1px solid #cbd5e1", borderRadius: 7, padding: "7px 10px", background: "white" }}>
                {Array.from({ length: remainingPages.length + 1 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1 <= remainingPages.length ? `Page ${index + 1}` : "End of document"}</option>)}
              </select>
            </label>
            <p style={{ fontSize: 13, margin: "0 0 10px", color: "#334155" }}>Select pages to insert ({insertPages.length} selected)</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
              {Array.from({ length: insertPageCount }, (_, index) => index + 1).map(page => <label key={page} style={{ border: insertPages.includes(page) ? "2px solid #2563eb" : "1px solid #e2e8f0", borderRadius: 9, background: "white", padding: 8, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 600 }}>Page {page}</span><input type="checkbox" checked={insertPages.includes(page)} onChange={() => toggleInsertPage(page)} disabled={busy} /></div>
                <img src={`${import.meta.env.VITE_API_URL}/preview/${encodeURIComponent(insertFilename)}/${page}`} alt={`Source PDF page ${page}`} loading="lazy" style={{ display: "block", width: "100%", height: 120, objectFit: "contain", background: "#f1f5f9", borderRadius: 5 }} />
              </label>)}
            </div>
          </div>}
        </section>
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
      <section aria-label="Edit PDF guide" style={{ maxWidth: 900, margin: "56px auto 0", padding: "0 16px 64px", lineHeight: 1.7, color: "#334155" }}>
        <h2>Edit PDF Pages Online with HotPDF</h2>
        <p>HotPDF is an online PDF editor that helps you organize PDF documents without changing the original file. Preview your pages, change their order, rotate pages, remove unwanted pages, or insert selected pages from another PDF. When you finish editing, create and download a new PDF.</p>
        <h3>How to Edit a PDF Online</h3>
        <ol><li><strong>Upload your PDF.</strong> Select a PDF file and wait for HotPDF to load its pages.</li><li><strong>Preview and organize pages.</strong> Review the page thumbnails and drag pages into your preferred order.</li><li><strong>Rotate or remove pages.</strong> Rotate pages clockwise or mark unwanted pages for removal.</li><li><strong>Insert pages from another PDF.</strong> Upload a second document, select the pages you need, and choose where to insert them.</li><li><strong>Create your edited PDF.</strong> Apply your changes and download the resulting document.</li></ol>
        <h3>PDF Editing Features</h3>
        <ul><li><strong>Reorder PDF pages:</strong> Drag page thumbnails to arrange your document in the desired sequence.</li><li><strong>Rotate PDF pages:</strong> Correct the orientation of individual pages.</li><li><strong>Delete PDF pages:</strong> Remove unwanted pages while keeping the pages you need.</li><li><strong>Insert PDF pages:</strong> Select pages from a second PDF and insert them at a chosen position.</li><li><strong>Download a new PDF:</strong> Save your changes as a separate file without modifying the original document.</li></ul>
        <h3>Frequently Asked Questions</h3>
        <h4>Can I rearrange PDF pages online?</h4><p>Yes. Upload your PDF and drag the page thumbnails into your preferred order before creating the edited document.</p>
        <h4>Can I rotate or delete individual PDF pages?</h4><p>Yes. You can rotate individual pages and mark pages for removal. Apply your changes to create a new PDF.</p>
        <h4>Can I insert pages from another PDF?</h4><p>Yes. Upload a second PDF, select the pages you want to insert, and choose their insertion position.</p>
        <h4>Will editing change my original PDF?</h4><p>No. HotPDF creates a separate edited PDF for download. Your original document is not modified by the editing process.</p>
        <h4>Can I use HotPDF without installing software?</h4><p>Yes. HotPDF runs in your web browser, so you can use the PDF editing tools without installing a separate desktop application.</p>
      </section>
    </div>
  )
}

export default EditPDF
