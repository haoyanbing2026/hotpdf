import { useEffect, useState } from "react"

import * as pdfjsLib from "pdfjs-dist"

import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url"


pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc





function MultiPDFPreview({

    files

}){


    const [previews,setPreviews] = useState([])

    const [loading,setLoading] = useState(false)

    const [error,setError] = useState("")









    useEffect(()=>{


        if(!files || files.length===0){


            setPreviews([])

            return


        }



        loadPreviews()



    },[files])









    async function loadPreviews(){


        try{


            setLoading(true)

            setError("")

            setPreviews([])







            const list=[]







            for(const file of files){





                const buffer = await new Promise(

                    (resolve,reject)=>{


                        const reader =
                        new FileReader()



                        reader.onload=(e)=>{


                            resolve(

                                new Uint8Array(

                                    e.target.result

                                )

                            )


                        }





                        reader.onerror=reject



                        reader.readAsArrayBuffer(file)



                    }

                )









                const pdf = await pdfjsLib.getDocument({

                    data:buffer,

                    disableFontFace:true,

                    useWorkerFetch:false,

                    isEvalSupported:false


                }).promise









                const page = await pdf.getPage(1)







                const scale =

                    window.innerWidth < 600

                    ?

                    0.45

                    :

                    0.4







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







                canvas.width = viewport.width


                canvas.height = viewport.height







                await page.render({

                    canvasContext:context,

                    viewport

                }).promise







                list.push({

                    name:file.name,

                    pages:pdf.numPages,

                    image:

                    canvas.toDataURL(

                        "image/jpeg",

                        0.8

                    )


                })







                canvas.width=0

                canvas.height=0



            }







            setPreviews(list)



        }

        catch(err){



            console.error(

                "Multi PDF preview error:",

                err

            )



            setError(

                err.message ||

                "Unable to preview PDF."

            )



        }

        finally{


            setLoading(false)


        }


    }









    return (


        <div className="multi-preview-container">







            {

                loading &&


                <div className="loading-box">

                    Loading previews...

                </div>


            }









            {

                error &&


                <div className="error-message">

                    ⚠️ {error}

                </div>


            }









            {

                previews.map((item,index)=>(



                    <div

                        className="multi-preview-card"

                        key={index}

                    >





                        <div className="multi-preview-image">



                            <img

                                src={item.image}

                                alt={item.name}

                            />



                        </div>







                        <div className="multi-preview-info">



                            <p className="preview-name">

                                📄 {item.name}

                            </p>





                            <p className="preview-pages">

                                {item.pages} pages

                            </p>



                        </div>





                    </div>



                ))

            }





        </div>


    )


}





export default MultiPDFPreview