"""Dynamic questionnaire engine."""

import yaml
from pathlib import Path
from typing import Any


def load_template(template_name: str) -> dict:
    """Load a YAML template."""
    path = Path(__file__).parent / "templates" / f"{template_name}.yaml"
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def evaluate_condition(condition: dict, answers: dict) -> bool:
    """
    Evaluate a condition to determine whether a question should be displayed.

    Supported operators:
    - equals: exact match
    - not_equals: different from
    - contains: present in a list (for multi_choice)
    - not_contains: absent from a list
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
    """Determine whether a question should be displayed based on conditions."""
    conditions = question.get("conditions", [])
    
    if not conditions:
        return True
    
    # All conditions must be true (AND)
    return all(evaluate_condition(c, answers) for c in conditions)


def get_next_question(template: dict, answers: dict) -> dict | None:
    """
    Return the next question to display.

    Returns:
        The next question or None if the questionnaire is complete.
    """
    for question in template["questions"]:
        qid = question["id"]
        
        # Question already answered
        if qid in answers:
            continue
        
        # Check conditions
        if should_show_question(question, answers):
            return question
    
    return None


def get_all_visible_questions(template: dict, answers: dict) -> list[dict]:
    """Return all visible questions with the current answer state."""
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
    """Calculate questionnaire progress."""
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
    Simple rendering of a template with answers.

    Supports:
    - {{variable}}: simple replacement
    - {% if variable %}...{% endif %}: basic conditional
    """
    import re
    
    result = template_str
    
    # Handle conditionals: {% if var %}...{% endif %}
    pattern = r'\{%\s*if\s+(\w+)\s*%\}(.*?)\{%\s*endif\s*%\}'
    
    def replace_conditional(match):
        var_name = match.group(1)
        content = match.group(2)
        if answers.get(var_name):
            return content
        return ""
    
    result = re.sub(pattern, replace_conditional, result, flags=re.DOTALL)
    
    # Replace variables: {{var}}
    for key, value in answers.items():
        if isinstance(value, list):
            value = ", ".join(value)
        result = result.replace(f"{{{{{key}}}}}", str(value) if value else "")
    
    return result.strip()


def generate_outputs(template: dict, answers: dict) -> list[dict]:
    """Generate all outputs defined in the template."""
    outputs = []
    
    for output_def in template.get("outputs", []):
        rendered = render_output(output_def["template"], answers)
        outputs.append({
            "type": output_def["type"],
            "name": output_def.get("name", output_def["type"]),
            "content": rendered
        })
    
    return outputs
