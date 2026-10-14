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

Your smart PDF assistant for study and work.

<br/>

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



<div className="demo-icon">

📄

</div>





<div className="pdf-title">

PDF Assistant

</div>





<div className="pdf-info">

Smart tools for your documents

</div>







<div className="demo-tags">


<span>

Split

</span>


<span>

Merge

</span>


<span>

Compress

</span>


<span>

Convert

</span>


</div>







<div className="convert-demo">

Fast • Simple • Secure

</div>





</div>





</section>









<section className="tools-section">


<h2>

Everything you need

</h2>





<div className="tools">



<ToolCard

icon="✂️"

title="Split PDF"

desc="Extract specific pages from large documents."

onClick={()=>navigate("/split")}

/>






<ToolCard

icon="📎"

title="Merge PDF"

desc="Combine reports, notes and documents."

onClick={()=>navigate("/merge")}

/>







<ToolCard

icon="📦"

title="Compress PDF"

desc="Reduce file size for easier sharing."

onClick={()=>navigate("/compress")}

/>







<ToolCard

icon="📝"

title="Convert PDF"

desc="Turn PDF files into editable documents."

onClick={()=>navigate("/convert")}

/>



</div>


</section>









<section className="audience-section">



<h2>

Built for Students and Professionals

</h2>






<div className="audience-cards">



<div className="audience-card">


<h3>

🎓 For Students

</h3>



<p>

HotPDF helps students organize learning materials,
prepare assignments, and manage research documents.

</p>



</div>








<div className="audience-card">


<h3>

💼 For Professionals

</h3>



<p>

HotPDF makes daily document work faster with
simple tools for merging, splitting, compressing,
and converting PDF files.

</p>



</div>





</div>






<p className="audience-summary">

From classroom assignments to professional documents,
HotPDF helps you handle files faster and smarter.

</p>



</section>









<section>


<HowItWorks />


</section>









<section className="security">


<h2>

Your files are safe

</h2>



<p>

🔒 Secure processing

&nbsp;&nbsp;

⚡ Fast conversion

&nbsp;&nbsp;

🗑 Temporary file removal

</p>



</section>







</div>


)

}



export default Home