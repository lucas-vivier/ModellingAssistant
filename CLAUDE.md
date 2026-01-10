# CLAUDE.md

This file provides guidance for Claude Code when working on this project.

## Project Overview

ModellingAssistant is a dynamic questionnaire system for scientific modeling. It provides a configurable framework where domain-specific questionnaires are defined in YAML templates, and the system guides users through questions with conditional logic to generate structured outputs.

**Key concept**: This is a general-purpose questionnaire engine that can be adapted to various scientific modeling domains through YAML configuration.

## Tech Stack

### Backend
- **Python 3.12+** with FastAPI
- **Pydantic** for data validation
- **PyYAML** for template parsing
- **Uvicorn** as ASGI server

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Project Structure

```
backend/
  main.py          # FastAPI application and API endpoints
  engine.py        # Questionnaire logic (conditions, progress, output generation)
  templates/       # YAML questionnaire templates
  requirements.txt

frontend/
  # React + Vite application
  package.json
```

## Development Commands

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

VS Code tasks are configured for running the development environment.

## Code Style Guidelines

### Python
- Use type hints on all functions and variables
- Follow PEP 8 conventions
- Use explicit HTTPException with clear error messages for API errors
- Keep functions focused and single-purpose

### Frontend
- Use functional React components
- Tailwind for styling (no separate CSS files)
- English for all code, comments, and documentation

## Architecture Notes

- **Sessions are stored in memory** (dict in main.py) - this is intentional for MVP simplicity
- **Conditional logic** is evaluated in engine.py using operators: `equals`, `not_equals`, `contains`, `not_contains`
- **Output templates** support `{{variable}}` substitution and `{% if var %}...{% endif %}` conditionals

## Design Philosophy

- **Balance**: Start simple but design for extensibility
- **No tests required** at this stage - focus on feature development
- Keep solutions pragmatic - this started as a prototype but should support growth
- Prefer editing existing files over creating new ones

## Git Workflow

- Commit directly to main/master
- Clear, descriptive commit messages

## When Adding New Features

1. Check if the feature belongs in `engine.py` (logic) or `main.py` (API)
2. For new question types: update the engine's condition evaluation
3. For new output formats: extend the `generate_outputs` function
4. YAML templates are the primary configuration mechanism - prefer adding template features over hardcoding
