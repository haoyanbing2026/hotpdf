import ToolHeader from "../components/ToolHeader"

import UploadBox from "../components/UploadBox"

import ResultCard from "../components/ResultCard"

import PDFThumbnail from "../components/PDFThumbnail"

import useMergePDF from "../hooks/useMergePDF"

import createPDFResult from "../utils/pdfResult"




function Merge(){



const {


files,

setFiles,

filename,

loading,

message,

error,

mergePDF


}=useMergePDF()





const API_URL = import.meta.env.VITE_API_URL







function handleUpload(selected){


setFiles(Array.from(selected || []))


}









function removeFile(index){


setFiles(prev =>

prev.filter((_,i)=>i!==index)

)


}









function moveUp(index){


if(index===0)return



setFiles(prev=>{


const list=[...prev]


;[list[index-1],list[index]]

=

[list[index],list[index-1]]


return list


})


}








function moveDown(index){


if(index >= files.length-1)return



setFiles(prev=>{


const list=[...prev]


;[list[index],list[index+1]]

=

[list[index+1],list[index]]


return list


})


}








return (


<div className="page">







<ToolHeader


icon="📎"


title="Merge PDF"


description="Combine multiple PDF files into one document."


/>









<UploadBox


multiple


onUpload={handleUpload}


/>









{

files.length>0 &&



<div className="file-manager">






<h3>

Arrange Your Files

</h3>






<p>

Use the arrows to change the order of your PDFs.

</p>







{

files.map((file,index)=>(



<div

className="merge-item"

key={`${file.name}-${file.size}-${index}`}

>



<PDFThumbnail

file={file}

/>






<div className="file-name">

📄 {file.name}

</div>








<div className="merge-actions">





<button

type="button"

onClick={()=>moveUp(index)}

disabled={index===0}

>

↑

</button>







<button

type="button"

onClick={()=>moveDown(index)}

disabled={index===files.length-1}

>

↓

</button>







<button

type="button"

onClick={()=>removeFile(index)}

>

Remove

</button>







</div>





</div>


))


}







<p className="merge-count">


{files.length} PDF files selected


</p>





</div>


}









<button


className="primary-btn"


onClick={mergePDF}


disabled={loading || files.length<2}


>



{

loading

?

"Merging PDFs..."

:

"Merge PDF"

}



</button>









{

message &&


<div className="success-message">


✅ {message}


</div>


}









{

error &&


<p

className="error-message"

role="alert"

>


⚠️ {error}


</p>


}









{

filename &&



<ResultCard


title="Merge completed!"


message="Your PDF files have been successfully combined."


info={createPDFResult({

filename:filename,

pages:"Combined document"

})}


downloadUrl={`${API_URL}/download/${encodeURIComponent(filename)}`}


downloadText="Download Merged PDF"



/>


}









</div>


)



}



export default Merge
