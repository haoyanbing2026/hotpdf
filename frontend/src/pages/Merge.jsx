
import { useState } from "react"

import UploadBox from "../components/UploadBox"
import ResultCard from "../components/ResultCard"
import PDFThumbnail from "../components/PDFThumbnail"

const API_URL = import.meta.env.VITE_API_URL

function Merge() {
  const [files, setFiles] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState("")
  const [resultInfo, setResultInfo] = useState({})

  // Select PDF files
  function handleUpload(selected) {
    setFiles(Array.from(selected || []))
    setError("")
    setDownloadUrl("")
    setResultInfo({})
  }

  // Remove a file
  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setDownloadUrl("")
  }

  // Move a file up
  function moveUp(index) {
    if (index === 0) return

    setFiles(prev => {
      const list = [...prev]
      ;[list[index - 1], list[index]] =
        [list[index], list[index - 1]]
      return list
    })

    setDownloadUrl("")
  }

  // Move a file down
  function moveDown(index) {
    if (index >= files.length - 1) return

    setFiles(prev => {
      const list = [...prev]
      ;[list[index], list[index + 1]] =
        [list[index + 1], list[index]]
      return list
    })

    setDownloadUrl("")
  }

  // Merge PDFs
  async function mergePDF() {
    if (files.length < 2) {
      setError("Please select at least two PDF files.")
      return
    }

    setError("")
    setDownloadUrl("")
    setLoading(true)

    try {
      const formData = new FormData()

      files.forEach(file => {
        formData.append("files", file)
      })

      const res = await fetch(`${API_URL}/merge`, {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        throw new Error("Unable to merge PDF files.")
      }

      const data = await res.json()

      if (!data.filename) {
        throw new Error("Merge failed. Please try again.")
      }

      setResultInfo({
        filename: data.filename,
        pages: "Combined document",
        size: data.size || "Not available"
      })

      setDownloadUrl(
        `${API_URL}/download/${encodeURIComponent(data.filename)}`
      )

    } catch (err) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">

      <h1>📎 Merge PDF</h1>

      <p>
        Combine multiple PDF files into one document.
        Arrange your files in the order you prefer.
      </p>

      <UploadBox
        multiple
        onUpload={handleUpload}
      />

      {files.length > 0 && (
        <div className="file-manager">

          <h3>Arrange Your Files</h3>

          <p>
            Use the arrows to change the order of your PDFs.
          </p>

          {files.map((file, index) => (
            <div
              className="merge-item"
              key={`${file.name}-${file.size}-${index}`}
            >

              <PDFThumbnail file={file} />

              <div className="file-name">
                📄 {file.name}
              </div>

              <div className="merge-actions">

                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  title="Move up"
                  aria-label="Move up"
                >
                  ↑
                </button>

                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === files.length - 1}
                  title="Move down"
                  aria-label="Move down"
                >
                  ↓
                </button>

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  title="Remove file"
                  aria-label="Remove file"
                >
                  Remove
                </button>

              </div>

            </div>
          ))}

          <p className="merge-count">
            {files.length} PDF files selected
          </p>

        </div>
      )}

      <button
        className="primary-btn"
        onClick={mergePDF}
        disabled={loading || files.length < 2}
      >
        {loading ? "Merging PDFs..." : "Merge PDF"}
      </button>

      {error && (
        <p className="error-message" role="alert">
          ⚠️ {error}
        </p>
      )}

      {downloadUrl && (
        <ResultCard
          title="Merge completed!"
          message="Your PDF files have been successfully combined."
          info={resultInfo}
          downloadUrl={downloadUrl}
          downloadText="Download Merged PDF"
        />
      )}

    </div>
  )
}

export default Merge
