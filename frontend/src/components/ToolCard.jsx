function ToolCard({

icon,

title,

desc,

onClick

}){


return (

<div

className="tool-card"

onClick={onClick}

>


<div className="tool-icon">

{icon}

</div>



<h3>

{title}

</h3>



<p>

{desc}

</p>



<div className="tool-action">

Try now →

</div>



</div>

)

}


export default ToolCard
