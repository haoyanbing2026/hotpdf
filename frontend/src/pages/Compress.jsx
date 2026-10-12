import {
useState
} from "react"


const API_URL = import.meta.env.VITE_API_URL



function Compress(){


const [file,setFile]=useState(null)

const [result,setResult]=useState(null)

const [loading,setLoading]=useState(false)



async function uploadAndCompress(){


if(!file){

alert("Please select a PDF")

return

}



setLoading(true)



// 上传

const formData=new FormData()

formData.append(
"file",
file
)



const uploadRes=await fetch(

`${API_URL}/upload`,

{

method:"POST",

body:formData

}

)



const uploadData=await uploadRes.json()



// 压缩

const compressRes=await fetch(

`${API_URL}/compress?filename=${encodeURIComponent(uploadData.filename)}`,

{

method:"POST"

}

)



const compressData=await compressRes.json()



setResult(compressData)


setLoading(false)


}




return (

<div className="page">


<h1 className="tool-title">

📦 Compress PDF

</h1>


<p className="tool-subtitle">

Reduce PDF size while keeping good quality.

</p>


<div className="upload-box">


<div className="upload-icon">

📦

</div>



<label className="file-select-btn">


Select PDF File

<input

type="file"

accept="application/pdf"

onChange={e=>setFile(e.target.files[0])}

/>

</label>



{file &&

<p>

{file.name}

</p>

}



<button

className="primary-btn"

onClick={uploadAndCompress}

>

{
loading
?
"Compressing..."
:
"Compress PDF"
}


</button>


</div>




{
result &&


<div className="result-card">


<div className="result-header">


<div className="success-icon">

✓

</div>


<h3>
Compression completed
</h3>


</div>



<div className="info-row">

<span>
Original
</span>

<strong>
{result.original_size} MB
</strong>

</div>



<div className="info-row">

<span>
Compressed
</span>

<strong>
{result.compressed_size} MB
</strong>

</div>



<div className="info-row">

<span>
Saved
</span>

<strong>
{result.saved}%
</strong>

</div>



<a

className="download-btn"

href={`${API_URL}/download/${result.filename}`}

>

Download PDF

</a>


</div>


}



</div>

)


}


export default Compress
