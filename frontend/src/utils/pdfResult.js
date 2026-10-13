function createPDFResult({

    filename,

    size="Unknown",

    pages=""

}){


return {


filename,


size,


pages,


createdAt:new Date().toISOString()


}


}



export default createPDFResult