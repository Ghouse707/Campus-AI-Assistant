import io
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from seed_data import seed

init_db()
seed()

client = TestClient(app)

print("=== 1. Testing Health Check ===")
r = client.get("/")
assert r.status_code == 200, r.text
print("Health check passed:", r.json())

print("\n=== 2. Testing Student and Admin Logins ===")
# Student Login
r_student = client.post("/api/auth/login", json={"email": "student@campus.edu", "password": "student123"})
assert r_student.status_code == 200, r_student.text
student_token = r_student.json()["access_token"]
print("Student logged in, role:", r_student.json()["user"]["role"])

# Admin Login
r_admin = client.post("/api/auth/login", json={"email": "admin@campus.edu", "password": "admin123"})
assert r_admin.status_code == 200, r_admin.text
admin_token = r_admin.json()["access_token"]
print("Admin logged in, role:", r_admin.json()["user"]["role"])

print("\n=== 3. Testing RBAC Route Protection ===")
# Student tries to post text knowledge (Must be forbidden 403)
r_forbidden = client.post(
    "/api/knowledge/text",
    headers={"Authorization": f"Bearer {student_token}"},
    json={"title": "Hacker Note", "content": "Test", "category": "Hack"}
)
assert r_forbidden.status_code == 403, f"Expected 403 but got {r_forbidden.status_code}"
print("RBAC Security Confirmed: Student was correctly blocked from Admin endpoint (403 Forbidden)")

print("\n=== 4. Testing User RAG Chat Interface ===")
# Exact query from requirements: 'When is the internal exam?'
r_chat1 = client.post(
    "/api/chat",
    headers={"Authorization": f"Bearer {student_token}"},
    json={"question": "When is the internal exam?"}
)
assert r_chat1.status_code == 200, r_chat1.text
ans1 = r_chat1.json()
print("Question 1: When is the internal exam?")
print("AI Answer 1:", ans1["answer"])
print("Found:", ans1["found"])
assert "12 July at 9:30 AM" in ans1["answer"]

# Negative query: information not present
r_chat2 = client.post(
    "/api/chat",
    headers={"Authorization": f"Bearer {student_token}"},
    json={"question": "What are the swimming pool timings on Tuesday?"}
)
assert r_chat2.status_code == 200, r_chat2.text
ans2 = r_chat2.json()
print("\nQuestion 2: What are the swimming pool timings on Tuesday?")
print("AI Answer 2:", ans2["answer"])
print("Found:", ans2["found"])
assert ans2["answer"] == "I couldn't find this information in the available college data."

print("\n=== 5. Testing Admin Text Knowledge Flow ===")
r_text = client.post(
    "/api/knowledge/text",
    headers={"Authorization": f"Bearer {admin_token}"},
    json={
        "title": "Robotics Club Hackathon 2026",
        "content": "The Annual Robotics Hackathon will take place on 5 December in the Innovation Lab.",
        "category": "Events"
    }
)
assert r_text.status_code == 200, r_text.text
new_item_id = r_text.json()["knowledge"]["id"]
print("Added text knowledge item ID:", new_item_id)

# Immediately ask AI about it
r_chat3 = client.post(
    "/api/chat",
    headers={"Authorization": f"Bearer {student_token}"},
    json={"question": "When is the robotics hackathon?"}
)
ans3 = r_chat3.json()
print("User asked: When is the robotics hackathon?")
print("AI Answer 3:", ans3["answer"])
assert "5 December" in ans3["answer"]

print("\n=== 6. Testing Admin PDF Upload and Text Extraction ===")
pdf_dummy = (
    b"%PDF-1.4\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
    b"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
    b"4 0 obj <</Length 120>> stream\nBT /F1 12 Tf 50 700 Td (Campus Placement: Google and Microsoft visit on 18 October) Tj ET\nendstream\nendobj\n"
    b"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\nxref\n0 6\n0000000000 65535 f \n"
    b"trailer <</Size 6 /Root 1 0 R>>\nstartxref\n300\n%%EOF\n"
)
r_pdf = client.post(
    "/api/knowledge/pdf",
    headers={"Authorization": f"Bearer {admin_token}"},
    data={"title": "Campus Placement Circular", "category": "Placements"},
    files={"file": ("placement.pdf", pdf_dummy, "application/pdf")}
)
assert r_pdf.status_code == 200, r_pdf.text
pdf_item_id = r_pdf.json()["knowledge"]["id"]
print("PDF Uploaded and indexed ID:", pdf_item_id)

# Ask AI about the PDF content
r_chat_pdf = client.post(
    "/api/chat",
    headers={"Authorization": f"Bearer {student_token}"},
    json={"question": "When do Google and Microsoft visit for placements?"}
)
print("User asked about PDF: When do Google and Microsoft visit for placements?")
print("AI Answer:", r_chat_pdf.json()["answer"])

print("\n=== 7. Testing Admin Image OCR Upload ===")
from PIL import Image, ImageDraw
img = Image.new("RGB", (600, 100), color=(255, 255, 255))
d = ImageDraw.Draw(img)
d.text((10, 35), "Convocation Ceremony on 28 December 2026", fill=(0, 0, 0))
img_bytes = io.BytesIO()
img.save(img_bytes, format="PNG")
img_bytes.seek(0)

r_img = client.post(
    "/api/knowledge/image",
    headers={"Authorization": f"Bearer {admin_token}"},
    data={"title": "Convocation Notice Board", "category": "Events"},
    files={"file": ("convocation.png", img_bytes.getvalue(), "image/png")}
)
assert r_img.status_code == 200, r_img.text
img_item_id = r_img.json()["knowledge"]["id"]
print("Image uploaded and OCR extracted ID:", img_item_id)
print("OCR Extracted Content:", r_img.json()["knowledge"]["content"])

# Ask AI about the image notice
r_chat_img = client.post(
    "/api/chat",
    headers={"Authorization": f"Bearer {student_token}"},
    json={"question": "When is the convocation ceremony?"}
)
print("User asked about Image Notice: When is the convocation ceremony?")
print("AI Answer:", r_chat_img.json()["answer"])

print("\n=== 8. Testing Admin List and Delete ===")
r_list = client.get("/api/knowledge", headers={"Authorization": f"Bearer {admin_token}"})
assert r_list.status_code == 200
print(f"Total knowledge items in database: {len(r_list.json()['knowledge'])}")

# Delete the test item
r_del = client.delete(f"/api/knowledge/{new_item_id}", headers={"Authorization": f"Bearer {admin_token}"})
assert r_del.status_code == 200
print("Deleted test item, confirmed.")

print("\n=== ALL END-TO-END TESTS PASSED SUCCESSFULLY! ===")
