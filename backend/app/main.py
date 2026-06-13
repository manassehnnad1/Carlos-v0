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
    