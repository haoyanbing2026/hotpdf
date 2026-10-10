from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

import os
import uuid
import fitz


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR="uploads"


os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)





@app.get("/")
def home():

    return {

        "message":"PDF API running"

    }






# =========================
# 上传PDF
# =========================


@app.post("/upload")

async def upload_pdf(

    file:UploadFile=File(...)

):


    path=f"{UPLOAD_DIR}/{file.filename}"



    content=await file.read()



    with open(path,"wb") as f:

        f.write(content)




    doc=fitz.open(path)



    size=len(content)/1024/1024



    return {


        "filename":file.filename,


        "pages":len(doc),


        "size":round(size,2),


        "message":"上传成功"


    }







# =========================
# PDF预览
# =========================


@app.get("/preview/{filename}/{page}")

async def preview(

    filename:str,

    page:int

):


    pdf_path=f"{UPLOAD_DIR}/{filename}"



    doc=fitz.open(pdf_path)



    pdf_page=doc[page-1]



    pix=pdf_page.get_pixmap(

        matrix=fitz.Matrix(1.5,1.5)

    )



    image_path=f"{UPLOAD_DIR}/{filename}_{page}.png"



    pix.save(image_path)



    return FileResponse(

        image_path,

        media_type="image/png"

    )







# =========================
# PDF拆分
# =========================


@app.post("/split")

async def split_pdf(

    filename:str,

    pages:str

):


    source=f"{UPLOAD_DIR}/{filename}"



    doc=fitz.open(source)



    new_pdf=fitz.open()



    page_list=[

        int(x)

        for x in pages.split(",")

    ]



    for p in page_list:


        new_pdf.insert_pdf(

            doc,

            from_page=p-1,

            to_page=p-1

        )



    filename_out=f"split_{uuid.uuid4().hex}.pdf"



    output=f"{UPLOAD_DIR}/{filename_out}"



    new_pdf.save(output)



    return {


        "filename":filename_out,

        "size": f"{round(os.path.getsize(output) / 1024, 2)} KB",

        "message":"拆分成功"

    }







# =========================
# PDF合并
# =========================


@app.post("/merge")

async def merge_pdf(

    files:list[UploadFile]=File(...)

):


    merged_pdf=fitz.open()



    for file in files:


        path=f"{UPLOAD_DIR}/{file.filename}"



        content=await file.read()



        with open(path,"wb") as f:

            f.write(content)




        doc=fitz.open(path)



        merged_pdf.insert_pdf(doc)




    filename=f"merged_{uuid.uuid4().hex}.pdf"



    output=f"{UPLOAD_DIR}/{filename}"



    merged_pdf.save(output)



    return {


        "filename":filename,


        "message":"合并成功"

    }



# =========================
# PDF 转 Word
# =========================

from docx import Document
import uuid


@app.post("/convert_word")
async def convert_word(filename: str):


    pdf_path = f"{UPLOAD_DIR}/{filename}"


    if not os.path.exists(pdf_path):

        return {
            "message":"文件不存在"
        }



    pdf = fitz.open(pdf_path)



    doc = Document()



    for page in pdf:

        text = page.get_text()

        if text.strip():

            doc.add_paragraph(text)



    output_name = f"{uuid.uuid4().hex}.docx"



    output_path = f"{UPLOAD_DIR}/{output_name}"



    doc.save(output_path)



    return {

        "filename": output_name,

        "message":"转换成功"

    }



# =========================
# 下载
# =========================


@app.get("/download/{filename}")

async def download(

    filename:str

):


    return FileResponse(

        f"{UPLOAD_DIR}/{filename}",

        media_type="application/pdf",

        filename=filename

    )
