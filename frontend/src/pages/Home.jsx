import { useNavigate } from "react-router-dom"

import ToolCard from "../components/ToolCard"

import HowItWorks from "../components/HowItWorks"

import FeatureSection from "../components/FeatureSection"

import PdfIllustration from "../components/PdfIllustration"

import StudentIllustration from "../components/StudentIllustration"

import WorkIllustration from "../components/WorkIllustration"

import SecurityIllustration from "../components/SecurityIllustration"

import "../styles/home.css"





function Home(){


const navigate = useNavigate()



return (

<div className="home">





{/* =========================
    Hero
========================= */}


<section className="hero">



<div className="hero-text">


<h1>

All-in-one PDF Tools

</h1>




<p className="hero-main">

Your smart PDF assistant for study and work.

</p>



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


<div>

✓ Fast processing

</div>


<div>

✓ Secure file handling

</div>


<div>

✓ No complicated software

</div>


</div>



</div>







<div className="hero-illustration">


<PdfIllustration />


</div>





</section>









{/* =========================
    Tools
========================= */}



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









{/* =========================
    PDF Features SEO Section
========================= */}



<FeatureSection />









{/* =========================
    Audience
========================= */}



<section className="audience-section">



<h2>

Built for Students and Professionals

</h2>





<div className="audience-cards">



<div className="audience-card">


<StudentIllustration />



<h3>

🎓 For Students

</h3>



<p>

✓ Organize learning materials

<br/>

✓ Prepare assignments

<br/>

✓ Manage research documents

</p>



</div>








<div className="audience-card">



<WorkIllustration />



<h3>

💼 For Professionals

</h3>



<p>

✓ Handle daily documents

<br/>

✓ Merge, split and compress files

<br/>

✓ Improve work efficiency

</p>



</div>



</div>





<p className="audience-summary">

From classroom assignments to professional documents,
HotPDF helps you handle files faster and smarter.

</p>



</section>









{/* =========================
    Workflow
========================= */}



<section className="workflow-section">


<HowItWorks />


</section>









{/* =========================
    Security
========================= */}



<section className="security">



<SecurityIllustration />



<h2>

Your files are safe

</h2>





<div className="security-items">


<span>

🔒 Secure processing

</span>



<span>

⚡ Fast conversion

</span>



<span>

🗑 Temporary file removal

</span>



</div>



</section>







</div>

)

}



export default Home