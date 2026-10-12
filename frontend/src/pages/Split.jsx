import { useState } from "react"

import UploadBox from "../components/UploadBox"

import PDFPreview from "../components/PDFPreview"

import ResultCard from "../components/ResultCard"



function Split(){


const [file,setFile] = useState(null)


const [filename,setFilename] = useState("")


const [pages,setPages] = useState([])


const [selectedPages,setSelectedPages] = useState([])


const [message,setMessage] = useState("")


const [resultInfo,setResultInfo] = useState({})


const [downloadUrl,setDownloadUrl] = useState("")





// Upload PDF

async function uploadPDF(){


setMessage("")

setDownloadUrl("")


if(!file){


setMessage(
"Please select a PDF file first."
)


return


}



const formData = new FormData()


formData.append(

"file",

file

)




const res = await fetch(

`${import.meta.env.VITE_API_URL}/upload`,

{

method:"POST",

body:formData

}

)




const data = await res.json()



if(data.filename){


setFilename(data.filename)



const pageList=[]


for(
let i=1;
i<=data.pages;
i++
){

pageList.push(i)

}



setPages(pageList)



setMessage("")



}
else{


setMessage(

"Upload failed."

)


}


}








// Split PDF

async function splitPDF(){


if(!filename){


setMessage(

"Please upload a PDF first."

)


return


}



if(selectedPages.length===0){


setMessage(

"Please select pages to split."

)


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


setMessage(
"PDF split completed."
)



setResultInfo({

filename:data.filename,

pages:selectedPages.length,

size:data.size || "Unknown"

})



setDownloadUrl(

`${import.meta.env.VITE_API_URL}/download/${data.filename}`

)



}
else{


setMessage(

"Split failed."

)


}


}






return (

<div className="page">



<h1 className="tool-title">

✂️ Split PDF

</h1>


<p className="tool-subtitle">

Extract selected pages from your PDF quickly and easily.

</p>




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

pages.length>0 &&


<div className="select-area">





<h3>

Select pages to split

</h3>






<div className="select-info">


Selected:

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
