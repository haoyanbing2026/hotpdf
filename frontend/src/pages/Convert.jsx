import { useRef, useState } from "react"

import ToolHeader from "../components/ToolHeader"

import UploadBox from "../components/UploadBox"

import PDFPreview from "../components/PDFPreview"

import ResultCard from "../components/ResultCard"

import createPDFResult from "../utils/pdfResult"

import useUploadPDF from "../hooks/useUploadPDF"





function Convert(){



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

const [converting,setConverting] = useState(false)

const [error,setError] = useState("")









function handleFile(file){



setFile(file)


setPreviewFile(file)


setResultInfo({})


setDownloadUrl("")


setError("")





/*
 等待 PDFPreview 渲染完成
 然后滚动到 Convert 按钮
*/


setTimeout(()=>{


actionRef.current?.scrollIntoView({

behavior:"smooth",

block:"center"

})


},1000)



}









async function convertWord(){



setError("")


setResultInfo({})


setDownloadUrl("")





const data = await uploadPDF()



if(!data?.filename){

return

}







setConverting(true)







try{



const res = await fetch(

`${import.meta.env.VITE_API_URL}/convert_word?filename=${encodeURIComponent(data.filename)}`,

{

method:"POST"

}

)







const result = await res.json()







if(result.filename){



setResultInfo(

createPDFResult({

filename:result.filename,

size:result.size || ""

})

)







setDownloadUrl(

`${import.meta.env.VITE_API_URL}/download/${encodeURIComponent(result.filename)}`

)



}

else{


throw new Error(

"Conversion failed."

)


}





}

catch(err){


setError(

err.message || "Conversion failed."

)


}

finally{


setConverting(false)


}



}









return (

<div className="page">






<ToolHeader

icon="📝"

title="Convert PDF to Word"

description="Turn PDF documents into editable Word files."

/>









<UploadBox

onUpload={handleFile}

/>









{

previewFile &&


<div

className="convert-preview-area"

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

onClick={convertWord}

disabled={loading || converting}

>



{

loading

?

"Uploading..."

:

converting

?

"Converting..."

:

"Convert to Word"



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

title="🎉 Conversion completed"

message="Your PDF has been converted successfully."

info={resultInfo}

downloadUrl={downloadUrl}

downloadText="Download Word File"

/>



}








<section
  aria-label="PDF to Word conversion guide"
  style={{
    width: "min(100% - 32px, 720px)",
    margin: "64px auto 80px",
    textAlign: "left",
    lineHeight: 1.75
  }}
>
  <h2 style={{ textAlign: "center", marginBottom: 16 }}>How to Convert PDF to Word Online</h2>
  <p>
    Use HotPDF to turn a PDF document into a downloadable Word file. Preview your PDF before
    converting it, then download the result when processing is complete.
  </p>
  <ol style={{ paddingLeft: 24 }}>
    <li><strong>Choose your PDF.</strong> Upload the PDF document you want to convert.</li>
    <li><strong>Check the preview.</strong> Review the PDF pages before starting.</li>
    <li><strong>Convert to Word.</strong> Click “Convert to Word” and wait for the conversion to finish.</li>
    <li><strong>Download your file.</strong> Click “Download Word File” when the result appears.</li>
  </ol>

  <h2 style={{ textAlign: "center", marginTop: 36, marginBottom: 16 }}>Convert PDF Documents into Word Files</h2>
  <p>
    PDF to Word conversion can help when you need to revise a report, update a document,
    or reuse text in a Word editor. The converted document may need some formatting
    adjustments, especially if the original PDF contains complex tables, columns,
    scanned pages, or unusual fonts.
  </p>

  <h2 style={{ textAlign: "center", marginTop: 36, marginBottom: 20 }}>Frequently Asked Questions</h2>
  <div style={{ display: "grid", gap: 20 }}>
    <div>
      <h3 style={{ marginBottom: 6 }}>Can I edit the converted Word document?</h3>
      <p style={{ marginTop: 0 }}>
        The tool creates a Word file for use in a compatible editor. How editable the
        content is depends on how the original PDF was created.
      </p>
    </div>
    <div>
      <h3 style={{ marginBottom: 6 }}>Will the Word file look exactly like the PDF?</h3>
      <p style={{ marginTop: 0 }}>
        Not always. Fonts, page layouts, images, and tables may appear differently
        after conversion. Review the downloaded document before using it.
      </p>
    </div>
    <div>
      <h3 style={{ marginBottom: 6 }}>Can I preview the PDF before converting?</h3>
      <p style={{ marginTop: 0 }}>
        Yes. After selecting your PDF, its pages appear in the preview area.
      </p>
    </div>
    <div>
      <h3 style={{ marginBottom: 6 }}>Does this tool convert Word files back to PDF?</h3>
      <p style={{ marginTop: 0 }}>
        This page converts PDF files to Word. It does not offer Word-to-PDF conversion.
      </p>
    </div>
  </div>
</section>

</div>

)


}



export default Convert