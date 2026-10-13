import { useEffect, useState } from "react"

import * as pdfjsLib from "pdfjs-dist"


pdfjsLib.GlobalWorkerOptions.workerSrc =
`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`



function PDFPreview({

file,

selectedPages,

setSelectedPages

}){


const [pages,setPages]=useState([])


const [loading,setLoading]=useState(false)






useEffect(()=>{


if(!file){

setPages([])

return

}



async function loadPDF(){


setLoading(true)



try{


const buffer = await file.arrayBuffer()



const pdf = await pdfjsLib.getDocument({

data:buffer

}).promise






const list=[]





for(

let i=1;

i<=pdf.numPages;

i++

){



const page = await pdf.getPage(i)



const viewport = page.getViewport({

scale:0.4

})





const canvas=document.createElement("canvas")


const context=canvas.getContext("2d")



canvas.width=viewport.width


canvas.height=viewport.height





await page.render({

canvasContext:context,

viewport

}).promise





list.push({

page:i,

image:canvas.toDataURL()

})



}




setPages(list)



}

catch(err){


console.log(

"PDF preview error",

err

)


}

finally{


setLoading(false)


}



}



loadPDF()



},[file])









function togglePage(page){



if(selectedPages.includes(page)){



setSelectedPages(

selectedPages.filter(

p=>p!==page

)

)



}

else{


setSelectedPages([

...selectedPages,

page

])


}



}









return (


<div className="preview-container">


{

loading &&


<div className="loading-box">

Loading PDF preview...

</div>


}






{

pages.map(item=>(



<div

className={

selectedPages.includes(item.page)

?

"preview-card selected"

:

"preview-card"

}


key={item.page}


onClick={()=>togglePage(item.page)}


>


<img

src={item.image}

alt={`page ${item.page}`}

/>



<p>

Page {item.page}

</p>


</div>



))


}



</div>


)


}



export default PDFPreview
