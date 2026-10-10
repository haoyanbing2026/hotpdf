import {Link} from "react-router-dom"

function Navbar(){

return (

<nav className="navbar">


<div className="logo">

📄 PDF工具箱

</div>



<div className="nav-links">


<Link to="/">

首页

</Link>



<Link to="/split">

PDF拆分

</Link>



<Link to="/merge">

PDF合并

</Link>



<Link to="/convert">

PDF转Word

</Link>



</div>


</nav>

)

}


export default Navbar
