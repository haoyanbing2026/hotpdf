function createPDFResult({

    filename,

    size = "",

    pages = "",

    originalSize = "",

    compressedSize = "",

    saved = ""

}){


return {


    filename,


    size,


    pages,


    originalSize,


    compressedSize,


    saved,


    createdAt: new Date().toISOString()


}


}


export default createPDFResult