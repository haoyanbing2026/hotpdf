import { useRef, useState } from "react"

import ToolHeader from "../components/ToolHeader"

import UploadBox from "../components/UploadBox"

import PDFPreview from "../components/PDFPreview"

import ResultCard from "../components/ResultCard"

import createPDFResult from "../utils/pdfResult"

import useUploadPDF from "../hooks/useUploadPDF"





function Split(){



const uploadButtonRef = useRef(null)

const splitButtonRef = useRef(null)





const {

file,

setFile,

filename,

pages,

uploadPDF,

loading,

progress,

error:uploadError

}=useUploadPDF()






const [uploaded,setUploaded] = useState(false)

const [selectedPages,setSelectedPages] = useState([])

const [resultInfo,setResultInfo] = useState({})

const [downloadUrl,setDownloadUrl] = useState("")

const [error,setError] = useState("")









function handleFile(selectedFile){



setFile(selectedFile)


setUploaded(false)

setSelectedPages([])

setResultInfo({})

setDownloadUrl("")

setError("")





setTimeout(()=>{


if(uploadButtonRef.current){



const buttonTop =

uploadButtonRef.current.getBoundingClientRect().top

+

window.pageYOffset



window.scrollTo({


top:

buttonTop

-

window.innerHeight

+

100,


behavior:"smooth"


})


}



},300)



}









async function handleUpload(){



const data = await uploadPDF()



if(data?.filename){


setUploaded(true)





setTimeout(()=>{


if(splitButtonRef.current){



const buttonTop =

splitButtonRef.current.getBoundingClientRect().top

+

window.pageYOffset





window.scrollTo({


top:

buttonTop

-

window.innerHeight

+

150,


behavior:"smooth"


})


}



},800)



}



}









async function splitPDF(){



setError("")



if(!uploaded){


setError(

"Please upload PDF first."

)


return


}






if(selectedPages.length===0){


setError(

"Please select pages."

)


return


}







try{



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

size:data.size || ""

})

)







setDownloadUrl(

`${import.meta.env.VITE_API_URL}/download/${encodeURIComponent(data.filename)}`

)



}

else{


throw new Error(

"Split failed."

)


}



}

catch(err){


setError(

err.message || "Split failed."

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


onUpload={handleFile}


/>









<button


ref={uploadButtonRef}


className="secondary-btn"


onClick={handleUpload}


disabled={loading}


>

{

loading

?

"Uploading..."

:

"Upload PDF"

}


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









{

uploaded &&


<PDFPreview


file={file}


selectedPages={selectedPages}


setSelectedPages={setSelectedPages}


/>


}









{

pages.length>0 &&



<div

className="select-area"

>



<h3>

Select pages to split

</h3>







<div className="select-info">


Selected:

{

selectedPages.length

}

page(s)

</div>







<button


className="secondary-btn"


onClick={()=>setSelectedPages(pages)}


>

Select All

</button>







<button


className="secondary-btn"


onClick={()=>setSelectedPages([])}


>

Clear Selection

</button>







<button


ref={splitButtonRef}


className="primary-btn"


onClick={splitPDF}


>

Split PDF

</button>







</div>


}









{

(uploadError || error) &&



<div className="error-message">


⚠️ {uploadError || error}


</div>


}









{

downloadUrl &&



<ResultCard


title="🎉 Split completed"


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