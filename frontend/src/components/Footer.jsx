import { Link } from "react-router-dom"



function Footer(){


return (

<footer className="footer">





<div className="footer-brand">


<h2>

🔥 HotPDF

</h2>



<p>

Your smart PDF assistant

<br />

for students and professionals.

</p>


</div>









<div className="footer-links">






<div>


<h3>

Tools

</h3>





<Link to="/split">

Split PDF

</Link>





<Link to="/merge">

Merge PDF

</Link>





<Link to="/compress">

Compress PDF

</Link>





<Link to="/convert">

Convert PDF

</Link>




</div>









<div>


<h3>

Company

</h3>





<Link to="/about">

About

</Link>





<Link to="/privacy">

Privacy

</Link>





<Link to="/terms">

Terms

</Link>





</div>








</div>









<div className="footer-bottom">


© 2026 HotPDF.

All rights reserved.


</div>





</footer>


)


}


export default Footer