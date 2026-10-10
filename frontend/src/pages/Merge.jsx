import { useState } from "react"

import UploadBox from "../components/UploadBox"

import ResultCard from "../components/ResultCard"

import PDFThumbnail from "../components/PDFThumbnail"


function Merge(){


const [files,setFiles]=useState([])


const [message,setMessage]=useState("")


const [downloadUrl,setDownloadUrl]=useState("")


const [resultInfo,setResultInfo]=useState({})





function handleUpload(selected){


setFiles(selected)


}





// 删除文件

function removeFile(index){


const list=[...files]


list.splice(index,1)


setFiles(list)


}






// 上移

function moveUp(index){


if(index===0)return



const list=[...files]


const temp=list[index]


list[index]=list[index-1]


list[index-1]=temp



setFiles(list)


}






// 下移

function moveDown(index){


if(index===files.length-1)return



const list=[...files]


const temp=list[index]


list[index]=list[index+1]


list[index+1]=temp



setFiles(list)


}








async function mergePDF(){


if(files.length<2){


setMessage(

"请至少选择两个PDF文件"

)


return


}





const formData=new FormData()



files.forEach(file=>{


formData.append(

"files",

file

)


})





const res=await fetch(

`${import.meta.env.VITE_API_URL}/merge`,

{

method:"POST",

body:formData

}

)





const data=await res.json()





if(data.filename){


setMessage(

"PDF合并完成"

)



setResultInfo({

filename:data.filename,

size:data.size

})



setDownloadUrl(

`${import.meta.env.VITE_API_URL}/download/${data.filename}`

)


}



}



return (

<div className="page">


<h1>

📎 PDF合并

</h1>





<UploadBox

multiple

onUpload={handleUpload}

/>






{

files.length>0 &&


<div className="file-manager">



<h3>

文件顺序

</h3>





{

files.map((file,index)=>(



<div className="merge-item">


<PDFThumbnail

file={file}

/>



<div className="file-name">


📄 {file.name}


</div>





<div>


<button
onClick={()=>moveUp(index)}
>
↑
</button>


<button
onClick={()=>moveDown(index)}
>
↓
</button>


<button
onClick={()=>removeFile(index)}
>
删除
</button>


</div>


<span>

📄 {file.name}

</span>




<div>



<button

onClick={()=>moveUp(index)}

>

↑

</button>



<button

onClick={()=>moveDown(index)}

>

↓

</button>



<button

onClick={()=>removeFile(index)}

>

删除

</button>


</div>


</div>



))

}



</div>


}






<button

className="primary-btn"

onClick={mergePDF}

>

开始合并

</button>








{

message &&


<ResultCard


title="🎉 合并完成"


message={message}


info={resultInfo}


downloadUrl={downloadUrl}


downloadText="下载合并PDF"


/>


}



</div>

)


}


export default Merge
