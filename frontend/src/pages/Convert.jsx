import { useRef, useState } from "react"

import ToolHeader from "../components/ToolHeader"
import UploadBox from "../components/UploadBox"
import PDFPreview from "../components/PDFPreview"
import ResultCard from "../components/ResultCard"
import createPDFResult from "../utils/pdfResult"
import useUploadPDF from "../hooks/useUploadPDF"

const API_URL = import.meta.env.VITE_API_URL

function Convert() {
  const actionRef = useRef(null)
  const {
    setFile,
    uploadPDF,
    loading,
    progress,
    error: uploadError
  } = useUploadPDF()

  const [mode, setMode] = useState("pdf-to-word")
  const [previewFile, setPreviewFile] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [imageFormat, setImageFormat] = useState("jpg")
  const [officeFile, setOfficeFile] = useState(null)
  const [resultInfo, setResultInfo] = useState({})
  const [downloadUrl, setDownloadUrl] = useState("")
  const [downloadText, setDownloadText] = useState("Download File")
  const [resultMessage, setResultMessage] = useState("")
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState("")

  const isImagesToPdf = mode === "images-to-pdf"
  const isOfficeUploadMode = mode === "word-to-pdf" || mode === "powerpoint-to-pdf"
  const isPdfToPowerPoint = mode === "pdf-to-powerpoint"

  function clearResult() {
    setResultInfo({})
    setDownloadUrl("")
    setResultMessage("")
    setError("")
  }

  function handleFile(file) {
    setFile(file)
    setPreviewFile(file)
    clearResult()

    window.setTimeout(() => {
      actionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      })
    }, 700)
  }

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setPreviewFile(null)
    setOfficeFile(null)
    setImageFiles([])
    imagePreviews.forEach(url => URL.revokeObjectURL(url))
    setImagePreviews([])
    setFile(null)
    clearResult()
  }

  async function readResponse(response) {
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(
        typeof result.detail === "string"
          ? result.detail
          : `Request failed (${response.status}).`
      )
    }
    return result
  }

  function showResult(result, text, message) {
    if (!result?.filename) {
      throw new Error("The server did not return an output file.")
    }

    setResultInfo(createPDFResult({
      filename: result.filename,
      size: result.size || ""
    }))
    setDownloadUrl(
      `${API_URL}/download/${encodeURIComponent(result.filename)}`
    )
    setDownloadText(text)
    setResultMessage(message)
  }

  async function convertPdf() {
    clearResult()
    setError("")

    if (isOfficeUploadMode) {
      if (!officeFile) {
        setError(`Please select a ${mode === "word-to-pdf" ? "Word DOCX" : "PowerPoint PPTX"} file.`)
        return
      }
      setConverting(true)
      try {
        const formData = new FormData()
        formData.append("file", officeFile)
        const endpoint = mode === "word-to-pdf" ? "convert_word_to_pdf" : "convert_powerpoint_to_pdf"
        const response = await fetch(`${API_URL}/${endpoint}`, { method: "POST", body: formData })
        const result = await readResponse(response)
        showResult(result, "Download PDF", mode === "word-to-pdf" ? "Your Word document has been converted to PDF." : "Your PowerPoint presentation has been converted to PDF.")
      } catch (err) {
        setError(err.message || "Conversion failed.")
      } finally {
        setConverting(false)
      }
      return
    }

    const uploaded = await uploadPDF()
    if (!uploaded?.filename) return

    setConverting(true)
    try {
      if (mode === "pdf-to-word") {
        const response = await fetch(
          `${API_URL}/convert_word?filename=${encodeURIComponent(uploaded.filename)}`,
          { method: "POST" }
        )
        const result = await readResponse(response)
        showResult(
          result,
          "Download Word File",
          "Your PDF has been converted to a Word document."
        )
      } else if (isPdfToPowerPoint) {
        const response = await fetch(
          `${API_URL}/convert_powerpoint?filename=${encodeURIComponent(uploaded.filename)}`,
          { method: "POST" }
        )
        const result = await readResponse(response)
        showResult(result, "Download PowerPoint", "Each PDF page has been placed on a PowerPoint slide as an image. The slide content is not individually editable.")
      } else {
        const response = await fetch(
          `${API_URL}/pdf_to_images?filename=${encodeURIComponent(uploaded.filename)}&image_format=${encodeURIComponent(imageFormat)}`,
          { method: "POST" }
        )
        const result = await readResponse(response)
        showResult(
          result,
          "Download Images ZIP",
          `Each PDF page has been converted to a ${imageFormat.toUpperCase()} image. All pages are packaged in a ZIP file.`
        )
      }
    } catch (err) {
      setError(err.message || "Conversion failed.")
    } finally {
      setConverting(false)
    }
  }

  function moveImage(index, direction) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= imageFiles.length) return
    setImageFiles(current => {
      const next = [...current]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
    setImagePreviews(current => {
      const next = [...current]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
    clearResult()
  }

  function removeImage(index) {
    const url = imagePreviews[index]
    if (url) URL.revokeObjectURL(url)
    setImageFiles(current => current.filter((_, i) => i !== index))
    setImagePreviews(current => current.filter((_, i) => i !== index))
    clearResult()
  }

  async function convertImagesToPdf() {
    clearResult()
    setError("")

    if (!imageFiles.length) {
      setError("Please select at least one JPG or PNG image.")
      return
    }

    if (imageFiles.length > 20) {
      setError("Please choose no more than 20 images at a time.")
      return
    }

    setConverting(true)
    try {
      const formData = new FormData()
      imageFiles.forEach(file => formData.append("files", file))

      const response = await fetch(`${API_URL}/images_to_pdf`, {
        method: "POST",
        body: formData
      })
      const result = await readResponse(response)
      showResult(
        result,
        "Download PDF",
        "Your images have been combined into a PDF document."
      )
    } catch (err) {
      setError(err.message || "Image to PDF conversion failed.")
    } finally {
      setConverting(false)
    }
  }

  const modeDetails = {
    "pdf-to-word": ["Convert PDF to Word", "Turn PDF documents into editable Word files."],
    "pdf-to-images": ["Convert PDF to JPG / PNG", "Turn every page of a PDF into downloadable JPG or PNG images."],
    "images-to-pdf": ["Convert JPG / PNG to PDF", "Combine multiple JPG or PNG images into one PDF document."],
    "word-to-pdf": ["Convert Word to PDF", "Convert DOCX documents to PDF while retaining layout where supported."],
    "powerpoint-to-pdf": ["Convert PowerPoint to PDF", "Convert PPTX presentations to PDF."],
    "pdf-to-powerpoint": ["Convert PDF to PowerPoint", "Create a PowerPoint slide for each PDF page."]
  }
  const [pageTitle, pageDescription] = modeDetails[mode] || modeDetails["pdf-to-word"]

  return (
    <div className="page">
      <ToolHeader
        icon="🔄"
        title={pageTitle}
        description={pageDescription}
      />

      <section
        aria-label="Conversion type"
        style={{
          width: "min(100% - 32px, 720px)",
          margin: "24px auto",
          padding: 20,
          border: "1px solid #dfe3ea",
          borderRadius: 12,
          background: "#fff"
        }}
      >
        <h3 style={{ margin: "0 0 20px", textAlign: "center" }}>Choose conversion</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          {[
            ["pdf-to-word", "PDF to Word"],
            ["word-to-pdf", "Word to PDF"],
            ["pdf-to-powerpoint", "PDF to PowerPoint"],
            ["powerpoint-to-pdf", "PowerPoint to PDF"],
            ["pdf-to-images", "PDF to JPG / PNG"],
            ["images-to-pdf", "JPG / PNG to PDF"]
          ].map(([value, label]) => (
            <label
              key={value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
                padding: "14px 12px",
                border: `1px solid ${mode === value ? "#2563eb" : "#dfe3ea"}`,
                borderRadius: 10,
                background: mode === value ? "#eff6ff" : "#fff",
                color: "#0f2748",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: mode === value ? 600 : 400,
                lineHeight: 1.4
              }}
            >
              <input
                type="radio"
                name="conversion-mode"
                value={value}
                checked={mode === value}
                onChange={() => handleModeChange(value)}
                style={{ flexShrink: 0, accentColor: "#2563eb" }}
              />
              <span style={{ overflowWrap: "anywhere" }}>{label}</span>
            </label>
          ))}
        </div>
      </section>

      {!isImagesToPdf && !isOfficeUploadMode && (
        <>
          <UploadBox onUpload={handleFile} />

          {previewFile && (
            <div className="convert-preview-area">
              <h3>PDF Preview</h3>
              <PDFPreview
                file={previewFile}
                selectedPages={[]}
                setSelectedPages={() => {}}
              />
            </div>
          )}

          {mode === "pdf-to-images" && (
            <section
              style={{
                width: "min(100% - 32px, 720px)",
                margin: "24px auto",
                padding: 16,
                border: "1px solid #dfe3ea",
                borderRadius: 12
              }}
            >
              <h3 style={{ marginTop: 0 }}>Image format</h3>
              <label style={{ marginRight: 18 }}>
                <input
                  type="radio"
                  name="image-format"
                  checked={imageFormat === "jpg"}
                  onChange={() => setImageFormat("jpg")}
                />{" "}
                JPG
              </label>
              <label>
                <input
                  type="radio"
                  name="image-format"
                  checked={imageFormat === "png"}
                  onChange={() => setImageFormat("png")}
                />{" "}
                PNG
              </label>
              <p style={{ marginBottom: 0, color: "#64748b" }}>
                Every page will be converted to an image. The images will be downloaded together as a ZIP file.
              </p>
            </section>
          )}
        </>
      )}

      {isOfficeUploadMode && (
        <section style={{ width: "min(100% - 32px, 720px)", margin: "24px auto", padding: "28px 20px", border: "1px dashed #9bbcff", borderRadius: 12, background: "#fff", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px", color: "#0f2748" }}>
            {mode === "word-to-pdf" ? "Upload Word Document" : "Upload PowerPoint Presentation"}
          </h3>
          <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14 }}>
            {mode === "word-to-pdf" ? "Choose a DOCX file to convert into PDF." : "Choose a PPTX file to convert into PDF."}
          </p>
          <input
            id="hotpdf-office-file"
            key={mode}
            type="file"
            accept={mode === "word-to-pdf" ? ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" : ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"}
            style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}
            onChange={event => {
              setOfficeFile(event.target.files?.[0] || null)
              clearResult()
              event.target.value = ""
            }}
          />
          <label
            htmlFor="hotpdf-office-file"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 42, boxSizing: "border-box", padding: "11px 22px", border: "1px solid #2563eb", borderRadius: 8, background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600, lineHeight: 1.2, cursor: "pointer", boxShadow: "0 2px 5px rgba(37, 99, 235, 0.16)" }}
          >
            <span aria-hidden="true">＋</span>
            {mode === "word-to-pdf" ? "Choose Word File" : "Choose PPTX File"}
          </label>
          {officeFile && (
            <div role="status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "20px auto 0", padding: "12px 14px", maxWidth: 520, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", textAlign: "left" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "#334155", fontWeight: 600, fontSize: 14, overflowWrap: "anywhere" }}>{officeFile.name}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{(officeFile.size / 1024).toFixed(1)} KB · Ready to convert</div>
              </div>
              <span aria-label="File selected" style={{ color: "#16a34a", fontSize: 20 }}>✓</span>
            </div>
          )}
          <p style={{ color: "#64748b", fontSize: 13, margin: "20px 0 0" }}>
            Maximum upload size: 20 MB · Conversion runs on the HotPDF server.
          </p>
        </section>
      )}

      {isImagesToPdf && (
        <section
          style={{
            width: "min(100% - 32px, 720px)",
            margin: "24px auto",
            padding: 20,
            border: "1px dashed #9bbcff",
            borderRadius: 12,
            background: "#fff"
          }}
        >
          <h3 style={{ marginTop: 0 }}>Choose JPG or PNG images</h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 12,
              margin: "12px 0 18px"
            }}
          >
            <input
              id="hotpdf-image-files"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              multiple
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0
              }}
              onChange={event => {
                const selected = Array.from(event.target.files || [])
                const combined = [...imageFiles, ...selected]
                const unique = combined.filter((file, index, all) =>
                  all.findIndex(item =>
                    item.name === file.name &&
                    item.size === file.size &&
                    item.lastModified === file.lastModified
                  ) === index
                ).slice(0, 20)

                imagePreviews.forEach(url => URL.revokeObjectURL(url))
                setImageFiles(unique)
                setImagePreviews(unique.map(file => URL.createObjectURL(file)))
                clearResult()
                event.target.value = ""
              }}
            />
            <label
              htmlFor="hotpdf-image-files"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 40,
                boxSizing: "border-box",
                padding: "10px 20px",
                border: "1px solid #2563eb",
                borderRadius: 8,
                background: "#2563eb",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                lineHeight: 1.2,
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(37, 99, 235, 0.16)"
              }}
            >
              <span aria-hidden="true">＋</span>
              Choose Images
            </label>
            <span style={{ color: "#64748b", fontSize: 13 }}>
              {imageFiles.length} / 20 images selected
            </span>
          </div>
          <p style={{ color: "#64748b", marginBottom: 12 }}>
            Select up to 20 images. Preview them below and use the arrows to set the PDF page order.
          </p>
          {imageFiles.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))", gap: 12 }}>
              {imageFiles.map((file, index) => (
                <div key={`${file.name}-${file.size}-${file.lastModified}`} style={{ minWidth: 0, border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
                  <div style={{ color: "#475569", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Page {index + 1}</div>
                  <div style={{ height: 115, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", borderRadius: 6, overflow: "hidden" }}>
                    <img src={imagePreviews[index]} alt={`Preview of ${file.name}`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                  <div title={file.name} style={{ fontSize: 12, margin: "8px 0", overflowWrap: "anywhere", minHeight: 32 }}>{file.name}</div>
                  <div style={{ color: "#64748b", fontSize: 11, marginBottom: 8 }}>{(file.size / 1024).toFixed(1)} KB</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <button type="button" style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "4px 9px", background: index === 0 ? "#f1f5f9" : "#fff", cursor: index === 0 ? "not-allowed" : "pointer" }} disabled={index === 0} onClick={() => moveImage(index, -1)} aria-label={`Move ${file.name} up`}>↑</button>
                    <button type="button" style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "4px 9px", background: index === imageFiles.length - 1 ? "#f1f5f9" : "#fff", cursor: index === imageFiles.length - 1 ? "not-allowed" : "pointer" }} disabled={index === imageFiles.length - 1} onClick={() => moveImage(index, 1)} aria-label={`Move ${file.name} down`}>↓</button>
                    <button type="button" style={{ border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 6, padding: "4px 7px", background: "#fff", cursor: "pointer" }} onClick={() => removeImage(index)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {progress > 0 && progress < 100 && !isImagesToPdf && !isOfficeUploadMode && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-inner" style={{ width: `${progress}%` }} />
          </div>
          <p>Uploading {progress}%</p>
        </div>
      )}

      <div ref={actionRef} style={{ textAlign: "center", margin: "32px auto" }}>
        <button
          className="primary-btn"
          onClick={isImagesToPdf ? convertImagesToPdf : convertPdf}
          disabled={loading || converting}
        >
          {loading ? "Uploading..." : converting ? "Converting..." :
            isImagesToPdf ? "Convert Images to PDF" :
              mode === "pdf-to-images" ? `Convert PDF to ${imageFormat.toUpperCase()}` :
                mode === "word-to-pdf" ? "Convert Word to PDF" :
                  mode === "powerpoint-to-pdf" ? "Convert PowerPoint to PDF" :
                    mode === "pdf-to-powerpoint" ? "Convert PDF to PowerPoint" : "Convert to Word"}
        </button>
      </div>

      {(uploadError || error) && (
        <div className="error-message" role="alert">
          ⚠️ {uploadError || error}
        </div>
      )}

      {downloadUrl && (
        <ResultCard
          title="🎉 Conversion completed"
          message={resultMessage}
          info={resultInfo}
          downloadUrl={downloadUrl}
          downloadText={downloadText}
        />
      )}

      <section
        aria-label="PDF conversion guide"
        style={{
          width: "min(100% - 32px, 720px)",
          margin: "64px auto 80px",
          textAlign: "left",
          lineHeight: 1.75
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 16 }}>Convert PDF and Images Online</h2>
        <p>
          HotPDF supports PDF to Word, PDF page exports to JPG or PNG, and combining JPG or PNG images into a PDF.
          Choose the conversion type, select your files, preview PDFs when available, and download the result.
        </p>
        <ol style={{ paddingLeft: 24 }}>
          <li><strong>Choose a conversion.</strong> Select PDF to Word, PDF to images, or images to PDF.</li>
          <li><strong>Select your files.</strong> Upload a PDF or select JPG / PNG images.</li>
          <li><strong>Convert.</strong> Start the conversion and wait for processing to finish.</li>
          <li><strong>Download.</strong> Save the generated Word document, ZIP archive, or PDF.</li>
        </ol>
        <h2 style={{ textAlign: "center", marginTop: 36, marginBottom: 16 }}>Frequently Asked Questions</h2>
        <div style={{ display: "grid", gap: 18 }}>
          <div>
            <h3 style={{ marginBottom: 6 }}>Can I convert every page of a PDF to images?</h3>
            <p style={{ marginTop: 0 }}>Yes. Each page is exported as a JPG or PNG image, and all images are packaged in one ZIP file.</p>
          </div>
          <div>
            <h3 style={{ marginBottom: 6 }}>Can I combine multiple images into one PDF?</h3>
            <p style={{ marginTop: 0 }}>Yes. Select multiple JPG or PNG images and HotPDF will create one PDF with one page per image.</p>
          </div>
          <div>
            <h3 style={{ marginBottom: 6 }}>Will PDF to Word preserve the original layout exactly?</h3>
            <p style={{ marginTop: 0 }}>Not always. Complex tables, columns, scanned pages, and unusual fonts may need adjustments after conversion.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Convert
