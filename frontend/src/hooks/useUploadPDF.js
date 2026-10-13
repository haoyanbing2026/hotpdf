import { useState } from "react"

import axios from "axios"



function useUploadPDF(){



const [file,setFile] = useState(null)


const [filename,setFilename] = useState("")


const [pages,setPages] = useState([])


const [size,setSize] = useState(0)


const [loading,setLoading] = useState(false)


const [progress,setProgress] = useState(0)


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


setProgress(0)








try{



const formData = new FormData()


formData.append(

"file",

file

)








const res = await axios.post(

`${import.meta.env.VITE_API_URL}/upload`,

formData,

{


onUploadProgress:(event)=>{


if(event.total){



const percent=Math.round(

(event.loaded * 100) /

event.total

)



setProgress(percent)



}



}



}

)








const data=res.data







if(data.filename){



setFilename(data.filename)


setSize(data.size || 0)






const pageList=[]



for(

let i=1;

i<=data.pages;

i++

){


pageList.push(i)


}



setPages(pageList)







return data



}

else{


throw new Error(

"Upload failed."

)


}



}

catch(err){



setError(

err.message || "Upload failed."

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


progress,


error,


uploadPDF



}



}



export default useUploadPDF