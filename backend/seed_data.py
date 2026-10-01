import os
from pathlib import Path
from PIL import Image, ImageDraw
from pypdf import PdfWriter
from app.database import get_db, init_db
from app.auth import hash_password
from app.config import PDFS_DIR, IMAGES_DIR

def create_sample_files():
    """Create sample PDF and image files for initial seeding."""
    # 1. Sample Image Notice
    image_path = IMAGES_DIR / "sample_sports_notice.png"
    if not image_path.exists():
        img = Image.new("RGB", (700, 200), color=(255, 255, 255))
        d = ImageDraw.Draw(img)
        d.text((25, 40), "CAMPUS ANNUAL SPORTS MEET 2026", fill=(15, 23, 42))
        d.text((25, 80), "Annual Sports Meet will be held on 20 November at College Ground.", fill=(30, 41, 59))
        d.text((25, 120), "Registration deadline: 10 November at Sports Complex Office.", fill=(71, 85, 105))
        img.save(str(image_path))

    # 2. Sample PDF Notice
    pdf_path = PDFS_DIR / "sample_academic_calendar.pdf"
    if not pdf_path.exists():
        writer = PdfWriter()
        page = writer.add_blank_page(width=595, height=842)
        # Note: creating a clean PDF with textual annotation or text stream
        # Or write simple PDF stream
        pdf_raw = (
            b"%PDF-1.4\n"
            b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
            b"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
            b"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
            b"4 0 obj <</Length 210>> stream\n"
            b"BT\n"
            b"/F1 18 Tf\n"
            b"50 720 Td\n"
            b"(Campus Merit Scholarship Scheme 2026) Tj\n"
            b"/F1 12 Tf\n"
            b"0 -35 Td\n"
            b"(Merit scholarships of 25000 INR awarded to top 5 students in each branch.) Tj\n"
            b"0 -25 Td\n"
            b"(Submit application form to Academic Registrar by 30 October 2026.) Tj\n"
            b"ET\n"
            b"endstream\n"
            b"endobj\n"
            b"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
            b"xref\n"
            b"0 6\n"
            b"0000000000 65535 f \n"
            b"0000000009 00000 n \n"
            b"0000000058 00000 n \n"
            b"0000000115 00000 n \n"
            b"0000000244 00000 n \n"
            b"0000000508 00000 n \n"
            b"trailer <</Size 6 /Root 1 0 R>>\n"
            b"startxref\n"
            b"577\n"
            b"%%EOF\n"
        )
        with open(pdf_path, "wb") as f:
            f.write(pdf_raw)

    return image_path, pdf_path

def seed():
    """Seed initial users and college knowledge database."""
    init_db()
    img_path, pdf_path = create_sample_files()

    with get_db() as conn:
        cursor = conn.cursor()

        # Seed Users
        users = [
            ("Campus Administrator", "admin@campus.edu", "admin123", "admin"),
            ("Alex Johnson (Student)", "student@campus.edu", "student123", "user"),
        ]

        for name, email, raw_password, role in users:
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                    (name, email, hash_password(raw_password), role)
                )
                print(f"Seeded user: {email} (role: {role})")

        # Seed Knowledge Items
        knowledge_entries = [
            (
                "Internal Exam Schedule",
                "Internal exam will be conducted on 12 July at 9:30 AM. Students must report to Hall B with valid college identity cards.",
                "text",
                "Exams",
                None
            ),
            (
                "Central Library Timings & Borrowing Limits",
                "The Central Library is open Monday to Saturday from 8:00 AM to 9:00 PM, and Sundays from 10:00 AM to 4:00 PM. Each student can borrow up to 4 books for a 14-day loan period.",
                "text",
                "Library",
                None
            ),
            (
                "Odd Semester Fee Payment Schedule",
                "The last date for odd semester fee submission without late fees is 25 August 2026. A late fine of 500 rupees per week applies thereafter on the college ERP portal.",
                "text",
                "Finance",
                None
            ),
            (
                "Campus Hostel Timings & Rules",
                "Hostel gates close strictly at 10:00 PM every night. Students requiring night-out permission must submit warden approval slips 24 hours prior.",
                "text",
                "Hostel",
                None
            ),
            (
                "Campus Merit Scholarship Notice (PDF)",
                "Campus Merit Scholarship Scheme 2026: Merit scholarships of 25,000 INR awarded to top 5 students in each branch. Submit application form to Academic Registrar by 30 October 2026.",
                "pdf",
                "Scholarships",
                str(pdf_path)
            ),
            (
                "Annual Sports Meet Announcement (Image)",
                "Annual Sports Meet will be held on 20 November at College Ground. Registration deadline: 10 November at Sports Complex Office.",
                "image",
                "Sports",
                str(img_path)
            ),
        ]

        for title, content, stype, category, fpath in knowledge_entries:
            cursor.execute("SELECT id FROM knowledge WHERE title = ?", (title,))
            if not cursor.fetchone():
                cursor.execute(
                    """
                    INSERT INTO knowledge (title, content, source_type, category, file_path)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (title, content, stype, category, fpath)
                )
                print(f"Seeded knowledge: '{title}' [{stype}]")

    print("\nDatabase seeded successfully!")
    print("Default Admin: admin@campus.edu / admin123")
    print("Default Student: student@campus.edu / student123")

if __name__ == "__main__":
    seed()
