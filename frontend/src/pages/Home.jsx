import { useNavigate } from "react-router-dom"

import ToolCard from "../components/ToolCard"

import HowItWorks from "../components/HowItWorks"

import "../styles/home.css"



function Home(){


const navigate = useNavigate()



return (


<div className="home">





<section className="hero">



<div className="hero-text">



<h1>

All-in-one PDF Tools

</h1>





<p>

Merge, split, compress and convert PDF files easily.

</p>







<button

className="primary-btn"

onClick={()=>navigate("/split")}

>

Choose File

</button>







<div className="trust">

✓ Fast processing

<br/>

✓ Secure file handling

<br/>

✓ No complicated software

</div>



</div>









<div className="pdf-demo">


<div className="pdf-title">

PDF Document

</div>


<div className="pdf-info">

Ready to process

</div>


<div className="demo-buttons">


<span>

Split

</span>


<span>

Merge

</span>


<span>

Compress

</span>


</div>


<div className="convert-demo">

PDF → Word

</div>


</div>





</section>









<section>


<h2>

Everything you need

</h2>





<div className="tools">



<ToolCard

icon="✂️"

title="Split PDF"

desc="Extract only the pages you need."

onClick={()=>navigate("/split")}

/>






<ToolCard

icon="📎"

title="Merge PDF"

desc="Combine multiple PDF files."

onClick={()=>navigate("/merge")}

/>







<ToolCard

icon="📦"

title="Compress PDF"

desc="Reduce PDF size."

onClick={()=>navigate("/compress")}

/>







<ToolCard

icon="📝"

title="Convert PDF"

desc="Convert PDF to Word."

onClick={()=>navigate("/convert")}

/>



</div>


</section>









<section>


<HowItWorks />


</section>









<section className="security">


<h2>

Your files are safe

</h2>



<p>

Files are processed securely and can be removed after processing.

</p>



</section>







</div>


)


}



export default Home