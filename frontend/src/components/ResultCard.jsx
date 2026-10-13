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





<div className="result-info">





{
info.filename &&

<div className="info-row">

<span>
📄 File name
</span>


<strong className="file-name-text">

{info.filename}

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
info.originalSize &&

<div className="info-row">

<span>
📦 Original size
</span>


<strong>

{info.originalSize}

</strong>


</div>

}






{
info.compressedSize &&

<div className="info-row">

<span>
📉 Compressed size
</span>


<strong>

{info.compressedSize}

</strong>


</div>

}






{
info.saved &&

<div className="info-row">

<span>
✨ Saved
</span>


<strong>

{info.saved}

</strong>


</div>

}



</div>







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