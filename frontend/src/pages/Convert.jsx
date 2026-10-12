import { useState } from "react"

import UploadBox from "../components/UploadBox"

import ResultCard from "../components/ResultCard"



function Convert(){


const [file,setFile] = useState(null)


const [filename,setFilename] = useState("")


const [message,setMessage] = useState("")


const [error,setError] = useState("")


const [downloadUrl,setDownloadUrl] = useState("")


const [resultInfo,setResultInfo] = useState({})


const [loading,setLoading] = useState(false)






// Upload PDF

async function uploadPDF(){


setError("")

setMessage("")

setDownloadUrl("")



if(!file){


setError(
"Please select a PDF file first."
)


return


}



const formData = new FormData()



formData.append(

"file",

file

)





try{


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


setMessage(

"Upload completed. Ready to convert."

)


}

else{


setError(

"Upload failed."

)


}



}

catch(error){


console.log(error)


setError(

"Server connection failed."

)


}



}








// Convert PDF to Word

async function convertWord(){



setError("")



if(!filename){


setError(

"Please upload a PDF first."

)


return


}




setLoading(true)


setMessage("")





try{


const res = await fetch(


`${import.meta.env.VITE_API_URL}/convert_word?filename=${encodeURIComponent(filename)}`,

{

method:"POST"

}


)





const data = await res.json()





if(data.filename){



setMessage(

"PDF has been successfully converted to Word."

)



setResultInfo({


filename:data.filename,


size:data.size || "Unknown"


})





setDownloadUrl(


`${import.meta.env.VITE_API_URL}/download/${data.filename}`


)




}

else{


setError(

data.message || "Conversion failed."

)


}



}


catch(error){


console.log(error)


setError(

"Conversion failed."

)


}



setLoading(false)



}









return (


<div className="page">



<h1 className="tool-title">

📝 Convert PDF to Word

</h1>


<p className="tool-subtitle">

Turn PDF documents into editable Word files.

</p>






<UploadBox


onUpload={(files)=>{


setFile(files[0])


setMessage("")

setError("")


}}


/>







{

file &&


<div className="file-selected">


📄 {file.name}


</div>


}







<button


className="secondary-btn"


onClick={uploadPDF}


>

Upload PDF

</button>







<button


className="primary-btn"


onClick={convertWord}


disabled={loading}


>


{

loading

?

"Converting..."

:

"Convert to Word"

}


</button>









{

loading &&


<div className="loading-box">


Processing PDF, please wait...


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


title="🎉 Conversion completed"


message={message}


info={resultInfo}


downloadUrl={downloadUrl}


downloadText="Download Word File"


/>


}



</div>


)





}


export default Convert
