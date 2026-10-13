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

message,

error,

loading

}=useUploadPDF()









// Convert PDF to Word

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

size:data.size || "Unknown"

})

)







setDownloadUrl(

`${import.meta.env.VITE_API_URL}/download/${encodeURIComponent(data.filename)}`

)





}



}





catch(error){



console.log(error)



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



onUpload={(files)=>{


setFile(files[0])


}}


/>









<button


className="secondary-btn"


onClick={uploadPDF}


>

Upload PDF

</button>









{

message && !downloadUrl &&



<div className="success-message">


✅ {message}


</div>


}









<button


className="primary-btn"


onClick={convertWord}


disabled={loading}


>


{


loading

?

"Converting..."

:

"Convert to Word"


}



</button>









{

loading &&



<div className="loading-box">


Processing PDF, please wait...


</div>


}









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
