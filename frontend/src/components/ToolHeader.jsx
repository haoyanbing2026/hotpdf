function ToolHeader({

    icon,

    title,

    description

}){


return (

<div className="tool-header">


<h1 className="tool-title">


{icon}

{" "}

{title}


</h1>



<p className="tool-subtitle">


{description}


</p>


</div>

)


}


export default ToolHeader
