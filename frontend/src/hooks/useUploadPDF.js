
import { useRef, useState } from "react"
import axios from "axios"

function useUploadPDF() {

  const [file, setCurrentFile] = useState(null)

  const [filename, setFilename] = useState("")
  const [pages, setPages] = useState([])
  const [size, setSize] = useState(0)

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  // Identifies the current file/upload operation.
  const requestVersion = useRef(0)

  // Called when the user selects a different PDF.
  function setFile(selectedFile) {

    requestVersion.current += 1

    setCurrentFile(selectedFile)

    // Clear information from the previous PDF.
    setFilename("")
    setPages([])
    setSize(0)

    setProgress(0)
    setError("")
    setLoading(false)
  }

  async function uploadPDF() {

    if (!file) {

      setError("Please select a PDF file first.")
      return null
    }

    if (loading) {
      return null
    }

    // Each upload has its own identifier.
    const currentVersion = ++requestVersion.current

    setLoading(true)
    setError("")
    setProgress(0)

    try {

      const formData = new FormData()
      formData.append("file", file)

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload`,
        formData,
        {
          onUploadProgress: (event) => {

            // Ignore progress from an outdated upload.
            if (
              currentVersion !== requestVersion.current
            ) {
              return
            }

            if (event.total) {

              const percent = Math.round(
                (event.loaded * 100) / event.total
              )

              setProgress(percent)
            }
          }
        }
      )

      // Ignore responses belonging to an old file.
      if (
        currentVersion !== requestVersion.current
      ) {
        return null
      }

      const data = res.data

      if (!data.filename) {
        throw new Error("Upload failed.")
      }

      setFilename(data.filename)
      setSize(data.size || 0)

      const pageCount = Number(data.pages) || 0

      const pageList = Array.from(
        { length: pageCount },
        (_, index) => index + 1
      )

      setPages(pageList)
      setProgress(100)

      return data

    } catch (err) {

      if (
        currentVersion !== requestVersion.current
      ) {
        return null
      }

      let message = "Upload failed."

      if (err.response?.data?.detail) {

        const detail = err.response.data.detail

        message = typeof detail === "string"
          ? detail
          : "Unable to upload this PDF."

      } else if (err.message) {

        message = err.message
      }

      setError(message)

      return null

    } finally {

      if (
        currentVersion === requestVersion.current
      ) {
        setLoading(false)
      }
    }
  }

  return {
    file,
    setFile,
    filename,
    pages,
    size,
    loading,
    progress,
    error,
    uploadPDF
  }
}

export default useUploadPDF
