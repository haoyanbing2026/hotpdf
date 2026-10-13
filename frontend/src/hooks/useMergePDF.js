import { useState } from "react"



function useMergePDF(){


const [files,setFiles] = useState([])


const [loading,setLoading] = useState(false)


const [filename,setFilename] = useState("")


const [message,setMessage] = useState("")


const [error,setError] = useState("")







async function mergePDF(){



if(files.length < 2){


setError(
"Please select at least two PDF files."
)


return null


}




setLoading(true)

setError("")

setMessage("")





try{



const formData = new FormData()





files.forEach(file=>{


formData.append(

"files",

file

)


})







const res = await fetch(


`${import.meta.env.VITE_API_URL}/merge`,

{

method:"POST",

body:formData

}


)







const data = await res.json()






if(data.filename){



setFilename(data.filename)



setMessage(

"Merge completed."

)



return data



}


else{


setError(

"Merge failed."

)


}



}



catch(err){


console.log(err)



setError(

"Server connection failed."

)


}




finally{


setLoading(false)


}



}







return {


files,

setFiles,


filename,


loading,


message,


error,


mergePDF


}



}



export default useMergePDF