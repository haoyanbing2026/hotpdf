import { useRef, useState } from "react"

import ToolHeader from "../components/ToolHeader"

import UploadBox from "../components/UploadBox"

import PDFPreview from "../components/PDFPreview"

import ResultCard from "../components/ResultCard"

import createPDFResult from "../utils/pdfResult"

import useUploadPDF from "../hooks/useUploadPDF"





function Compress(){



const actionRef = useRef(null)





const {

setFile,

uploadPDF,

loading,

progress,

error:uploadError

}=useUploadPDF()







const [previewFile,setPreviewFile] = useState(null)

const [resultInfo,setResultInfo] = useState({})

const [downloadUrl,setDownloadUrl] = useState("")

const [compressing,setCompressing] = useState(false)

const [error,setError] = useState("")
const [compressionMode,setCompressionMode] = useState("standard")
const [targetSize,setTargetSize] = useState("2")
const [targetUnit,setTargetUnit] = useState("MB")
const [targetMet,setTargetMet] = useState(null)
const [compressionMessage,setCompressionMessage] = useState("")









function handleFile(file){



setFile(file)


setPreviewFile(file)


setResultInfo({})


setDownloadUrl("")
setTargetMet(null)
setCompressionMessage("")

setError("")





/*
 等待 PDFPreview 渲染完成
 然后定位到 Compress 按钮
*/


setTimeout(()=>{


actionRef.current?.scrollIntoView({

behavior:"smooth",

block:"center"

})


},1000)



}









async function compressPDF(){
  setError("")
  setResultInfo({})
  setDownloadUrl("")
  setTargetMet(null)
  setCompressionMessage("")

  let targetBytes = null
  if (compressionMode === "target") {
    const numericSize = Number(targetSize)
    if (!Number.isFinite(numericSize) || numericSize <= 0) {
      setError("Enter a valid maximum file size.")
      return
    }

    targetBytes = Math.floor(
      numericSize * (targetUnit === "MB" ? 1024 * 1024 : 1024)
    )
    if (targetBytes < 1024) {
      setError("The maximum file size must be at least 1 KB.")
      return
    }
    if (targetBytes > 100 * 1024 * 1024) {
      setError("The maximum file size cannot exceed 100 MB.")
      return
    }
  }

  setCompressing(true)
  try {
    const data = await uploadPDF()
    if (!data?.filename) {
      throw new Error("PDF upload failed. Please choose a PDF file and try again.")
    }

    const params = new URLSearchParams({ filename: data.filename })
    if (targetBytes !== null) params.set("target_bytes", String(targetBytes))

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/compress?${params.toString()}`,
      { method: "POST" }
    )

    let result
    try {
      result = await res.json()
    } catch {
      throw new Error("The compression service returned an invalid response.")
    }
    if (!res.ok || !result?.filename) {
      throw new Error(result?.detail || result?.message || "Compression failed.")
    }

    // Do not display a saved-size value when compression did not reduce the file.
    // parseFloat also handles values such as "0 MB" or "0.00%".
    const savedValue = result.saved ?? ""
    const savedNumber = Number.parseFloat(String(savedValue).replace(/,/g, ""))
    const displaySaved = savedValue !== "" && !(Number.isFinite(savedNumber) && savedNumber === 0)
      ? savedValue
      : ""

    setResultInfo(createPDFResult({
      filename: result.filename,
      originalSize: result.original_size ?? "",
      compressedSize: result.compressed_size ?? "",
      saved: displaySaved
    }))

    if (compressionMode === "target") {
      const met = result.target_met === true
      setTargetMet(met)
      setCompressionMessage(
        met
          ? `Target reached. The compressed PDF is within your ${targetSize} ${targetUnit} limit.`
          : `The requested limit could not be reached. The best available compressed PDF is provided. Actual output: ${result.compressed_size} MB.`
      )
    } else {
      setCompressionMessage("Your PDF has been compressed. Check the downloaded file before submitting or sharing it.")
    }

    setDownloadUrl(`${import.meta.env.VITE_API_URL}/download/${encodeURIComponent(result.filename)}`)
  } catch (err) {
    setError(err.message || "Compression failed.")
  } finally {
    setCompressing(false)
  }
}




return (

<div className="page">






<ToolHeader

icon="📦"

title="Compress PDF"

description="Reduce PDF size while keeping good quality."

/>









<UploadBox

onUpload={handleFile}

/>

<div
  className="compression-options"
  style={{ width: "min(100% - 32px, 720px)", margin: "24px auto", padding: 20, border: "1px solid var(--border-color, #ddd)", borderRadius: 12, textAlign: "left", boxSizing: "border-box" }}
>
  <h3 style={{ marginTop: 0, marginBottom: 14 }}>Compression options</h3>
  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <input type="radio" name="compressionMode" value="standard" checked={compressionMode === "standard"}
        onChange={() => { setCompressionMode("standard"); setTargetMet(null); setCompressionMessage("") }} />
      Standard compression
    </label>
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <input type="radio" name="compressionMode" value="target" checked={compressionMode === "target"}
        onChange={() => { setCompressionMode("target"); setTargetMet(null); setCompressionMessage("") }} />
      Maximum file size
    </label>
  </div>
  {compressionMode === "target" && (
    <div>
      <label htmlFor="compress-target-size" style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
        Compress to no more than
      </label>
      <div style={{ display: "flex", gap: 10, maxWidth: 360 }}>
        <input id="compress-target-size" type="number" min="0.01" step="any" inputMode="decimal"
          value={targetSize} onChange={(event) => setTargetSize(event.target.value)}
          aria-describedby="compress-target-help"
          style={{ flex: 1, minWidth: 0, padding: "10px 12px", border: "1px solid #bbb", borderRadius: 8, font: "inherit" }} />
        <select aria-label="Maximum file size unit" value={targetUnit} onChange={(event) => setTargetUnit(event.target.value)}
          style={{ width: 90, padding: "10px 12px", border: "1px solid #bbb", borderRadius: 8, font: "inherit", background: "transparent" }}>
          <option value="KB">KB</option>
          <option value="MB">MB</option>
        </select>
      </div>
      <p id="compress-target-help" style={{ marginBottom: 0, color: "var(--text-secondary, #666)", fontSize: 14 }}>
        HotPDF will try to make the output no larger than this limit. Some PDFs cannot be reduced enough; if that happens, we will tell you.
      </p>
    </div>
  )}
</div>









{

previewFile &&


<div

className="compress-preview-area"

>


<h3>

PDF Preview

</h3>



<PDFPreview

file={previewFile}

selectedPages={[]}

setSelectedPages={()=>{}}

/>



</div>


}









{

progress>0 && progress<100 &&


<div className="upload-progress">


<div className="progress-bar">


<div

className="progress-inner"

style={{

width:`${progress}%`

}}

/>


</div>


<p>

Uploading {progress}%

</p>


</div>


}









<div ref={actionRef}>


<button

className="primary-btn"

onClick={compressPDF}

disabled={loading || compressing}

>



{

loading

?

"Uploading..."

:

compressing

?

"Compressing..."

:

"Compress PDF"



}



</button>


</div>









{
  (error || (!previewFile && uploadError)) &&
  <div className="error-message" role="alert">
    ⚠️ {error || uploadError}
  </div>
}









{
  downloadUrl && (
    <>
      {compressionMessage && (
        <div role="status" style={{
          width: "min(100% - 32px, 720px)", margin: "20px auto", padding: 14,
          borderRadius: 10,
          border: `1px solid ${targetMet === false ? "#d97706" : "#16a34a"}`,
          background: targetMet === false ? "#fff7ed" : "#f0fdf4",
          color: "#222", lineHeight: 1.5
        }}>
          <strong>{targetMet === false ? "Target size not reached" : targetMet === true ? "Target size reached" : "Compression complete"}</strong>
          <div>{compressionMessage}</div>
        </div>
      )}
      <ResultCard
        title={targetMet === false ? "Compressed PDF is ready" : "🎉 Compression completed"}
        message={compressionMessage}
        info={resultInfo}
        downloadUrl={downloadUrl}
        downloadText="Download Compressed PDF"
      />
    </>
  )
}


<section aria-label="Compress PDF guide" style={{ width: "min(100% - 32px, 720px)", margin: "64px auto 80px", textAlign: "left", lineHeight: 1.75 }}>
  <h2 style={{ textAlign: "center", marginBottom: 16 }}>How to Compress a PDF Online</h2>
  <p>Use HotPDF to upload a PDF, preview its pages, and create a compressed version that you can download. The amount of size reduction depends on the content of your original file.</p>
  <ol style={{ paddingLeft: 24 }}>
    <li><strong>Choose a PDF.</strong> Select the PDF file you want to compress.</li>
    <li><strong>Review the preview.</strong> Check the document pages before processing.</li>
    <li><strong>Compress the file.</strong> Click “Compress PDF” and wait for processing to finish.</li>
    <li><strong>Download the result.</strong> Click “Download Compressed PDF” to save the output.</li>
  </ol>

  <h2 style={{ textAlign: "center", marginTop: 36, marginBottom: 16 }}>Reduce PDF File Size with HotPDF</h2>
  <p>A smaller PDF may be easier to share or store. Compression can be useful for reports, class materials, and other documents. Results vary: PDFs that already contain optimized images or text may not become much smaller. Check the downloaded file to make sure it meets your needs.</p>

  <h2 style={{ textAlign: "center", marginTop: 36, marginBottom: 20 }}>Frequently Asked Questions</h2>
  <div style={{ display: "grid", gap: 20 }}>
    <div>
      <h3 style={{ marginBottom: 6 }}>How much smaller will my PDF become?</h3>
      <p style={{ marginTop: 0 }}>There is no fixed reduction percentage. The result depends on the images, text, and other content in the PDF.</p>
    </div>
    <div>
      <h3 style={{ marginBottom: 6 }}>Will compression affect PDF quality?</h3>
      <p style={{ marginTop: 0 }}>Compression may change the file's size or quality depending on its contents and the processing method. Review the downloaded PDF before sharing it.</p>
    </div>
    <div>
      <h3 style={{ marginBottom: 6 }}>Can I preview my PDF before compressing it?</h3>
      <p style={{ marginTop: 0 }}>Yes. After selecting a file, you can view its pages in the PDF preview area.</p>
    </div>
    <div>
      <h3 style={{ marginBottom: 6 }}>How do I download the compressed PDF?</h3>
      <p style={{ marginTop: 0 }}>When processing finishes, click “Download Compressed PDF” in the result card.</p>
    </div>
  </div>
</section>

</div>

)


}



export default Compress