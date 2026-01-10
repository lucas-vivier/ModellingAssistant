# Dynamic Questionnaire

MVP for a dynamic questionnaire engine with a web interface.

## Structure

```
questionnaire-app/
├── backend/
│   ├── main.py              # FastAPI API
│   ├── engine.py            # Questionnaire engine
│   ├── requirements.txt
│   └── templates/
│       └── dev_project.yaml # Example template
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── TemplateSelector.jsx
│   │       ├── Questionnaire.jsx
│   │       ├── QuestionCard.jsx
│   │       └── OutputViewer.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Installation

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Running

### Option 1: VS Code (recommended)

Start both servers with one click:

1. `Cmd+Shift+P` (ou `Ctrl+Shift+P` sur Windows/Linux)
2. Type "Tasks: Run Task"
3. Select **"Start Dev Servers"**

Both terminals (backend + frontend) will open automatically.

**Tip**: Add a keyboard shortcut to go even faster. In `keybindings.json`:

```json
{
  "key": "cmd+shift+d",
  "command": "workbench.action.tasks.runTask",
  "args": "Start Dev Servers"
}
```

### Option 2: Manually

#### Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

API available at http://localhost:8000

#### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

UI available at http://localhost:5173

## Create a new template

Templates are YAML files in `backend/templates/`.

### Template structure

```yaml
name: "Questionnaire name"
description: "Description"
version: "1.0"

questions:
  - id: identifiant_unique
    type: text | textarea | single_choice | multi_choice
    question: "The question to ask"
    placeholder: "Help text"  # optional
    required: true | false
    options:  # for single_choice and multi_choice
      - id: option1
        label: "Label affiché"
    conditions:  # optional, show the question only if conditions are met
      - field: id_autre_question
        operator: equals | not_equals | contains | not_contains
        value: expected_value

outputs:
  - type: markdown | prompt
    name: "Output name"
    template: |
      Content with {{variables}} and 
      {% if variable %}conditional content{% endif %}
```

### Condition operators

- `equals`: the answer is exactly equal to the value
- `not_equals`: the answer is different from the value
- `contains`: the value is present in the answer (for multi_choice)
- `not_contains`: the value is absent from the answer

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/templates` | List available templates |
| POST | `/session/start` | Start a session |
| GET | `/session/{id}/status` | Session status |
| POST | `/session/answer` | Submit an answer |
| GET | `/session/{id}/outputs` | Generate outputs |
| DELETE | `/session/{id}` | Delete a session |

## Possible next steps

1. **Persistence**: Add a database to store sessions
2. **LLM**: Add API calls for dynamic questions
3. **Actions**: Trigger webhooks, create files, send emails
4. **Auth**: Add user authentication
5. **Teams**: Integrate Microsoft Teams via Bot Framework
