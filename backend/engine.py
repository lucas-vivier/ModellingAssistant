"""Moteur de questionnaire dynamique."""

import yaml
from pathlib import Path
from typing import Any


def load_template(template_name: str) -> dict:
    """Charge un template YAML."""
    path = Path(__file__).parent / "templates" / f"{template_name}.yaml"
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def evaluate_condition(condition: dict, answers: dict) -> bool:
    """
    Évalue une condition pour déterminer si une question doit être affichée.
    
    Opérateurs supportés:
    - equals: valeur exacte
    - not_equals: différent de
    - contains: présent dans une liste (pour multi_choice)
    - not_contains: absent d'une liste
    """
    field = condition["field"]
    operator = condition["operator"]
    value = condition["value"]
    
    answer = answers.get(field)
    
    if answer is None:
        return False
    
    if operator == "equals":
        return answer == value
    elif operator == "not_equals":
        return answer != value
    elif operator == "contains":
        if isinstance(answer, list):
            return value in answer
        return answer == value
    elif operator == "not_contains":
        if isinstance(answer, list):
            return value not in answer
        return answer != value
    
    return False


def should_show_question(question: dict, answers: dict) -> bool:
    """Détermine si une question doit être affichée selon ses conditions."""
    conditions = question.get("conditions", [])
    
    if not conditions:
        return True
    
    # Toutes les conditions doivent être vraies (AND)
    return all(evaluate_condition(c, answers) for c in conditions)


def get_next_question(template: dict, answers: dict) -> dict | None:
    """
    Retourne la prochaine question à afficher.
    
    Returns:
        La question suivante ou None si le questionnaire est terminé.
    """
    for question in template["questions"]:
        qid = question["id"]
        
        # Question déjà répondue
        if qid in answers:
            continue
        
        # Vérifier les conditions
        if should_show_question(question, answers):
            return question
    
    return None


def get_all_visible_questions(template: dict, answers: dict) -> list[dict]:
    """Retourne toutes les questions visibles avec l'état actuel des réponses."""
    visible = []
    for question in template["questions"]:
        if should_show_question(question, answers):
            visible.append({
                **question,
                "answered": question["id"] in answers,
                "answer": answers.get(question["id"])
            })
    return visible


def calculate_progress(template: dict, answers: dict) -> dict:
    """Calcule la progression du questionnaire."""
    visible = get_all_visible_questions(template, answers)
    answered = sum(1 for q in visible if q["answered"])
    total = len(visible)
    
    return {
        "answered": answered,
        "total": total,
        "percentage": round(answered / total * 100) if total > 0 else 0
    }


def render_output(template_str: str, answers: dict) -> str:
    """
    Rendu simple d'un template avec les réponses.
    
    Supporte:
    - {{variable}} : remplacement simple
    - {% if variable %}...{% endif %} : conditionnel basique
    """
    import re
    
    result = template_str
    
    # Traitement des conditionnels {% if var %}...{% endif %}
    pattern = r'\{%\s*if\s+(\w+)\s*%\}(.*?)\{%\s*endif\s*%\}'
    
    def replace_conditional(match):
        var_name = match.group(1)
        content = match.group(2)
        if answers.get(var_name):
            return content
        return ""
    
    result = re.sub(pattern, replace_conditional, result, flags=re.DOTALL)
    
    # Remplacement des variables {{var}}
    for key, value in answers.items():
        if isinstance(value, list):
            value = ", ".join(value)
        result = result.replace(f"{{{{{key}}}}}", str(value) if value else "")
    
    return result.strip()


def generate_outputs(template: dict, answers: dict) -> list[dict]:
    """Génère tous les outputs définis dans le template."""
    outputs = []
    
    for output_def in template.get("outputs", []):
        rendered = render_output(output_def["template"], answers)
        outputs.append({
            "type": output_def["type"],
            "name": output_def.get("name", output_def["type"]),
            "content": rendered
        })
    
    return outputs
