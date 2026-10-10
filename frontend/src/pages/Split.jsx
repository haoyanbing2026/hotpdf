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





// 上传PDF

async function uploadPDF(){


setMessage("")

setDownloadUrl("")

if(!file){


setMessage("请先选择PDF文件")


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



// 这里只提示上传成功

setMessage(
""
)


}
else{


setMessage(

"上传失败"

)


}


}







// 拆分PDF

async function splitPDF(){


if(!filename){


setMessage(

"请先上传PDF"

)


return


}



if(selectedPages.length===0){


setMessage(

"请选择页面"

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
"PDF拆分完成"
)



setResultInfo({

filename:data.filename,

pages:selectedPages.length,

size:data.size || "未知"

})



setDownloadUrl(

`${import.meta.env.VITE_API_URL}/download/${data.filename}`

)



}
else{


setMessage(

"拆分失败"

)


}


}




return (

<div className="page">


<h1>

✂️ PDF拆分

</h1>





<UploadBox


onUpload={(files)=>{


setFile(files[0])


}}


/>





<button

className="primary-btn"

onClick={uploadPDF}

>

上传PDF

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

选择拆分页面

</h3>




<div className="select-info">


已选择：

{

selectedPages.length===0

?

"未选择"

:

selectedPages.join("、")+" 页"

}



</div>





<div className="select-buttons">



<button


className="secondary-btn"


onClick={()=>{


setSelectedPages(pages)


}}


>

全选

</button>






<button


className="secondary-btn"


onClick={()=>{


setSelectedPages([])


}}


>

取消全部

</button>



</div>







<button


className="primary-btn"


onClick={splitPDF}


>

开始拆分

</button>




</div>


}









{

message &&



<ResultCard


title="拆分完成"


message="你的PDF已经成功拆分"


info={resultInfo}


downloadUrl={downloadUrl}


downloadText="下载拆分PDF"


/>


}




</div>


)


}



export default Split
