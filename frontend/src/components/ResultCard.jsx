function ResultCard({

title,

message,

downloadUrl,

downloadText="Download File",

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

📄 File name

</span>


<strong>

<span className="file-name-text">
{
info.filename.length > 35

?

info.filename.substring(0,35)+"..."

:

info.filename

}

</span>

</strong>


</div>


}








{

info.pages &&


<div className="info-row">

<span>

📑 Pages

</span>


<strong>

{info.pages}

</strong>


</div>


}








{

info.size &&


<div className="info-row">

<span>

💾 Size

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
