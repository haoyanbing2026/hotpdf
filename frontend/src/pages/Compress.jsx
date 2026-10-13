import { useRef, useState } from "react"

import ToolHeader from "../components/ToolHeader"

import UploadBox from "../components/UploadBox"

import ResultCard from "../components/ResultCard"

import createPDFResult from "../utils/pdfResult"

import useUploadPDF from "../hooks/useUploadPDF"





function Compress(){



const actionRef = useRef(null)





const {

filename,

setFile,

uploadPDF,

loading,

progress,

error:uploadError

}=useUploadPDF()






const [resultInfo,setResultInfo] = useState({})


const [downloadUrl,setDownloadUrl] = useState("")


const [compressing,setCompressing] = useState(false)


const [error,setError] = useState("")









function handleFile(file){



setFile(file)


setResultInfo({})

setDownloadUrl("")

setError("")



setTimeout(()=>{


actionRef.current?.scrollIntoView({

behavior:"smooth",

block:"center"

})


},300)



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


throw new Error("Compression failed.")

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









</div>


)



}



export default Compress