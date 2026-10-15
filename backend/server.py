
import asyncio
import logging
import os
import re
import shutil
import subprocess
import tempfile
import time
import uuid

from contextlib import asynccontextmanager, suppress
from pathlib import Path

import fitz

from docx import Document
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from starlette.concurrency import run_in_threadpool


# ========================================
# Configuration
# ========================================

logger = logging.getLogger("hotpdf")

UPLOAD_DIR = Path(
    os.getenv(
        "UPLOAD_DIR",
        os.path.join(tempfile.gettempdir(), "hotpdf_files")
    )
).resolve()

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
    mode=0o700
)

MAX_FILE_MB = int(
    os.getenv("MAX_FILE_MB", "20")
)

MAX_MERGE_TOTAL_MB = int(
    os.getenv("MAX_MERGE_TOTAL_MB", "60")
)

MAX_MERGE_FILES = int(
    os.getenv("MAX_MERGE_FILES", "10")
)

MAX_PDF_PAGES = int(
    os.getenv("MAX_PDF_PAGES", "300")
)

MAX_MERGE_PAGES = int(
    os.getenv("MAX_MERGE_PAGES", "600")
)

TEMP_TTL_MINUTES = int(
    os.getenv("TEMP_TTL_MINUTES", "60")
)

CLEAN_INTERVAL_SECONDS = 600

MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024

MAX_MERGE_TOTAL_BYTES = (
    MAX_MERGE_TOTAL_MB * 1024 * 1024
)

TEMP_TTL_SECONDS = TEMP_TTL_MINUTES * 60


# Only server-generated filenames are accepted.

FILE_NAME_RE = re.compile(
    r"(?:upload|split|merged|compressed|converted)_"
    r"[0-9a-f]{32}\.(?:pdf|docx)"
)

PDF_NAME_RE = re.compile(
    r"(?:upload|split|merged|compressed)_"
    r"[0-9a-f]{32}\.pdf"
)


# ========================================
# CORS
# ========================================

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "https://hotpdf.haoyanbing.workers.dev,"
        "http://localhost:5173,"
        "http://localhost:3000,"
        "http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]


# Limit concurrent heavy operations.

processing_slots = asyncio.Semaphore(2)


# ========================================
# Temporary file management
# ========================================

def safe_unlink(path: Path):

    try:
        path.unlink(missing_ok=True)

    except OSError:
        logger.warning(
            "Could not remove temporary file",
            exc_info=True
        )


def cleanup_expired_files():

    cutoff = time.time() - TEMP_TTL_SECONDS

    for item in UPLOAD_DIR.iterdir():

        try:

            if not item.is_file():
                continue

            if item.is_symlink():
                continue

            if item.stat().st_mtime < cutoff:
                item.unlink()

        except FileNotFoundError:
            continue

        except OSError:

            logger.warning(
                "Temporary file cleanup failed",
                exc_info=True
            )


async def cleanup_loop():

    while True:

        try:

            await run_in_threadpool(
                cleanup_expired_files
            )

        except Exception:

            logger.exception(
                "Cleanup task failed"
            )

        await asyncio.sleep(
            CLEAN_INTERVAL_SECONDS
        )


@asynccontextmanager
async def lifespan(app: FastAPI):

    cleanup_task = asyncio.create_task(
        cleanup_loop()
    )

    try:
        yield

    finally:

        cleanup_task.cancel()

        with suppress(asyncio.CancelledError):
            await cleanup_task


# ========================================
# FastAPI application
# ========================================

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"]
)


# ========================================
# File helpers
# ========================================

def new_filename(prefix: str, extension: str):

    return (
        f"{prefix}_{uuid.uuid4().hex}.{extension}"
    )


def stored_path(
    filename: str,
    pdf_only: bool = False
):

    pattern = (
        PDF_NAME_RE if pdf_only else FILE_NAME_RE
    )

    if not pattern.fullmatch(filename):

        raise HTTPException(
            status_code=400,
            detail="Invalid file identifier."
        )

    path = UPLOAD_DIR / filename

    if not path.is_file():

        raise HTTPException(
            status_code=404,
            detail="File not found or expired."
        )

    try:

        # Refresh expiration time on access.
        os.utime(path, None)

    except FileNotFoundError:

        raise HTTPException(
            status_code=404,
            detail="File not found or expired."
        ) from None

    return path


async def save_pdf_upload(
    upload: UploadFile,
    path: Path
):

    original_name = upload.filename or ""

    if not original_name.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Please choose a PDF file."
        )

    total = 0

    try:

        with path.open("xb") as output:

            while True:

                chunk = await upload.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                total += len(chunk)

                if total > MAX_FILE_BYTES:

                    raise HTTPException(
                        status_code=413,
                        detail=(
                            "Each PDF must be no larger "
                            f"than {MAX_FILE_MB} MB."
                        )
                    )

                output.write(chunk)

        if total == 0:

            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty."
            )

        return total

    except Exception:

        safe_unlink(path)
        raise

    finally:

        await upload.close()


