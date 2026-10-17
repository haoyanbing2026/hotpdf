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




<section
  aria-labelledby="merge-guide-title"
  style={{ maxWidth: "760px", margin: "72px auto 48px", padding: "0 20px", textAlign: "left", lineHeight: 1.7 }}
>
  <h2 id="merge-guide-title" style={{ textAlign: "center", marginBottom: "16px" }}>
    How to Merge PDF Files Online
  </h2>
  <p>
    Combine two or more PDF files into one document with HotPDF. Arrange the files
    in the order you want, review their previews, and download the merged PDF.
  </p>
  <ol style={{ paddingLeft: "24px", margin: "20px 0 36px" }}>
    <li><strong>Choose PDF files.</strong> Select at least two PDF documents to combine.</li>
    <li><strong>Set the file order.</strong> Use the up and down arrows to arrange the PDFs.</li>
    <li><strong>Review the previews.</strong> Check the selected documents before merging.</li>
    <li><strong>Merge and download.</strong> Click “Merge PDF”, then download the combined file.</li>
  </ol>

  <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
    Combine PDFs in Your Preferred Order
  </h2>
  <p style={{ marginBottom: "36px" }}>
    Merging PDFs can help you keep related documents together, such as class notes,
    project materials, or multiple sections of a report. HotPDF lets you change
    the file order before creating a single PDF, so you can organize the final
    document to match your needs.
  </p>

  <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
    Frequently Asked Questions
  </h2>
  <div style={{ display: "grid", gap: "22px" }}>
    <div>
      <h3 style={{ marginBottom: "6px" }}>How many PDF files do I need to merge?</h3>
      <p>Select at least two PDF files to use the merge tool.</p>
    </div>
    <div>
      <h3 style={{ marginBottom: "6px" }}>Can I change the order of the PDFs?</h3>
      <p>Yes. Use the up and down arrows in the file list to arrange your PDFs before merging.</p>
    </div>
    <div>
      <h3 style={{ marginBottom: "6px" }}>Can I preview the files before merging?</h3>
      <p>Yes. The PDF preview area lets you review the files you selected.</p>
    </div>
    <div>
      <h3 style={{ marginBottom: "6px" }}>How do I download the merged PDF?</h3>
      <p>After the merge is complete, click “Download Merged PDF” to save the result.</p>
    </div>
  </div>
</section>






</div>

)


}



export default Merge