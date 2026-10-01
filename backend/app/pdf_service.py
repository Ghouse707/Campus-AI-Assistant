import io
from pathlib import Path
from typing import Union
from pypdf import PdfReader

def extract_text_from_pdf(source: Union[str, Path, bytes, io.BytesIO]) -> str:
    """
    Extract readable text from a PDF file path or byte stream.
    Cleans up redundant whitespaces and formats multi-page content.
    """
    if isinstance(source, (str, Path)):
        reader = PdfReader(str(source))
    elif isinstance(source, bytes):
        reader = PdfReader(io.BytesIO(source))
    else:
        reader = PdfReader(source)

    extracted_pages = []
    for idx, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text and page_text.strip():
            # Clean up linebreaks and excess spaces
            cleaned = "\n".join(line.strip() for line in page_text.splitlines() if line.strip())
            extracted_pages.append(cleaned)

    full_text = "\n\n".join(extracted_pages).strip()
    return full_text
