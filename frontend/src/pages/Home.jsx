import {

useNavigate

} from "react-router-dom"


import ToolCard from "../components/ToolCard"



function Home(){


const navigate=useNavigate()



return (

<div className="home">


<h1>

📄 PDF工具箱

</h1>


<p>

快速、安全处理PDF文件

</p>



<div className="tools">



<ToolCard

icon="✂️"

title="PDF拆分"

desc="选择页面拆分PDF"

onClick={()=>navigate("/split")}

/>




<ToolCard

icon="📎"

title="PDF合并"

desc="多个文件合并"

onClick={()=>navigate("/merge")}

/>




<ToolCard

icon="📝"

title="PDF转Word"

desc="转换成可编辑文档"

onClick={()=>navigate("/convert")}

/>



<ToolCard

icon="📦"

title="PDF压缩"

desc="降低文件大小"

/>



</div>


</div>

)


}


export default Home
