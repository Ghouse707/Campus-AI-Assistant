from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import UPLOADS_DIR
from .database import init_db
from .routes import auth_routes, knowledge_routes, chat_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created on startup
    init_db()
    # Check if database has users; if empty, run seed
    try:
        from ..seed_data import seed
        seed()
    except Exception as e:
        print(f"[Lifespan Init Warning]: {e}")
    yield

app = FastAPI(
    title="Campus AI Backend",
    description="Backend API for Campus AI Knowledge Base and RAG Assistant",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads Directory for access to stored PDFs/Images if needed
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Include Routers
app.include_router(auth_routes.router)
app.include_router(knowledge_routes.router)
app.include_router(chat_routes.router)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Campus AI API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
