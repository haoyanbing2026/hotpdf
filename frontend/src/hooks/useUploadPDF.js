import { useState } from "react"



function useUploadPDF(){



const [file,setFile] = useState(null)



const [filename,setFilename] = useState("")



const [pages,setPages] = useState([])



const [size,setSize] = useState(0)



const [loading,setLoading] = useState(false)



const [message,setMessage] = useState("")



const [error,setError] = useState("")







async function uploadPDF(){



if(!file){


setError(
"Please select a PDF file first."
)


return null


}





setLoading(true)


setError("")

setMessage("")






try{



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



setSize(data.size)






// convert page number to array

const pageList=[]



for(

let i=1;

i<=data.pages;

i++

){

pageList.push(i)

}





setPages(pageList)






setMessage(

"Upload completed."

)






return data



}



else{



setError(

"Upload failed."

)



return null


}



}






catch(err){



console.log(err)



setError(

"Server connection failed."

)



return null



}






finally{


setLoading(false)


}



}







return {


file,

setFile,


filename,


pages,


size,


loading,


message,


error,


uploadPDF


}



}



export default useUploadPDF