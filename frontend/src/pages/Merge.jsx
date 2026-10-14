import { useRef, useState } from "react"

import axios from "axios"

import ToolHeader from "../components/ToolHeader"

import UploadBox from "../components/UploadBox"

import MultiPDFPreview from "../components/MultiPDFPreview"

import ResultCard from "../components/ResultCard"

import createPDFResult from "../utils/pdfResult"



const API_URL = import.meta.env.VITE_API_URL






function Merge(){



const actionRef = useRef(null)





const [files,setFiles] = useState([])

const [progress,setProgress] = useState(0)

const [loading,setLoading] = useState(false)

const [resultInfo,setResultInfo] = useState({})

const [downloadUrl,setDownloadUrl] = useState("")

const [error,setError] = useState("")









function scrollToAction(){


setTimeout(()=>{


actionRef.current?.scrollIntoView({

behavior:"smooth",

block:"center"

})


},300)


}









function handleFiles(selectedFiles){



setFiles(selectedFiles)


setResultInfo({})

setDownloadUrl("")

setError("")



scrollToAction()



}









function moveUp(index){


if(index===0)return



const list=[...files]


const temp=list[index]


list[index]=list[index-1]


list[index-1]=temp



setFiles(list)



}









function moveDown(index){



if(index===files.length-1)return



const list=[...files]


const temp=list[index]


list[index]=list[index+1]


list[index+1]=temp



setFiles(list)



}









async function mergePDF(){



setError("")

setResultInfo({})

setDownloadUrl("")





if(files.length<2){


setError(

"Please select at least two PDF files."

)


return


}






setLoading(true)

setProgress(0)







try{



const formData=new FormData()





files.forEach(file=>{


formData.append(

"files",

file

)


})






const res=await axios.post(

`${API_URL}/merge`,

formData,

{


onUploadProgress:(event)=>{


if(event.total){


setProgress(

Math.round(

event.loaded*100/event.total

)

)


}



}



}

)






const data=res.data






if(data.filename){



setResultInfo(

createPDFResult({

filename:data.filename,

pages:data.pages || "",

size:data.size || ""

})

)



setDownloadUrl(

`${API_URL}/download/${encodeURIComponent(data.filename)}`

)



}

else{


throw new Error(

"Merge failed."

)


}



}

catch(err){


setError(

err.message || "Merge failed."

)


}

finally{


setLoading(false)


}



}









return (

<div className="page">






<ToolHeader

icon="📎"

title="Merge PDF"

description="Combine multiple PDF files into one document."

/>









<UploadBox

multiple={true}

onUpload={handleFiles}

/>









{

files.length>0 &&


<>





<div

ref={actionRef}

className="merge-file-list"

>



<h3>

File order

</h3>







{

files.map((file,index)=>(



<div

className="merge-file-item"

key={index}

>



<span>

📄 {file.name}

</span>






<div>



<button

className="small-btn"

onClick={()=>moveUp(index)}

disabled={index===0}

>

↑

</button>








<button

className="small-btn"

onClick={()=>moveDown(index)}

disabled={index===files.length-1}

>

↓

</button>



</div>



</div>



))

}






</div>









<div className="merge-preview-area">


<h3>

PDF Preview

</h3>



<MultiPDFPreview

files={files}

/>



</div>







</>

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









<button

className="primary-btn"

onClick={mergePDF}

disabled={loading}

>

{

loading

?

"Merging..."

:

"Merge PDF"

}



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

title="🎉 Merge completed"

message="Your PDF files have been merged successfully."

info={resultInfo}

downloadUrl={downloadUrl}

downloadText="Download Merged PDF"

/>


}







</div>

)


}



export default Merge