import asyncio
import io
import os
import sys
from pathlib import Path
from typing import Union
from PIL import Image
from .config import TESSERACT_CMD

def _configure_pytesseract():
    try:
        import pytesseract
        if TESSERACT_CMD and os.path.exists(TESSERACT_CMD):
            pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
        return pytesseract
    except ImportError:
        return None

async def _ocr_with_winocr(pil_img: Image.Image) -> str:
    """Extract text using Windows 10/11 built-in OCR (winocr)."""
    try:
        import winocr
        result = await winocr.recognize_pil(pil_img, "en")
        if result and hasattr(result, "text"):
            return result.text.strip()
    except Exception as e:
        print(f"[OCR] winocr failed: {e}")
    return ""

def _ocr_with_tesseract(pil_img: Image.Image) -> str:
    """Extract text using pytesseract if available."""
    pyt = _configure_pytesseract()
    if not pyt:
        return ""
    try:
        text = pyt.image_to_string(pil_img)
        return text.strip()
    except Exception as e:
        print(f"[OCR] pytesseract failed: {e}")
        return ""

async def extract_text_from_image(source: Union[str, Path, bytes, io.BytesIO]) -> str:
    """
    Run OCR on an image (path, bytes, or buffer) to extract text.
    First tries Windows native OCR (winocr) or Tesseract, ensuring high accuracy on Windows.
    """
    if isinstance(source, (str, Path)):
        img = Image.open(str(source))
    elif isinstance(source, bytes):
        img = Image.open(io.BytesIO(source))
    else:
        img = Image.open(source)

    # Convert to RGB if needed
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    extracted_text = ""

    # On Windows, try winocr first as it is native and requires no external binary install
    if sys.platform == "win32":
        try:
            extracted_text = await _ocr_with_winocr(img)
        except Exception:
            extracted_text = ""

    # If winocr returned nothing or we are on non-Windows, try tesseract
    if not extracted_text:
        try:
            # Run blocking tesseract in threadpool
            extracted_text = await asyncio.to_thread(_ocr_with_tesseract, img)
        except Exception:
            extracted_text = ""

    # Clean up results
    cleaned_lines = [line.strip() for line in extracted_text.splitlines() if line.strip()]
    return "\n".join(cleaned_lines)
