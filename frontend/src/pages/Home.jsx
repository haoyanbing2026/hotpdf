import {
  useNavigate
} from "react-router-dom"

import ToolCard from "../components/ToolCard"
import HowItWorks from "../components/HowItWorks"


function Home(){

  const navigate = useNavigate()


  return (

    <div className="home">


      {/* Hero */}

      <section className="hero">

        <div className="hero-text">

          <h1>
            Manage your PDFs
            <br />
            smarter and faster.
          </h1>


          <p>
            HotPDF helps students and professionals
            organize, compress and convert documents easily.
          </p>


          <button
            className="primary-btn"
            onClick={()=>navigate("/split")}
          >
            Upload PDF
          </button>


          <div className="trust">

            🔒 No registration required
            <br />

            🗑 Files automatically deleted

          </div>


        </div>



        {/* 产品展示卡 */}

        <div className="pdf-demo">


          <div className="pdf-title">

            📄 Physics_Notes.pdf

          </div>


          <div className="pdf-info">

            120 pages
            <br/>
            25.6 MB

          </div>


          <div className="demo-buttons">

            <span>
              ✂️ Split
            </span>

            <span>
              📦 Compress
            </span>


          </div>


          <div className="convert-demo">

            📝 Convert PDF

          </div>


        </div>


      </section>



      {/* 使用场景 */}

      <section className="scenarios">


        <h2>
          Built for the way you work
        </h2>


        <div className="scenario-box">


          <div>

            📚

            <h3>
              Study
            </h3>

            <p>
              Organize textbooks,
              lecture notes and assignments.
            </p>

          </div>



          <div>

            💼

            <h3>
              Work
            </h3>


            <p>
              Manage reports,
              contracts and documents.
            </p>

          </div>


        </div>


      </section>





      {/* 工具 */}

      <section>


        <h2>
          What can HotPDF do?
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

          desc="Combine multiple documents."

          onClick={()=>navigate("/merge")}

          />



          <ToolCard

          icon="📦"

          title="Compress PDF"

          desc="Reduce file size easily."

          onClick={()=>navigate("/compress")}

          />


          <ToolCard

          icon="📝"

          title="Convert PDF"

          desc="Make documents editable."

          onClick={()=>navigate("/convert")}

          />


        </div>


      </section>



      {/* 怎样工作 */}
    
      <HowItWorks />
    
      {/* 安全 */}

      <section className="security">


        <h2>
          Your files stay private.
        </h2>


        <p>
          🔒 Secure processing
          <br/>
          ⚡ Fast processing
          <br/>
          🗑 Automatic deletion
        </p>


      </section>




    </div>

  )

}


export default Home