def inspect_pdf(path: Path):

    with path.open("rb") as stream:

        header = stream.read(1024)

        if b"%PDF-" not in header:

            raise HTTPException(
                status_code=400,
                detail="This is not a valid PDF file."
            )

    try:

        with fitz.open(str(path)) as pdf:

            if pdf.needs_pass:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Password-protected PDFs "
                        "are not supported."
                    )
                )

            count = pdf.page_count

            if count < 1:

                raise HTTPException(
                    status_code=400,
                    detail="The PDF has no pages."
                )

            if count > MAX_PDF_PAGES:

                raise HTTPException(
                    status_code=413,
                    detail=(
                        "A PDF may contain at most "
                        f"{MAX_PDF_PAGES} pages."
                    )
                )

            return count

    except HTTPException:
        raise

    except Exception as exc:

        logger.info(
            "Invalid PDF: %s",
            type(exc).__name__
        )

        raise HTTPException(
            status_code=400,
            detail="Unable to read this PDF file."
        ) from None


# ========================================
# PDF processing helpers
# ========================================

def make_split(
    source: Path,
    output: Path,
    pages: list[int]
):

    with fitz.open(str(source)) as pdf:

        with fitz.open() as result:

            for number in pages:

                if not 1 <= number <= pdf.page_count:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Page {number} is outside "
                            "the PDF page range."
                        )
                    )

                result.insert_pdf(
                    pdf,
                    from_page=number - 1,
                    to_page=number - 1
                )

            result.save(str(output))

    return len(pages)


def make_merge(
    paths: list[Path],
    output: Path
):

    page_count = 0

    with fitz.open() as merged:

        for path in paths:

            with fitz.open(str(path)) as pdf:

                page_count += pdf.page_count

                if page_count > MAX_MERGE_PAGES:

                    raise HTTPException(
                        status_code=413,
                        detail=(
                            "Merged PDF may contain "
                            f"at most {MAX_MERGE_PAGES} pages."
                        )
                    )

                merged.insert_pdf(pdf)

        merged.save(str(output))

    return page_count


def make_word(
    source: Path,
    output: Path
):

    word = Document()

    has_text = False

    with fitz.open(str(source)) as pdf:

        for page in pdf:

            content = page.get_text().strip()

            if content:

                has_text = True

                word.add_paragraph(content)

    if not has_text:

        raise HTTPException(
            status_code=422,
            detail=(
                "This PDF has no extractable text. "
                "Scanned PDFs require OCR."
            )
        )

    word.save(str(output))


def make_compressed(
    source: Path,
    output: Path
):

    command = [
        "gs",
        "-dSAFER",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dPDFSETTINGS=/ebook",
        "-dDetectDuplicateImages=true",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={output}",
        str(source)
    ]

    try:

        subprocess.run(
            command,
            check=True,
            capture_output=True,
            timeout=90
        )

    except FileNotFoundError:

        logger.error(
            "Ghostscript executable missing"
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "PDF compression is "
                "temporarily unavailable."
            )
        ) from None

    except subprocess.TimeoutExpired:

        raise HTTPException(
            status_code=504,
            detail="PDF compression timed out."
        ) from None

    except subprocess.CalledProcessError:

        logger.warning(
            "Ghostscript compression failed",
            exc_info=True
        )

        raise HTTPException(
            status_code=422,
            detail="Could not compress this PDF."
        ) from None

    if (
        not output.is_file()
        or output.stat().st_size == 0
    ):

        raise HTTPException(
            status_code=500,
            detail=(
                "Compression did not produce "
                "an output PDF."
            )
        )

    # Avoid returning a larger file.

    if (
        output.stat().st_size
        >= source.stat().st_size
    ):

        shutil.copyfile(
            source,
            output
        )


def png_preview(
    path: Path,
    page_number: int
):

    with fitz.open(str(path)) as pdf:

        if (
            page_number < 1
            or page_number > pdf.page_count
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid page number."
            )

        page = pdf[page_number - 1]

        width = max(
            page.rect.width,
            1
        )

        height = max(
            page.rect.height,
            1
        )

        scale = min(
            1.4,
            2000 / max(width, height)
        )

        pixmap = page.get_pixmap(
            matrix=fitz.Matrix(
                scale,
                scale
            ),
            alpha=False
        )

        return pixmap.tobytes("png")


# ========================================
# Health checks
# ========================================

@app.get("/")
def home():

    return {
        "message": "PDF API running"
    }


@app.get("/health")
def health():

    return {
        "status": "ok"
    }


# ========================================
# Upload PDF
# ========================================

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...)
):

    async with processing_slots:

        output_name = new_filename(
            "upload",
            "pdf"
        )

        output = UPLOAD_DIR / output_name

        try:

            await save_pdf_upload(
                file,
                output
            )

            page_count = await run_in_threadpool(
                inspect_pdf,
                output
            )

            return {
                "filename": output_name,
                "pages": page_count,
                "size": round(
                    output.stat().st_size / 1024 / 1024,
                    2
                ),
                "message": "Upload successful"
            }

        except Exception:

            safe_unlink(output)
            raise


