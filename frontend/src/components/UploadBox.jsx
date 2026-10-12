import { useState } from "react"



function UploadBox({

    onUpload,

    multiple=false,

    accept=".pdf"

}){


const [files,setFiles]=useState([])


const [drag,setDrag]=useState(false)





function selectFiles(e){


const selected = Array.from(

e.target.files

)



setFiles(selected)



if(onUpload){

onUpload(selected)

}


}





function dropFiles(e){


e.preventDefault()



setDrag(false)



const dropped = Array.from(

e.dataTransfer.files

)



setFiles(dropped)



if(onUpload){

onUpload(dropped)

}


}







return (

<div

className={

drag

?

"upload-box drag"

:

"upload-box"

}



onDragOver={(e)=>{


e.preventDefault()

setDrag(true)


}}



onDragLeave={()=>setDrag(false)}



onDrop={dropFiles}


>




<div className="upload-icon">

📂

</div>





<h3>

Drop your PDF file here

</h3>




<p>

or click to select a file

</p>






<input


id="pdf-upload"


type="file"


accept={accept}


multiple={multiple}


onChange={selectFiles}


/>





<label

htmlFor="pdf-upload"


className="primary-btn"

>

Choose File

</label>








{

files.length>0 &&


<div className="file-list">


{

files.map((file,index)=>(


<p key={index}>

📄 {file.name}

</p>


))


}


</div>


}





</div>

)


}


export default UploadBox
