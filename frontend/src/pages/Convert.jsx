import { useState } from "react"

import ToolHeader from "../components/ToolHeader"

import UploadBox from "../components/UploadBox"

import ResultCard from "../components/ResultCard"

import useUploadPDF from "../hooks/useUploadPDF"

import createPDFResult from "../utils/pdfResult"





function Convert(){



const [downloadUrl,setDownloadUrl] = useState("")


const [resultInfo,setResultInfo] = useState({})







const {

file,

setFile,

filename,

uploadPDF,

loading,

progress,

error

}=useUploadPDF()







async function convertWord(){



setDownloadUrl("")



if(!filename){

return

}






try{



const res = await fetch(

`${import.meta.env.VITE_API_URL}/convert_word?filename=${encodeURIComponent(filename)}`,

{

method:"POST"

}

)







const data = await res.json()







if(data.filename){





setResultInfo(

createPDFResult({

filename:data.filename,

size:data.size || ""

})

)







setDownloadUrl(

`${import.meta.env.VITE_API_URL}/download/${encodeURIComponent(data.filename)}`

)





}



}



catch(err){


console.log(err)


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



onUpload={(file)=>{


setFile(file)


}}


/>








<button


className="secondary-btn"


onClick={uploadPDF}


disabled={loading}


>


Upload PDF


</button>








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








<button


className="primary-btn"


onClick={convertWord}


disabled={loading || !filename}


>



Convert to Word



</button>









{

error &&



<div className="error-message">


⚠️ {error}


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
