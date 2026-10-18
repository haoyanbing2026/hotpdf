
import asyncio
import logging
import os
import re
import shutil
import subprocess
import tempfile
import time
import uuid
import zipfile

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
    r"[0-9a-f]{32}\.(?:pdf|docx|zip)"
)

PDF_NAME_RE = re.compile(
    r"(?:upload|split|merged|compressed|converted)_"
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


def make_compressed_to_target(
    source: Path,
    output: Path,
    target_bytes: int
):
    """Try several compression profiles to meet a maximum size.

    Returns True only when the actual output file is within the requested
    byte limit. If no profile reaches the limit, returns the smallest valid
    result found (or the original file if no smaller result is available).
    """

    original_size = source.stat().st_size

    if original_size <= target_bytes:
        shutil.copyfile(source, output)
        return True

    profiles = [
        (150, 75),
        (120, 65),
        (96, 55),
        (72, 40),
    ]

    deadline = time.monotonic() + 100
    best_path = None
    best_size = original_size

    try:
        for index, (resolution, quality) in enumerate(profiles):
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                break

            candidate = output.with_name(
                f"{output.stem}_attempt{index}.pdf"
            )

            command = [
                "gs",
                "-dSAFER",
                "-sDEVICE=pdfwrite",
                "-dCompatibilityLevel=1.4",
                "-dNOPAUSE",
                "-dQUIET",
                "-dBATCH",
                "-dDetectDuplicateImages=true",
                "-dDownsampleColorImages=true",
                "-dDownsampleGrayImages=true",
                "-dDownsampleMonoImages=true",
                "-dColorImageDownsampleType=/Bicubic",
                "-dGrayImageDownsampleType=/Bicubic",
                "-dMonoImageDownsampleType=/Subsample",
                f"-dColorImageResolution={resolution}",
                f"-dGrayImageResolution={resolution}",
                f"-dMonoImageResolution={resolution}",
                "-dAutoFilterColorImages=false",
                "-dAutoFilterGrayImages=false",
                "-dColorImageFilter=/DCTEncode",
                "-dGrayImageFilter=/DCTEncode",
                f"-dJPEGQ={quality}",
                f"-sOutputFile={candidate}",
                str(source),
            ]

            try:
                subprocess.run(
                    command,
                    check=True,
                    capture_output=True,
                    timeout=min(30, remaining),
                )

                if not candidate.is_file() or candidate.stat().st_size == 0:
                    continue

                try:
                    with fitz.open(str(candidate)) as pdf:
                        if pdf.page_count < 1:
                            continue
                except Exception:
                    logger.warning("Invalid PDF from target compression attempt")
                    continue

                candidate_size = candidate.stat().st_size
                if candidate_size < best_size:
                    if best_path is not None:
                        safe_unlink(best_path)
                    best_path = candidate
                    best_size = candidate_size
                    candidate = None

                if best_size <= target_bytes:
                    break

            except subprocess.TimeoutExpired:
                logger.warning("Target compression attempt timed out")
            except subprocess.CalledProcessError:
                logger.warning("Target compression attempt failed")
            finally:
                if candidate is not None:
                    safe_unlink(candidate)

        if best_path is None:
            shutil.copyfile(source, output)
            return False

        shutil.copyfile(best_path, output)
        return output.stat().st_size <= target_bytes

    except FileNotFoundError:
        logger.error("Ghostscript executable missing")
        raise HTTPException(
            status_code=503,
            detail="PDF compression is temporarily unavailable.",
        ) from None
    finally:
        if best_path is not None:
            safe_unlink(best_path)


def make_pdf_images(
    source: Path,
    output: Path,
    image_format: str,
):
    """Render every PDF page into an image and package the pages as a ZIP."""
    image_format = image_format.lower()
    if image_format not in {"jpg", "png"}:
        raise HTTPException(
            status_code=400,
            detail="Image format must be JPG or PNG.",
        )

    image_type = "jpeg" if image_format == "jpg" else "png"

    with fitz.open(str(source)) as pdf:
        if pdf.page_count > MAX_PDF_PAGES:
            raise HTTPException(
                status_code=413,
                detail=f"A PDF may contain at most {MAX_PDF_PAGES} pages.",
            )

        with zipfile.ZipFile(
            output, mode="w", compression=zipfile.ZIP_DEFLATED
        ) as archive:
            for index, page in enumerate(pdf, start=1):
                rect = page.rect
                scale = min(2.0, 2000 / max(rect.width, rect.height, 1))
                pixmap = page.get_pixmap(
                    matrix=fitz.Matrix(scale, scale),
                    alpha=False,
                )
                archive.writestr(
                    f"page-{index:03d}.{image_format}",
                    pixmap.tobytes(image_type),
                )


def make_images_pdf(
    image_contents: list[tuple[str, bytes]],
    output: Path,
):
    """Create a reasonably sized PDF with one page per image.

    Images are downsampled only when their longest side exceeds 2200 pixels,
    then encoded as JPEG to avoid embedding very large original PNG streams.
    Pages use a 150-DPI physical size rather than treating pixels as PDF points.
    """
    max_dimension = 2200
    target_dpi = 150

    with fitz.open() as result:
        for image_name, content in image_contents:
            extension = Path(image_name).suffix.lower()
            image_type = "jpeg" if extension in {".jpg", ".jpeg"} else "png"

            try:
                with fitz.open(stream=content, filetype=image_type) as image:
                    if image.page_count < 1:
                        raise ValueError("empty image")
                    rect = image[0].rect
                    longest_side = max(rect.width, rect.height)
                    scale = min(1.0, max_dimension / max(longest_side, 1))
                    pixmap = image[0].get_pixmap(
                        matrix=fitz.Matrix(scale, scale),
                        alpha=False,
                    )
                    # JPEG is much smaller than many camera/phone PNG images.
                    optimized_image = pixmap.tobytes("jpeg")
                    width = pixmap.width * 72 / target_dpi
                    height = pixmap.height * 72 / target_dpi
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not read image: {image_name}",
                ) from None

            page = result.new_page(width=width, height=height)
            page.insert_image(page.rect, stream=optimized_image)

        result.save(str(output), garbage=4, deflate=True, clean=True)


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
# Convert PDF to JPG / PNG
# ========================================

