# 🎓 Campus AI

Campus AI is an AI-powered virtual campus assistant designed to help students easily access college-related information.

Students can ask questions through an AI assistant, while administrators can manage campus information such as announcements, exams, PDFs, and images.

---

## 📸 Screenshots

### 🏠 Main Page

<img width="2834" height="1492" alt="image" src="https://github.com/user-attachments/assets/7f0e62b1-6e16-4c47-8998-8fb9b66423a2" />



### 👨‍🎓 Student Dashboard

<img width="2848" height="1484" alt="image" src="https://github.com/user-attachments/assets/d3161d6d-45e8-4269-85f6-077bae40cc9f" />



### 👨‍💼 Admin Dashboard

<img width="2868" height="1526" alt="image" src="https://github.com/user-attachments/assets/9d18b6bd-a7bd-409f-b26e-b0efa13068bd" />

## ✨ Features

### 👨‍🎓 Student

- 🤖 AI-powered campus assistant
- 💬 Ask questions using natural language
- 📚 Get answers from college information
- 📄 Access uploaded PDFs
- 🖼️ Access uploaded images
- 📢 View announcements
- 📝 View examination information
- 🔐 Secure authentication

### 👨‍💼 Admin

- 📢 Add announcements
- 📝 Add exam information
- 📄 Upload PDF documents
- 🖼️ Upload images
- 🗂️ Manage campus information
- 🔐 Secure admin authentication

---

## 🧠 AI Assistant

The main feature of Campus AI is the AI-powered campus assistant.

Students can ask questions such as:

```text
When is the Maths exam?

What are today's announcements?

Show me the uploaded study material.

Explain this PDF.

What is the upcoming exam schedule?

The system retrieves relevant campus information and uses an AI model to generate an answer.
🔎 RAG
Campus AI uses Retrieval-Augmented Generation (RAG) to answer questions using college-specific information.
Workflow
Student Question
       ↓
Retrieve Relevant Information
       ↓
AI Model
       ↓
Generated Answer

This allows the AI assistant to use information provided by the college instead of depending only on general AI knowledge.
📄 Document & Image Support
Administrators can add different types of campus resources:
- PDF documents
- Images
- Announcements
- Exam information
- Academic materials
- Campus notices
These resources can be used by the AI assistant to answer student questions.
🖼️ OCR Support
Campus AI can extract text from images using OCR (Optical Character Recognition).
This can be useful for:
- Exam schedules
- Notice board images
- Circulars
- Timetables
- Scanned documents
Image
  ↓
OCR
  ↓
Extracted Text
  ↓
Campus Knowledge
  ↓
AI Assistant

🏗️ System Architecture
                    ┌─────────────────┐
                    │     Student     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ React Frontend  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  FastAPI Backend│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          Database          RAG          AI Model
              │              │              │
              ▼              ▼              ▼
           SQLite       Documents      Gemini/OpenAI

🛠️ Technology Stack
Category	Technology
Frontend	React, JavaScript, HTML, CSS
Build Tool	Vite
Backend	Python, FastAPI
Database	SQLite
Authentication	JWT
AI	Google Gemini / OpenAI
RAG	Retrieval-Augmented Generation
OCR	Optical Character Recognition
Version Control	Git & GitHub


📁 Project Structure
Campus-AI-Assistant/
│
├── backend/
│   ├── app/
│   ├── uploads/
│   │   ├── pdfs/
│   │   └── images/
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── assets/
│   ├── main-page.png
│   ├── student-page.png
│   └── admin-page.png
│
├── .gitignore
└── README.md

⚙️ Installation
1. Clone the Repository
git clone https://github.com/Ghouse707/Campus-AI-Assistant.git
cd Campus-AI-Assistant

2. Backend Setup
cd backend
python -m venv venv

Activate the virtual environment on Windows:
venv\Scripts\activate

Install dependencies:
pip install -r requirements.txt

🔐 Environment Variables
Create a .env file inside the backend directory:
JWT_SECRET=your_jwt_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

⚠️ Never upload your real .env file or API keys to GitHub.

▶️ Run Backend
python -m uvicorn app.main:app --reload

💻 Run Frontend
Open another terminal:
cd frontend
npm install
npm run dev

👥 User Roles
Student
Students can:
- Ask the AI assistant questions
- Access campus information
- View available resources
- Get answers from uploaded documents
Admin
Admins can:
- Upload PDFs
- Upload images
- Add announcements
- Add exam information
- Manage campus information
🎯 Example Use Cases
Campus AI can be used for:
- College announcements
- Exam schedules
- Academic documents
- Timetables
- Campus notices
- Study materials
- Student FAQs
- College events
🔮 Future Improvements
- 🎤 Voice-based AI assistant
- 🔎 Advanced semantic search
- 🗃️ Vector database integration
- 📱 Mobile application
- 📊 Admin analytics dashboard
- 🌐 Multi-language support
- 🔔 Smart notifications
- 📅 Calendar integration
🔒 Security
Campus AI uses basic security practices including:
- JWT authentication
- Student and admin role separation
- Environment variables for secrets
- .gitignore for sensitive files
- Protected admin functionality
👨‍💻 Author
Ghouse Pasha
GitHub: https://github.com/Ghouse707
📄 License
This project is developed for educational and academic purposes.

