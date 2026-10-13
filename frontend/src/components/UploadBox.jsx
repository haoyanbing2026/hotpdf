import { useRef, useState } from "react"



function UploadBox({

    onUpload,

    multiple=false

}){


const inputRef = useRef(null)



const [dragging,setDragging] = useState(false)

const [files,setFiles] = useState([])

const [error,setError] = useState("")







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


setError("")



onUpload(

multiple

?

[]

:

null

)



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



onDragLeave={()=>{


setDragging(false)


}}



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


type="button"


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


type="button"


className="upload-action-btn"


onClick={removeFiles}


>

Remove

</button>





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