import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


from app.agent import get_agent_response
from app.memory import recall_memories, get_all_memories, store_memory

app = FastAPI(title="Hot take API")



    