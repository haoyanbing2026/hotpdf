function ResultCard({

title,

message,

downloadUrl,

downloadText="下载文件",

info={}

}){


return (

<div className="result-card">


<div className="result-header">


<div className="success-icon">

✓

</div>


<h2>

{title}

</h2>


</div>





<p className="result-message">

{message}

</p>






{

info.filename &&

<div className="info-row">

<span>

📄 文件名

</span>

<strong>

{info.filename}

</strong>

</div>

}





{

info.pages &&

<div className="info-row">

<span>

📑 页数

</span>

<strong>

{info.pages} 页

</strong>

</div>

}





{

info.size &&

<div className="info-row">

<span>

💾 大小

</span>

<strong>

{info.size}

</strong>

</div>

}





{

downloadUrl &&


<a

href={downloadUrl}

className="download-btn"

download

>

⬇ {downloadText}

</a>


}




</div>

)

}


export default ResultCard
