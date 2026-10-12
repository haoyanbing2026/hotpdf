import {Link} from "react-router-dom"

function Footer(){


return (

<footer className="footer">


<div className="footer-brand">


<h2>
🔥 HotPDF
</h2>


<p>
Your PDF assistant
for study and work.
</p>


</div>



<div className="footer-links">


<div>

<h3>
Tools
</h3>


<a>
Split PDF
</a>


<a>
Merge PDF
</a>


<a>
Compress PDF
</a>


<a>
Convert PDF
</a>


</div>




<div>

<h3>
Company
</h3>


<a>
About
</a>


<Link to="/privacy">
Privacy
</Link>

<a>
Terms
</a>


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
