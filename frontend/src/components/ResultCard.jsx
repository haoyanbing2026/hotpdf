import { useEffect, useRef } from "react"

import "../styles/result.css"



function ResultCard({

    title,

    message,

    info,

    downloadUrl,

    downloadText="Download File"

}){



const resultRef = useRef(null)





useEffect(()=>{


    if(downloadUrl){


        setTimeout(()=>{


            resultRef.current?.scrollIntoView({

                behavior:"smooth",

                block:"center"

            })


        },300)


    }



},[downloadUrl])









return (


<div

ref={resultRef}

className="result-card"

>



<div className="result-header">



<div className="success-icon">

✓

</div>





<div className="result-title">

{title}

</div>



</div>









<p className="result-message">

{message}

</p>









<div className="result-info">



{

info?.filename &&

<div className="result-row">

<span>📄 File name</span>

<strong>

{info.filename}

</strong>

</div>

}







{

info?.pages &&

<div className="result-row">

<span>📑 Pages</span>

<strong>

{info.pages}

</strong>

</div>

}







{

info?.size &&

<div className="result-row">

<span>💾 Size</span>

<strong>

{info.size}

</strong>

</div>

}







{

info?.originalSize &&

<div className="result-row">

<span>📦 Original size</span>

<strong>

{info.originalSize} MB

</strong>

</div>

}







{

info?.compressedSize &&

<div className="result-row">

<span>📉 Compressed size</span>

<strong>

{info.compressedSize} MB

</strong>

</div>

}







{

info?.saved &&

<div className="result-row">

<span>✨ Saved</span>

<strong>

{info.saved}%

</strong>

</div>

}



</div>









<a

href={downloadUrl}

className="download-btn"

download

>

⬇ {downloadText}

</a>







</div>


)



}



export default ResultCard
