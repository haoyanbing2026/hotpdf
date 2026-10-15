
import { useEffect, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url"

// Keep the existing PDF.js worker configuration.
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc


function PDFPreview({
  file,
  selectedPages,
  setSelectedPages
}) {

  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  useEffect(() => {

    let cancelled = false

    if (!file) {
      setPages([])
      setLoading(false)
      setError("")
      return
    }

    async function loadPDF() {

      setLoading(true)
      setError("")
      setPages([])

      try {

        const buffer = await file.arrayBuffer()

        if (cancelled) {
          return
        }

        const pdf = await pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
          disableFontFace: true,
          useWorkerFetch: false,
          isEvalSupported: false
        }).promise

        if (cancelled) {
          return
        }

        const list = []

        const maxPages = Math.min(
          pdf.numPages,
          20
        )

        for (
          let i = 1;
          i <= maxPages;
          i++
        ) {

          if (cancelled) {
            return
          }

          const page = await pdf.getPage(i)

          const scale =
            window.innerWidth < 600
              ? 0.6
              : 0.5

          const viewport = page.getViewport({
            scale
          })

          const canvas = document.createElement(
            "canvas"
          )

          const context = canvas.getContext("2d")

          if (!context) {
            throw new Error(
              "Unable to create PDF preview."
            )
          }

          canvas.width = Math.ceil(viewport.width)
          canvas.height = Math.ceil(viewport.height)

          await page.render({
            canvasContext: context,
            viewport
          }).promise

          if (cancelled) {
            canvas.width = 0
            canvas.height = 0
            return
          }

          list.push({
            page: i,
            image: canvas.toDataURL(
              "image/jpeg",
              0.8
            ),
            width: canvas.width,
            height: canvas.height
          })

          canvas.width = 0
          canvas.height = 0
        }

        if (!cancelled) {
          setPages(list)
        }

      } catch (err) {

        if (!cancelled) {

          console.error(
            "PDF preview error:",
            err
          )

          setError(
            err.message ||
            "Unable to preview PDF."
          )
        }

      } finally {

        if (!cancelled) {
          setLoading(false)
        }

      }
    }

    loadPDF()

    return () => {
      cancelled = true
    }

  }, [file])


  function togglePage(page) {

    if (selectedPages.includes(page)) {

      setSelectedPages(
        selectedPages.filter(
          p => p !== page
        )
      )

    } else {

      setSelectedPages([
        ...selectedPages,
        page
      ])

    }
  }


  return (

    <div
      className="preview-container"
      style={{
        height: "min(65vh, 540px)",
        overflowY: "auto",
        overflowX: "hidden",
        alignContent: "flex-start",
        boxSizing: "border-box",
        padding: "12px 6px"
      }}
    >

      {loading && (

        <div className="loading-box">
          Loading PDF preview...
        </div>

      )}


      {error && (

        <div className="error-message">
          ⚠️ {error}
        </div>

      )}


      {!loading && !error && pages.map(item => (

        <div
          key={item.page}
          className={
            selectedPages.includes(item.page)
              ? "preview-card selected"
              : "preview-card"
          }
          onClick={() => togglePage(item.page)}
        >

          <img
            src={item.image}
            alt={`Page ${item.page}`}
            width={item.width}
            height={item.height}
          />

          <p>
            Page {item.page}
          </p>

        </div>

      ))}

    </div>

  )
}

export default PDFPreview
