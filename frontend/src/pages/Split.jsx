import { useState } from "react"

import ToolHeader from "../components/ToolHeader"

import UploadBox from "../components/UploadBox"

import PDFPreview from "../components/PDFPreview"

import ResultCard from "../components/ResultCard"

import useUploadPDF from "../hooks/useUploadPDF"

import createPDFResult from "../utils/pdfResult"



function Split(){



const {

file,

setFile,

filename,

pages,

message,

error,

uploadPDF

}=useUploadPDF()





const [selectedPages,setSelectedPages] = useState([])


const [resultInfo,setResultInfo] = useState({})


const [downloadUrl,setDownloadUrl] = useState("")







// Split PDF

async function splitPDF(){



if(!filename){


return


}





if(selectedPages.length===0){


return


}






const res = await fetch(

`${import.meta.env.VITE_API_URL}/split?filename=${encodeURIComponent(filename)}&pages=${selectedPages.join(",")}`,

{

method:"POST"

}

)






const data = await res.json()





if(data.filename){



setResultInfo(

createPDFResult({

filename:data.filename,

pages:selectedPages.length,

size:data.size

})

)





setDownloadUrl(

`${import.meta.env.VITE_API_URL}/download/${data.filename}`

)



}



}









return (


<div className="page">






<ToolHeader


icon="✂️"


title="Split PDF"


description="Extract selected pages from your PDF quickly and easily."

/>









<UploadBox


onUpload={(files)=>{


setFile(files[0])


}}


/>









<button


className="primary-btn"


onClick={uploadPDF}


>

Upload PDF

</button>









{

file &&


<PDFPreview


file={file}


selectedPages={selectedPages}


setSelectedPages={setSelectedPages}


/>


}









{

pages.length > 0 &&


<div className="select-area">



<h3>

Select pages to split

</h3>



<p className="select-tip">

Choose the pages you want to extract.

</p>







<div className="select-info">


Selected pages:


{

selectedPages.length===0

?

"No pages selected"

:

selectedPages.join(", ")+" page(s)"

}



</div>









<div className="select-buttons">



<button


className="secondary-btn"


onClick={()=>{


setSelectedPages(pages)


}}


>

Select All

</button>







<button


className="secondary-btn"


onClick={()=>{


setSelectedPages([])


}}


>

Clear Selection

</button>



</div>









<button


className="primary-btn"


onClick={splitPDF}


>

Split PDF

</button>





</div>


}









{

message &&


<div className="success-message">


✅ {message}

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


title="Split completed"


message="Your PDF has been successfully split."


info={resultInfo}


downloadUrl={downloadUrl}


downloadText="Download Split PDF"



/>


}







</div>


)


}



export default Split
