import os
import shutil
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from ..auth import require_admin
from ..config import PDFS_DIR, IMAGES_DIR
from ..database import get_db
from ..pdf_service import extract_text_from_pdf
from ..ocr_service import extract_text_from_image

router = APIRouter(prefix="/api/knowledge", tags=["Admin Knowledge"])

class TextKnowledgeCreate(BaseModel):
    title: str
    content: str
    category: str

@router.post("/text")
def add_text_knowledge(
    payload: TextKnowledgeCreate,
    admin: dict = Depends(require_admin)
):
    """
    Admin: Add text content directly into knowledge database.
    """
    if not payload.title.strip() or not payload.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title and content are required."
        )

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO knowledge (title, content, source_type, category, file_path)
            VALUES (?, ?, 'text', ?, NULL)
            """,
            (payload.title.strip(), payload.content.strip(), payload.category.strip() or "General")
        )
        record_id = cursor.lastrowid

        cursor.execute("SELECT * FROM knowledge WHERE id = ?", (record_id,))
        record = dict(cursor.fetchone())

    return {
        "message": "Text knowledge successfully added and indexed.",
        "knowledge": record
    }

@router.post("/pdf")
async def upload_pdf_knowledge(
    title: str = Form(...),
    category: str = Form("General"),
    file: UploadFile = File(...),
    admin: dict = Depends(require_admin)
):
    """
    Admin: Upload PDF, extract readable text, and store in knowledge database.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a PDF document (.pdf)."
        )

    # Save PDF file to disk with unique filename
    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = PDFS_DIR / unique_name
    file_bytes = await file.read()
    
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Extract text using pypdf
    try:
        extracted_text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        extracted_text = ""
        print(f"[PDF Extraction Error]: {e}")

    if not extracted_text.strip():
        extracted_text = f"Notice / PDF document: {title}. File attached: {file.filename}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO knowledge (title, content, source_type, category, file_path)
            VALUES (?, ?, 'pdf', ?, ?)
            """,
            (title.strip(), extracted_text.strip(), category.strip() or "General", str(file_path))
        )
        record_id = cursor.lastrowid
        cursor.execute("SELECT * FROM knowledge WHERE id = ?", (record_id,))
        record = dict(cursor.fetchone())

    return {
        "message": "PDF uploaded and text extracted successfully.",
        "knowledge": record,
        "extracted_length": len(extracted_text)
    }

@router.post("/image")
async def upload_image_knowledge(
    title: str = Form(...),
    category: str = Form("General"),
    file: UploadFile = File(...),
    admin: dict = Depends(require_admin)
):
    """
    Admin: Upload image, run OCR to extract text, and store in knowledge database.
    """
    valid_extensions = (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff")
    if not any(file.filename.lower().endswith(ext) for ext in valid_extensions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file must be an image ({', '.join(valid_extensions)})."
        )

    # Save image to disk with unique name
    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = IMAGES_DIR / unique_name
    image_bytes = await file.read()

    with open(file_path, "wb") as f:
        f.write(image_bytes)

    # Run OCR to extract text from the image
    try:
        extracted_text = await extract_text_from_image(image_bytes)
    except Exception as e:
        extracted_text = ""
        print(f"[OCR Extraction Error]: {e}")

    if not extracted_text.strip():
        extracted_text = f"Image Notice: {title}. Visual notice uploaded: {file.filename}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO knowledge (title, content, source_type, category, file_path)
            VALUES (?, ?, 'image', ?, ?)
            """,
            (title.strip(), extracted_text.strip(), category.strip() or "General", str(file_path))
        )
        record_id = cursor.lastrowid
        cursor.execute("SELECT * FROM knowledge WHERE id = ?", (record_id,))
        record = dict(cursor.fetchone())

    return {
        "message": "Image uploaded and OCR text extracted successfully.",
        "knowledge": record,
        "extracted_length": len(extracted_text)
    }

@router.get("")
def list_knowledge(
    source_type: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    """
    Admin: List all uploaded knowledge with Title, Type, Category, Date.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        if source_type and source_type in ("text", "pdf", "image"):
            cursor.execute(
                "SELECT * FROM knowledge WHERE source_type = ? ORDER BY id DESC",
                (source_type,)
            )
        else:
            cursor.execute("SELECT * FROM knowledge ORDER BY id DESC")
        rows = [dict(row) for row in cursor.fetchall()]

    return {"knowledge": rows}

@router.delete("/{knowledge_id}")
def delete_knowledge(
    knowledge_id: int,
    admin: dict = Depends(require_admin)
):
    """
    Admin: Delete a knowledge record and remove physical file if exists.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT file_path FROM knowledge WHERE id = ?", (knowledge_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Knowledge record not found."
            )

        file_path = row["file_path"]
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"[File Delete Warning]: {e}")

        cursor.execute("DELETE FROM knowledge WHERE id = ?", (knowledge_id,))

    return {"message": "Knowledge record deleted successfully.", "deleted_id": knowledge_id}