@app.post("/pdf_to_images")
async def pdf_to_images(
    filename: str,
    image_format: str = "jpg",
):
    source = stored_path(filename, pdf_only=True)
    image_format = image_format.lower()

    if image_format not in {"jpg", "png"}:
        raise HTTPException(
            status_code=400,
            detail="Image format must be JPG or PNG.",
        )

    output_name = new_filename("converted", "zip")
    output = UPLOAD_DIR / output_name

    async with processing_slots:
        try:
            await run_in_threadpool(
                make_pdf_images, source, output, image_format
            )
            return {
                "filename": output_name,
                "size": f"{output.stat().st_size / 1024:.2f} KB",
                "message": f"PDF pages converted to {image_format.upper()} images.",
            }
        except Exception:
            safe_unlink(output)
            raise


# ========================================
# Convert JPG / PNG images to PDF
# ========================================

@app.post("/images_to_pdf")
async def images_to_pdf(
    files: list[UploadFile] = File(...),
):
    if not 1 <= len(files) <= 20:
        raise HTTPException(
            status_code=400,
            detail="Please choose between 1 and 20 images.",
        )

    allowed_extensions = {".jpg", ".jpeg", ".png"}
    image_contents = []
    total_bytes = 0

    try:
        for file in files:
            original_name = Path(file.filename or "").name
            extension = Path(original_name).suffix.lower()

            if extension not in allowed_extensions:
                raise HTTPException(
                    status_code=400,
                    detail="Only JPG, JPEG, and PNG images are supported.",
                )

            content = await file.read(MAX_FILE_BYTES + 1)
            if not content:
                raise HTTPException(
                    status_code=400,
                    detail=f"The image is empty: {original_name}",
                )
            if len(content) > MAX_FILE_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"Each image must be no larger than {MAX_FILE_MB} MB.",
                )

            total_bytes += len(content)
            if total_bytes > MAX_MERGE_TOTAL_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"Total image size must not exceed {MAX_MERGE_TOTAL_MB} MB.",
                )

            image_contents.append((original_name, content))

        output_name = new_filename("converted", "pdf")
        output = UPLOAD_DIR / output_name

        async with processing_slots:
            try:
                await run_in_threadpool(make_images_pdf, image_contents, output)
                return {
                    "filename": output_name,
                    "size": f"{output.stat().st_size / 1024:.2f} KB",
                    "pages": len(image_contents),
                    "message": "Images converted to PDF successfully.",
                }
            except Exception:
                safe_unlink(output)
                raise
    finally:
        for file in files:
            await file.close()


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
    elif path.suffix == ".zip":
        media_type = "application/zip"
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
    filename: str,
    target_bytes: int | None = None,
):
    source = stored_path(
        filename,
        pdf_only=True
    )

    if target_bytes is not None and target_bytes < 1024:
        raise HTTPException(
            status_code=400,
            detail="Target size must be at least 1 KB.",
        )

    if target_bytes is not None and target_bytes > 100 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Target size must not exceed 100 MB.",
        )

    output_name = new_filename(
        "compressed",
        "pdf"
    )
    output = UPLOAD_DIR / output_name

    async with processing_slots:
        try:
            if target_bytes is None:
                # Preserve the existing standard-compression behavior.
                await run_in_threadpool(
                    make_compressed,
                    source,
                    output,
                )
                target_met = None
                message = "Compression successful"
            else:
                target_met = await run_in_threadpool(
                    make_compressed_to_target,
                    source,
                    output,
                    target_bytes,
                )
                message = (
                    "Target size reached"
                    if target_met
                    else (
                        "Could not reach the requested size. "
                        "The best available result is provided."
                    )
                )

            original_bytes = source.stat().st_size
            compressed_bytes = output.stat().st_size
            original_mb = original_bytes / (1024 * 1024)
            compressed_mb = compressed_bytes / (1024 * 1024)
            reduction = (
                (1 - compressed_bytes / original_bytes) * 100
                if original_bytes
                else 0
            )

            return {
                "filename": output_name,
                "original_size": round(original_mb, 2),
                "compressed_size": round(compressed_mb, 2),
                "original_bytes": original_bytes,
                "compressed_bytes": compressed_bytes,
                "saved": round(max(0, reduction), 1),
                "target_bytes": target_bytes,
                "target_met": target_met,
                "message": message,
            }

        except Exception:
            safe_unlink(output)
            raise
