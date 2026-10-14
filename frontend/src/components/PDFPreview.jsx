import { useEffect, useState } from "react"

import * as pdfjsLib from "pdfjs-dist"

import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"


pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc





function PDFPreview({

    file,

    selectedPages,

    setSelectedPages

}) {


    const [pages,setPages] = useState([])

    const [loading,setLoading] = useState(false)

    const [error,setError] = useState("")





    useEffect(()=>{


        if(!file){

            setPages([])

            return

        }


        loadPDF()


    },[file])







    async function loadPDF(){


        try {


            setLoading(true)

            setError("")

            setPages([])



            const buffer = await file.arrayBuffer()



            const pdf = await pdfjsLib.getDocument({

                data:buffer

            }).promise





            const list = []



            /*
              Avoid mobile memory problems.
              Large PDFs only preview first 30 pages.
            */

            const maxPages = Math.min(
                pdf.numPages,
                30
            )




            for(
                let i = 1;
                i <= maxPages;
                i++
            ){


                const page = await pdf.getPage(i)



                const scale =
                    window.innerWidth < 600
                    ? 0.8
                    : 0.6




                const viewport =
                    page.getViewport({

                        scale

                    })





                const canvas =
                    document.createElement(
                        "canvas"
                    )



                const context =
                    canvas.getContext(
                        "2d"
                    )





                canvas.width =
                    viewport.width



                canvas.height =
                    viewport.height





                await page.render({

                    canvasContext:
                    context,

                    viewport

                }).promise






                list.push({

                    page:i,

                    image:
                    canvas.toDataURL(
                        "image/jpeg",
                        0.85
                    )

                })





                canvas.width = 0

                canvas.height = 0


            }



            setPages(list)



        }
        catch(err){


            console.error(
                "PDF preview error",
                err
            )


            setError(
                "Unable to preview PDF."
            )


        }
        finally{


            setLoading(false)


        }


    }









    function togglePage(page){


        if(
            selectedPages.includes(page)
        ){


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
                error &&

                <div className="error-message">

                    ⚠️ {error}

                </div>

            }







            {
                pages.map(item=>(


                    <div

                        key={item.page}


                        className={

                            selectedPages.includes(
                                item.page
                            )

                            ?

                            "preview-card selected"

                            :

                            "preview-card"

                        }



                        onClick={()=>
                            togglePage(
                                item.page
                            )
                        }


                    >



                        <img

                            src={item.image}

                            alt={
                                `page ${item.page}`
                            }

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