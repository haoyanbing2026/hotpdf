import { useState } from "react"

import UploadBox from "../components/UploadBox"

import ResultCard from "../components/ResultCard"



function Convert(){


const [file,setFile] = useState(null)


const [filename,setFilename] = useState("")


const [message,setMessage] = useState("")


const [downloadUrl,setDownloadUrl] = useState("")


const [resultInfo,setResultInfo] = useState({})


const [loading,setLoading] = useState(false)





// 上传PDF

async function uploadPDF(){


if(!file){


setMessage(
"请先选择PDF文件"
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



console.log(data)



if(data.filename){


setFilename(data.filename)


setMessage(
"上传成功，可以开始转换"
)


}

else{


setMessage(
"上传失败"
)


}



}

catch(error){


console.log(error)


setMessage(
"服务器连接失败"
)


}



}








// 转换Word

async function convertWord(){



if(!filename){


setMessage(
"请先上传PDF"
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



console.log(data)




if(data.filename){



setMessage(
"PDF已经成功转换为Word"
)




setResultInfo({


filename:data.filename,


size:data.size || "未知"


})





setDownloadUrl(


`${import.meta.env.VITE_API_URL}/download/${data.filename}`


)




}

else{


setMessage(

data.message || "转换失败"

)


}



}


catch(error){


console.log(error)


setMessage(
"转换失败"
)


}



setLoading(false)



}









return (


<div className="page">



<h1>

📝 PDF转Word

</h1>





<UploadBox


onUpload={(files)=>{


setFile(files[0])


setMessage("")


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

上传PDF

</button>






<button


className="primary-btn"


onClick={convertWord}


disabled={loading}


>


{

loading

?

"正在转换..."

:

"开始转换"

}


</button>








{

loading &&


<div className="loading-box">


正在处理PDF，请稍候...


</div>


}









{

message &&


<ResultCard


title={

downloadUrl

?

"🎉 转换完成"

:

"提示"

}



message={message}



info={resultInfo}



downloadUrl={downloadUrl}



downloadText="下载Word文件"



/>


}



</div>


)





}


export default Convert