# ========================================
# Preview PDF
# ========================================

@app.get("/preview/{filename}/{page}")
async def preview(
    filename: str,
    page: int
):

    source = stored_path(
        filename,
        pdf_only=True
    )

    async with processing_slots:

        image = await run_in_threadpool(
            png_preview,
            source,
            page
        )

    return Response(
        content=image,
        media_type="image/png",
        headers={
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff"
        }
    )


# ========================================
# Split PDF
# ========================================

@app.post("/split")
async def split_pdf(
    filename: str,
    pages: str
):

    source = stored_path(
        filename,
        pdf_only=True
    )

    try:

        numbers = [
            int(item.strip())
            for item in pages.split(",")
        ]

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail=(
                "Pages must be "
                "comma-separated numbers."
            )
        ) from None

    if (
        not numbers
        or len(numbers) > MAX_PDF_PAGES
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid number "
                "of pages selected."
            )
        )

    output_name = new_filename(
        "split",
        "pdf"
    )

    output = UPLOAD_DIR / output_name

    async with processing_slots:

        try:

            page_count = await run_in_threadpool(
                make_split,
                source,
                output,
                numbers
            )

            return {
                "filename": output_name,
                "pages": page_count,
                "size": (
                    f"{output.stat().st_size / 1024:.2f} KB"
                ),
                "message": "Split successful"
            }

        except Exception:

            safe_unlink(output)
            raise


# ========================================
# Merge PDF
# ========================================

@app.post("/merge")
async def merge_pdf(
    files: list[UploadFile] = File(...)
):

    if not 2 <= len(files) <= MAX_MERGE_FILES:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please choose between 2 and "
                f"{MAX_MERGE_FILES} PDFs."
            )
        )

    sources = []

    output_name = new_filename(
        "merged",
        "pdf"
    )

    output = UPLOAD_DIR / output_name

    async with processing_slots:

        try:

            total_bytes = 0

            for file in files:

                temporary = UPLOAD_DIR / new_filename(
                    "upload",
                    "pdf"
                )

                sources.append(temporary)

                size = await save_pdf_upload(
                    file,
                    temporary
                )

                total_bytes += size

                if total_bytes > MAX_MERGE_TOTAL_BYTES:

                    raise HTTPException(
                        status_code=413,
                        detail=(
                            "Total merge size must not "
                            f"exceed {MAX_MERGE_TOTAL_MB} MB."
                        )
                    )

                await run_in_threadpool(
                    inspect_pdf,
                    temporary
                )

            page_count = await run_in_threadpool(
                make_merge,
                sources,
                output
            )

            return {
                "filename": output_name,
                "pages": page_count,
                "size": (
                    f"{output.stat().st_size / 1024:.2f} KB"
                ),
                "message": "Merge successful"
            }

        except Exception:

            safe_unlink(output)
            raise

        finally:

            for path in sources:
                safe_unlink(path)


# ========================================
# Convert PDF to Word
# ========================================

@app.post("/convert_word")
async def convert_word(
    filename: str
):

    source = stored_path(
        filename,
        pdf_only=True
    )

    output_name = new_filename(
        "converted",
        "docx"
    )

    output = UPLOAD_DIR / output_name

    async with processing_slots:

        try:

            await run_in_threadpool(
                make_word,
                source,
                output
            )

            return {
                "filename": output_name,
                "size": (
                    f"{output.stat().st_size / 1024:.2f} KB"
                ),
                "message": "Conversion successful"
            }

        except Exception:

            safe_unlink(output)
            raise


# ========================================
# Download
# ========================================

@app.get("/download/{filename}")
async def download(
    filename: str
):

    path = stored_path(filename)

    if path.suffix == ".pdf":

        media_type = "application/pdf"

    else:

        media_type = (
            "application/vnd.openxmlformats-officedocument"
            ".wordprocessingml.document"
        )

    return FileResponse(
        str(path),
        filename=path.name,
        media_type=media_type,
        headers={
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff"
        }
    )


# ========================================
# Compress PDF
# ========================================

@app.post("/compress")
async def compress_pdf(
    filename: str
):

    source = stored_path(
        filename,
        pdf_only=True
    )

    output_name = new_filename(
        "compressed",
        "pdf"
    )

    output = UPLOAD_DIR / output_name

    async with processing_slots:

        try:

            await run_in_threadpool(
                make_compressed,
                source,
                output
            )

            original_mb = (
                source.stat().st_size / 1024 / 1024
            )

            compressed_mb = (
                output.stat().st_size / 1024 / 1024
            )

            reduction = (
                (1 - compressed_mb / original_mb) * 100
                if original_mb
                else 0
            )

            return {
                "filename": output_name,
                "original_size": round(
                    original_mb,
                    2
                ),
                "compressed_size": round(
                    compressed_mb,
                    2
                ),
                "saved": round(
                    max(0, reduction),
                    1
                ),
                "message": "Compression successful"
            }

        except Exception:

            safe_unlink(output)
            raise
