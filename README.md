<<<<<<< HEAD
# Campus AI 🎓

An intelligent, RAG-powered college knowledge assistant and administration management system.

Campus AI is strictly divided into **ONLY TWO** sides:
1. **USER (Student)**: Contains **ONLY** an AI Assistant chat (ChatGPT-style) to ask any questions regarding college data, exam dates, schedules, circulars, fees, and rules.
2. **ADMIN**: A dedicated dashboard to feed knowledge to the AI through exactly three content types:
   - **Text**: Enter direct notices, announcements, and rules.
   - **PDF**: Upload PDF files with automatic text extraction (`pypdf`).
   - **Images**: Upload notices/circulars with automatic Optical Character Recognition (`OCR`).

---

## 🏛️ Architecture Flow

```
ADMIN
  ↓
TEXT / PDF / IMAGE
  ↓
Extract & Store Information
  ↓
Knowledge Database (SQLite)
  ↓
AI Assistant (RAG Pipeline)
  ↑
USER asks question
  ↓
AI searches the knowledge database
  ↓
Retrieves relevant information
  ↓
Generates answer
  ↓
Shows answer to USER
```

### Retrieval & Answering Logic
- **Example Question**: *"When is the internal exam?"*
  - **AI Answer**: *"Internal exam will be conducted on 12 July at 9:30 AM."*
- **If Information is Not in Database**:
  - **AI Answer**: *"I couldn't find this information in the available college data."*

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 18
  - Vite
  - Tailwind CSS
  - Lucide React Icons
  - React Router DOM
- **Backend**:
  - Python 3.10+ (tested on Python 3.13)
  - FastAPI
  - SQLite3 (Relational + BM25 keyword relevance ranking)
  - PyJWT & PBKDF2 cryptography for RBAC authentication
- **Document & Image Processing**:
  - `pypdf`: Full multi-page PDF text extraction
  - `winocr` / `pytesseract`: Fast OCR for images, circulars, and photos
- **AI & RAG**:
  - Dual-mode intelligent RAG:
    - **Smart Local Extractive RAG**: Works immediately out of the box with zero external API keys!
    - **Generative LLM Mode**: Seamlessly plug in `GEMINI_API_KEY` or `OPENAI_API_KEY` in `.env` for generative responses.

---

## 🗄️ Database Schema

### `users`
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL
- `email`: TEXT UNIQUE NOT NULL
- `password`: TEXT NOT NULL (PBKDF2 salted hash)
- `role`: TEXT NOT NULL ('user' | 'admin')
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### `knowledge`
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `title`: TEXT NOT NULL
- `content`: TEXT NOT NULL (Extracted PDF/OCR text or direct entered text)
- `source_type`: TEXT NOT NULL ('text' | 'pdf' | 'image')
- `category`: TEXT NOT NULL
- `file_path`: TEXT (Path to original uploaded file if PDF/Image)
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Run

Open a terminal in the root directory:

```bash
cd backend
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Initialize and seed the database with sample data:

```bash
python seed_data.py
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload --port 8000
```

The backend API will run at `http://127.0.0.1:8000`.  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup & Run

Open a second terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Vite development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🔐 Default Credentials & 1-Click Demo

Campus AI includes pre-seeded demo accounts. The login screen also features **1-Click Demo Access** buttons:

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campus.edu` | `admin123` | **Admin Dashboard** (`/admin`) |
| **Student (User)** | `student@campus.edu` | `student123` | **AI Assistant Chat** (`/chat`) |

> 🔒 **Security Guarantee**: Regular users cannot access `/admin`. Non-admin requests to admin endpoints return `403 Forbidden`.

---

## 💬 Sample Inquiries to Try

Log in as a student (`student@campus.edu`) and test asking the AI:

1. **Internal Exams**:
   - Query: *"When is the internal exam?"*
   - AI: *"Internal exam will be conducted on 12 July at 9:30 AM."*
2. **Library Hours**:
   - Query: *"What are the central library hours?"*
   - AI: *"The Central Library is open Monday to Saturday from 8:00 AM to 9:00 PM, and Sundays from 10:00 AM to 4:00 PM."*
3. **Fee Deadlines**:
   - Query: *"What is the semester fee payment deadline?"*
   - AI: *"The last date for odd semester fee submission without late fees is 25 August 2026. A late fine of 500 rupees per week applies thereafter on the college ERP portal."*
4. **Hostel Rules**:
   - Query: *"What are the hostel curfew timings?"*
   - AI: *"Hostel gates close strictly at 10:00 PM every night."*
5. **Information Not in Database**:
   - Query: *"What are the swimming pool timings on Tuesday?"*
   - AI: *"I couldn't find this information in the available college data."*

---

## ⚙️ Environment Variables (Optional)

In `backend/.env`:

```env
# Optional LLM API Keys (Works out of the box with local RAG if left blank)
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here

# JWT Configuration
JWT_SECRET=campus_ai_super_secret_jwt_key_change_in_production_2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## 🧪 Automated Testing

A complete integration test script is provided. To run the end-to-end verification:

```bash
cd backend
python test_pipeline.py
```
=======
# campus_ai
>>>>>>> 258e2deb841713eb52828447d6deff82d87919b4
