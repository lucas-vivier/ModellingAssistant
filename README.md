# Questionnaire Dynamique

MVP d'un moteur de questionnaire dynamique avec interface web.

## Structure

```
questionnaire-app/
├── backend/
│   ├── main.py              # API FastAPI
│   ├── engine.py            # Moteur de questionnaire
│   ├── requirements.txt
│   └── templates/
│       └── dev_project.yaml # Template exemple
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

## Lancement

### Option 1 : VS Code (recommandé)

Lancez les deux serveurs en un clic :

1. `Cmd+Shift+P` (ou `Ctrl+Shift+P` sur Windows/Linux)
2. Tapez "Tasks: Run Task"
3. Sélectionnez **"Start Dev Servers"**

Les deux terminaux (backend + frontend) s'ouvriront automatiquement.

**Astuce** : Ajoutez un raccourci clavier pour aller encore plus vite. Dans `keybindings.json` :

```json
{
  "key": "cmd+shift+d",
  "command": "workbench.action.tasks.runTask",
  "args": "Start Dev Servers"
}
```

### Option 2 : Manuellement

#### Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

API disponible sur http://localhost:8000

#### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Interface disponible sur http://localhost:5173

## Créer un nouveau template

Les templates sont des fichiers YAML dans `backend/templates/`.

### Structure d'un template

```yaml
name: "Nom du questionnaire"
description: "Description"
version: "1.0"

questions:
  - id: identifiant_unique
    type: text | textarea | single_choice | multi_choice
    question: "La question à poser"
    placeholder: "Texte d'aide"  # optionnel
    required: true | false
    options:  # pour single_choice et multi_choice
      - id: option1
        label: "Label affiché"
    conditions:  # optionnel, affiche la question seulement si conditions remplies
      - field: id_autre_question
        operator: equals | not_equals | contains | not_contains
        value: valeur_attendue

outputs:
  - type: markdown | prompt
    name: "Nom de l'output"
    template: |
      Contenu avec {{variables}} et 
      {% if variable %}contenu conditionnel{% endif %}
```

### Opérateurs de conditions

- `equals` : la réponse est exactement égale à la valeur
- `not_equals` : la réponse est différente de la valeur
- `contains` : la valeur est présente dans la réponse (pour multi_choice)
- `not_contains` : la valeur est absente de la réponse

## API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/templates` | Liste les templates disponibles |
| POST | `/session/start` | Démarre une session |
| GET | `/session/{id}/status` | État de la session |
| POST | `/session/answer` | Soumet une réponse |
| GET | `/session/{id}/outputs` | Génère les outputs |
| DELETE | `/session/{id}` | Supprime une session |

## Évolutions possibles

1. **Persistance** : Ajouter une base de données pour sauvegarder les sessions
2. **LLM** : Ajouter des appels API pour des questions dynamiques
3. **Actions** : Déclencher des webhooks, créer des fichiers, envoyer des emails
4. **Auth** : Ajouter une authentification utilisateur
5. **Teams** : Intégration Microsoft Teams via Bot Framework
