import { useRef, useState } from "react"
import axios from "axios"



function UploadBox({

    onUpload,

    multiple=false

}){


const inputRef = useRef(null)


const [dragging,setDragging] = useState(false)


const [files,setFiles] = useState([])


const [error,setError] = useState("")


const [progress,setProgress] = useState(0)







function handleFiles(selectedFiles){



const fileArray = Array.from(selectedFiles)



const pdfFiles = fileArray.filter(

file => file.type === "application/pdf"

)






if(pdfFiles.length===0){


setError(

"Please select PDF files only."

)


return


}







setError("")


setProgress(0)


setFiles(pdfFiles)






onUpload(

multiple

?

pdfFiles

:

pdfFiles[0]

)



}









function handleChange(e){


handleFiles(e.target.files)


}









function handleDrop(e){


e.preventDefault()


setDragging(false)


handleFiles(e.dataTransfer.files)


}









function removeFiles(){



setFiles([])


setProgress(0)


setError("")



onUpload(

multiple

?

[]

:

null

)


}









async function uploadWithProgress(url,formData){



try{



await axios.post(

url,

formData,

{

onUploadProgress:(event)=>{


const percent=Math.round(

(event.loaded * 100) /

event.total

)


setProgress(percent)



}

}

)



}

catch(err){


setError(

"Upload failed."

)


}






}









return (


<div

className={

`upload-box ${dragging ? "dragging":""}`

}


onDragOver={(e)=>{


e.preventDefault()

setDragging(true)


}}


onDragLeave={()=>setDragging(false)}


onDrop={handleDrop}



>







<div className="upload-icon">

📄

</div>







<h3>

Drop your PDF file here

</h3>







<p>

or click to select a file

</p>







<button

className="file-select-btn"

onClick={()=>inputRef.current.click()}

>

Choose File

</button>







<input

ref={inputRef}

type="file"

accept="application/pdf"

multiple={multiple}

hidden

onChange={handleChange}

/>








{

files.length>0 &&


<div className="selected-files">



{

files.map((file,index)=>(


<div

className="selected-file"

key={index}

>


📄 {file.name}


</div>


))


}







<button

className="upload-action-btn"

onClick={removeFiles}

>

Remove

</button>





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









{

progress===100 &&



<div className="success-message">

Upload completed

</div>


}









{

error &&


<div className="error-message">


⚠️ {error}

</div>


}







</div>


)


}



export default UploadBox
