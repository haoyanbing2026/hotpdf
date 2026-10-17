import { useRef, useState } from "react"

import ToolHeader from "../components/ToolHeader"

import UploadBox from "../components/UploadBox"

import PDFPreview from "../components/PDFPreview"

import ResultCard from "../components/ResultCard"

import createPDFResult from "../utils/pdfResult"

import useUploadPDF from "../hooks/useUploadPDF"





function Split(){



const uploadButtonRef = useRef(null)

const splitButtonRef = useRef(null)





const {

file,

setFile,

filename,

pages,

uploadPDF,

loading,

progress,

error:uploadError

}=useUploadPDF()






const [uploaded,setUploaded] = useState(false)

const [selectedPages,setSelectedPages] = useState([])

const [resultInfo,setResultInfo] = useState({})

const [downloadUrl,setDownloadUrl] = useState("")

const [error,setError] = useState("")









function handleFile(selectedFile){



setFile(selectedFile)


setUploaded(false)

setSelectedPages([])

setResultInfo({})

setDownloadUrl("")

setError("")





setTimeout(()=>{


if(uploadButtonRef.current){



const buttonTop =

uploadButtonRef.current.getBoundingClientRect().top

+

window.pageYOffset



window.scrollTo({


top:

buttonTop

-

window.innerHeight

+

100,


behavior:"smooth"


})


}



},300)



}









async function handleUpload(){



const data = await uploadPDF()



if(data?.filename){


setUploaded(true)





setTimeout(()=>{


if(splitButtonRef.current){



const buttonTop =

splitButtonRef.current.getBoundingClientRect().top

+

window.pageYOffset





window.scrollTo({


top:

buttonTop

-

window.innerHeight

+

150,


behavior:"smooth"


})


}



},800)



}



}









async function splitPDF(){



setError("")



if(!uploaded){


setError(

"Please upload PDF first."

)


return


}






if(selectedPages.length===0){


setError(

"Please select pages."

)


return


}







try{



const res = await fetch(

`${import.meta.env.VITE_API_URL}/split?filename=${encodeURIComponent(filename)}&pages=${selectedPages.join(",")}`,

{

method:"POST"

}

)







const data = await res.json()







if(data.filename){



setResultInfo(

createPDFResult({

filename:data.filename,

pages:selectedPages.length,

size:data.size || ""

})

)







setDownloadUrl(

`${import.meta.env.VITE_API_URL}/download/${encodeURIComponent(data.filename)}`

)



}

else{


throw new Error(

"Split failed."

)


}



}

catch(err){


setError(

err.message || "Split failed."

)


}



}









return (


<div className="page">






<ToolHeader


icon="✂️"


title="Split PDF"


description="Extract selected pages from your PDF quickly and easily."

/>









<UploadBox


onUpload={handleFile}


/>









<button


ref={uploadButtonRef}


className="secondary-btn"


onClick={handleUpload}


disabled={loading}


>

{

loading

?

"Uploading..."

:

"Upload PDF"

}


</button>









{

progress>0 && progress<100 &&


<div className="upload-progress">


<div className="progress-bar">


<div

className="progress-inner"

style={{

width:`${progress}%`

}}

/>


</div>


<p>

Uploading {progress}%

</p>


</div>


}









{

uploaded &&


<PDFPreview


file={file}


selectedPages={selectedPages}


setSelectedPages={setSelectedPages}


/>


}









{

pages.length>0 &&



<div

className="select-area"

>



<h3>

Select pages to split

</h3>







<div className="select-info">


Selected:

{

selectedPages.length

}

page(s)

</div>







<button


className="secondary-btn"


onClick={()=>setSelectedPages(pages)}


>

Select All

</button>







<button


className="secondary-btn"


onClick={()=>setSelectedPages([])}


>

Clear Selection

</button>







<button


ref={splitButtonRef}


className="primary-btn"


onClick={splitPDF}


>

Split PDF

</button>







</div>


}









{

(uploadError || error) &&



<div className="error-message">


⚠️ {uploadError || error}


</div>


}









{

downloadUrl &&



<ResultCard


title="🎉 Split completed"


message="Your PDF has been successfully split."


info={resultInfo}


downloadUrl={downloadUrl}


downloadText="Download Split PDF"



/>



}









{/* Helpful, indexable content below the existing PDF tool. */}
<section
  aria-labelledby="split-guide-title"
  style={{ maxWidth: "900px", margin: "56px auto 0", padding: "0 16px 48px", lineHeight: 1.7 }}
>
  <h2 id="split-guide-title">How to Split a PDF Online</h2>
  <p>
    Use HotPDF to extract the pages you need from a PDF and save them as a separate document.
    You can preview pages before choosing which ones to keep.
  </p>
  <ol>
    <li><strong>Choose a PDF.</strong> Select the document you want to split.</li>
    <li><strong>Upload your file.</strong> Click “Upload PDF” to load its pages.</li>
    <li><strong>Select pages.</strong> Use the page preview to choose one or more pages. You can also select all pages or clear your selection.</li>
    <li><strong>Split and download.</strong> Click “Split PDF”, then download the resulting PDF file.</li>
  </ol>

  <h2>Extract PDF Pages with HotPDF</h2>
  <p>
    Splitting a PDF is useful when you only need certain pages from a larger document,
    such as a chapter, a handout, or selected pages of a report. HotPDF lets you see
    page thumbnails and select the pages you want before creating a new PDF.
  </p>

  <h2>Frequently Asked Questions</h2>
  <div>
    <h3>Can I extract a single page from a PDF?</h3>
    <p>Yes. Upload your PDF, select one page in the preview, and click “Split PDF”.</p>

    <h3>Can I select multiple pages?</h3>
    <p>Yes. Select the pages you need in the preview. HotPDF creates a PDF containing your selection.</p>

    <h3>Can I change my selection before splitting?</h3>
    <p>Yes. You can select or deselect individual pages, use “Select All”, or click “Clear Selection”.</p>

    <h3>How do I get the split PDF?</h3>
    <p>After the split is complete, click “Download Split PDF” to save the resulting file.</p>
  </div>
</section>


</div>


)



}



export default Split