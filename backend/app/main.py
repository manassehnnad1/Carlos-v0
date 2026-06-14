import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


from app.agent import get_agent_response
from app.memory import recall_memories, get_all_memories, store_memory

app = FastAPI(title="Hot take API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# -----------Request and Response models--------------#

class ChatRequest(BaseModel):
    user_id : str
    message : str
    history : list[dict] = []

class ChatResponse(BaseModel):
    reply : str
    new_memory : str | None


class MemoriesResponse(BaseModel):
    memories: list[str]

#--------Endpoints-------------#

@app.get("/health")
async def health():
    return {'status': 'ok'}

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.user_id or not req.message.strip():
        raise HTTPException(status_code=400, detail="user_id and message are required")
    

    memories = await recall_memories(user_id=req.user_id, query=req.message)

    reply, fragments = await get_agent_response(
        user_message=req.message,
        memories=memories,
        conversation_history=req.history
    )

    if fragments:
        await store_memory(user_id=req.user_id, fragment=fragments)

    return ChatResponse(reply=reply, new_memory=fragments)

@app.get("/memories/{user_id}", response_model=MemoriesResponse)
async def get_memories(user_id: str):
    """
        returns all stored memory for a user
    """

    if not user_id: 
        raise HTTPException(status_code=400, detail="user_id not found and is required")
    
    memories = await get_all_memories(user_id=user_id)
    return MemoriesResponse(memories=memories)
    