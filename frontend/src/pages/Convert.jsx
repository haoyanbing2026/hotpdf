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







</div>

)


}



export default Convert