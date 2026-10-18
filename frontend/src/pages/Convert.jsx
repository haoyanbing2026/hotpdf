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
  const [imageFormat, setImageFormat] = useState("jpg")
  const [resultInfo, setResultInfo] = useState({})
  const [downloadUrl, setDownloadUrl] = useState("")
  const [downloadText, setDownloadText] = useState("Download File")
  const [resultMessage, setResultMessage] = useState("")
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState("")

  const isImagesToPdf = mode === "images-to-pdf"

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
    setImageFiles([])
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

  const pageTitle = isImagesToPdf
    ? "Convert JPG / PNG to PDF"
    : mode === "pdf-to-images"
      ? "Convert PDF to JPG / PNG"
      : "Convert PDF to Word"

  const pageDescription = isImagesToPdf
    ? "Combine multiple JPG or PNG images into one PDF document."
    : mode === "pdf-to-images"
      ? "Turn every page of a PDF into downloadable JPG or PNG images."
      : "Turn PDF documents into editable Word files."

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
          padding: 16,
          border: "1px solid #dfe3ea",
          borderRadius: 12,
          background: "#fff"
        }}
      >
        <h3 style={{ marginTop: 0 }}>Choose conversion</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {[
            ["pdf-to-word", "PDF to Word"],
            ["pdf-to-images", "PDF to JPG / PNG"],
            ["images-to-pdf", "JPG / PNG to PDF"]
          ].map(([value, label]) => (
            <label key={value} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <input
                type="radio"
                name="conversion-mode"
                value={value}
                checked={mode === value}
                onChange={() => handleModeChange(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {!isImagesToPdf && (
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
          <input
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            multiple
            onChange={event => {
              setImageFiles(Array.from(event.target.files || []))
              clearResult()
            }}
          />
          <p style={{ color: "#64748b", marginBottom: 0 }}>
            Select up to 20 images. They will become PDF pages in the order shown below.
          </p>
          {imageFiles.length > 0 && (
            <ol style={{ paddingLeft: 24, overflowWrap: "anywhere" }}>
              {imageFiles.map((file, index) => (
                <li key={`${file.name}-${file.size}-${index}`}>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {progress > 0 && progress < 100 && !isImagesToPdf && (
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
                "Convert to Word"}
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
