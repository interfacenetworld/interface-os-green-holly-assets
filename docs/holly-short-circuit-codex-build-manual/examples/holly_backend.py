from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import uuid

app = FastAPI(title="Holly Short Circuit Voice Service", version="0.1.0")

class ConversationInput(BaseModel):
    conversation_id: str | None = None
    text: str = Field(min_length=1, max_length=8000)
    locale: str = "en-US"

@app.get("/health")
async def health():
    return {"ok": True, "service": "holly-voice"}

@app.post("/conversation")
async def conversation(data: ConversationInput):
    text=data.text.strip()
    if not text:
        raise HTTPException(400,"Empty message")
    # Replace this deterministic placeholder with the Interface AI adapter.
    response=f"I heard you say: {text}"
    return {
        "conversationId": data.conversation_id or f"conv_{uuid.uuid4().hex}",
        "messageId": f"msg_{uuid.uuid4().hex}",
        "text": response,
        "speechText": response,
        "expression": "warm",
        "expressionIntensity": 0.2,
        "gesture": "explain"
    }
