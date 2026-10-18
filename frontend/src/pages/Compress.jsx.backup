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









function handleFile(file){



setFile(file)


setPreviewFile(file)


setResultInfo({})


setDownloadUrl("")


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





const data = await uploadPDF()



if(!data?.filename){

return

}







setCompressing(true)







try{



const res = await fetch(

`${import.meta.env.VITE_API_URL}/compress?filename=${encodeURIComponent(data.filename)}`,

{

method:"POST"

}

)







const result = await res.json()







if(result.filename){



setResultInfo(

createPDFResult({

filename:result.filename,

originalSize:

result.original_size || "",

compressedSize:

result.compressed_size || "",

saved:

result.saved || ""

})

)







setDownloadUrl(

`${import.meta.env.VITE_API_URL}/download/${encodeURIComponent(result.filename)}`

)



}

else{


throw new Error(

"Compression failed."

)


}



}

catch(err){


setError(

err.message || "Compression failed."

)


}

finally{


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

(uploadError || error) &&


<div className="error-message">


⚠️ {uploadError || error}


</div>


}









{

downloadUrl &&



<ResultCard

title="🎉 Compression completed"

message="Your PDF has been compressed successfully."

info={resultInfo}

downloadUrl={downloadUrl}

downloadText="Download Compressed PDF"

/>



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