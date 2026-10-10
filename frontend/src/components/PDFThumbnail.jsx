import {useEffect,useRef} from "react"

import * as pdfjsLib from "pdfjs-dist"



function PDFThumbnail({file}){


const canvasRef=useRef()



useEffect(()=>{


async function render(){


const buffer =
await file.arrayBuffer()



const pdf =
await pdfjsLib.getDocument(
{
data:buffer
}
).promise



const page =
await pdf.getPage(1)



const viewport =
page.getViewport({
scale:0.4
})



const canvas =
canvasRef.current



const context =
canvas.getContext("2d")



canvas.width =
viewport.width


canvas.height =
viewport.height



await page.render({

canvasContext:context,

viewport

}).promise



}


render()



},[file])



return (

<canvas

ref={canvasRef}

/>

)

}


export default PDFThumbnail
