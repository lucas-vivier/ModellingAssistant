"""FastAPI API for the dynamic ComPath."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
from pathlib import Path

from engine import (
    load_template,
    get_next_question,
    get_all_visible_questions,
    calculate_progress,
    generate_outputs,
)

app = FastAPI(title="ComPath", version="1.0.0")

# CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage (for the MVP)
sessions: dict[str, dict] = {}


class StartRequest(BaseModel):
    template_name: str


class AnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: Any


@app.get("/templates")
def list_templates():
    """List all available templates."""
    templates_dir = Path(__file__).parent / "templates"
    templates = []
    
    for f in templates_dir.glob("*.yaml"):
        template = load_template(f.stem)
        templates.append({
            "id": f.stem,
            "name": template.get("name", f.stem),
            "description": template.get("description", "")
        })
    
    return {"templates": templates}


@app.post("/session/start")
def start_session(request: StartRequest):
    """Start a new ComPath session."""
    import uuid
    
    try:
        template = load_template(request.template_name)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Template not found")
    
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "template_name": request.template_name,
        "template": template,
        "answers": {}
    }
    
    return {
        "session_id": session_id,
        "template_name": template.get("name"),
        "description": template.get("description"),
        "template": template
    }


@app.get("/session/{session_id}/status")
def get_session_status(session_id: str):
    """Return the current session state."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    template = session["template"]
    answers = session["answers"]
    
    questions = get_all_visible_questions(template, answers)
    next_question = get_next_question(template, answers)
    progress = calculate_progress(template, answers)
    
    return {
        "session_id": session_id,
        "progress": progress,
        "questions": questions,
        "next_question": next_question,
        "is_complete": next_question is None,
        "answers": answers
    }


@app.post("/session/answer")
def submit_answer(request: AnswerRequest):
    """Submit an answer to a question."""
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[request.session_id]
    session["answers"][request.question_id] = request.answer
    
    return get_session_status(request.session_id)


@app.get("/session/{session_id}/outputs")
def get_outputs(session_id: str):
    """Generate the final outputs for the ComPath."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    template = session["template"]
    answers = session["answers"]
    
    outputs = generate_outputs(template, answers)
    
    return {"outputs": outputs}


@app.delete("/session/{session_id}")
def delete_session(session_id: str):
    """Delete a session."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    del sessions[session_id]
    return {"message": "Session deleted"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
