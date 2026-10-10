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

拖放PDF文件到这里

</h3>



<p>

或者点击选择文件

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

选择文件

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
