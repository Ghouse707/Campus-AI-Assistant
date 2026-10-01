from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ..auth import get_current_user
from ..rag_service import ask_campus_ai

router = APIRouter(prefix="/api/chat", tags=["User AI Assistant"])

class ChatRequest(BaseModel):
    question: str

@router.post("")
async def chat_with_campus_ai(
    payload: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    User endpoint: Ask questions to the Campus AI Assistant.
    Searches the stored knowledge database, retrieves relevant information,
    and returns the accurate synthesized answer.
    """
    question = payload.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )

    result = await ask_campus_ai(question)

    return {
        "question": question,
        "answer": result["answer"],
        "found": result["found"],
        "sources": result["sources"]
    }
