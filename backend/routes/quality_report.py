from dataclasses import dataclass
from statistics import mean
from typing import List, Tuple

from backend.models.codegen_schema import (
    QualityMetricResult,
    QualityReportRequest,
    QualityReportResponse,
)

COMPLEXITY_KEYWORDS = [
    "if",
    "for",
    "while",
    "case",
    "when",
    "catch",
    "elif",
    "else if",
    "switch",
    "&&",
    "||",
]
ERROR_HANDLING_KEYWORDS = ["catch", "except", "finally", "rescue", "ensure"]
TEST_HINTS = ["test", "assert", "expect", "pytest", "unittest", "describe"]
RISK_HINTS = ["todo", "fixme", "hack", "bug", "xxx"]


def generate_quality_report(req: QualityReportRequest) -> QualityReportResponse:
    code = (req.code or "").strip()
    if not code:
        return QualityReportResponse(
            ok=False,
            final_score=0,
            final_grade="F",
            metrics=[],
            suggestions=["Error: Code cannot be empty"],
        )

    lines = [line for line in code.splitlines()]
    stripped_lines = [line.strip() for line in lines if line.strip()]

    metrics: List[QualityMetricResult] = []

    metrics.append(_score_cyclomatic_complexity(stripped_lines))
    metrics.append(_score_defect_density(stripped_lines))
    metrics.append(_score_code_duplication(stripped_lines))
    metrics.append(_score_loc(stripped_lines))

    final_score = int(round(mean(metric.score for metric in metrics)))
    final_grade = _score_to_letter(final_score)
    suggestions = [
        metric.explanation for metric in metrics if metric.score < 80
    ] or [f"{req.language or 'Code'} quality is within acceptable range."]

    return QualityReportResponse(
        ok=True,
        final_score=final_score,
        final_grade=final_grade,
        metrics=metrics,
        suggestions=suggestions,
    )


def _score_cyclomatic_complexity(lines: List[str]) -> QualityMetricResult:
    complexity_hits = sum(
        line.lower().count(keyword) for keyword in COMPLEXITY_KEYWORDS for line in lines
    )
    complexity_score = max(0, min(100, 100 - (complexity_hits * 6)))
    letter = _score_to_letter(complexity_score)
    explanation = (
        f"Cyclomatic complexity detected {complexity_hits} branching points. "
        + (
            "Consider refactoring into smaller functions."
            if complexity_score < 70
            else "Structure looks manageable."
        )
    )
    return QualityMetricResult(
        name="Cyclomatic Complexity",
        score=complexity_score,
        letter=letter,
        explanation=explanation,
    )


def _score_defect_density(lines: List[str]) -> QualityMetricResult:
    risk_hits = sum(1 for line in lines if any(token in line.lower() for token in RISK_HINTS))
    density = risk_hits / max(1, len(lines))
    defect_score = max(0, int(100 - density * 500))
    letter = _score_to_letter(defect_score)
    explanation = (
        f"Limited risk markers ({risk_hits}) found."
        if risk_hits <= 1
        else f"Found {risk_hits} potential TODO/FIXME markers. Address them to reduce defects."
    )
    return QualityMetricResult(
        name="Defect Density",
        score=defect_score,
        letter=letter,
        explanation=explanation,
    )


def _score_code_duplication(lines: List[str]) -> QualityMetricResult:
    seen = set()
    duplicates = 0
    for line in [line for line in lines if len(line) > 3]:
        normalized = line.lower()
        if normalized in seen:
            duplicates += 1
        else:
            seen.add(normalized)
    duplication_ratio = duplicates / max(1, len(lines))
    duplication_score = max(0, int(100 - duplication_ratio * 600))
    letter = _score_to_letter(duplication_score)
    explanation = (
        "Minimal duplication detected."
        if duplicates == 0
        else f"Detected {duplicates} duplicated lines. Consolidate shared logic."
    )
    return QualityMetricResult(
        name="Code Duplication",
        score=duplication_score,
        letter=letter,
        explanation=explanation,
    )


def _score_loc(lines: List[str]) -> QualityMetricResult:
    loc = len(lines)
    if loc <= 100:
        loc_score = 95
    elif loc <= 250:
        loc_score = 80
    elif loc <= 500:
        loc_score = 65
    else:
        loc_score = max(40, 100 - int((loc - 500) / 5))
    letter = _score_to_letter(loc_score)
    explanation = f"Code spans {loc} significant lines. "
    explanation += (
        "Stay concise to ease reviews."
        if loc_score < 70
        else "Size looks manageable."
    )
    return QualityMetricResult(
        name="Lines of Code",
        score=loc_score,
        letter=letter,
        explanation=explanation,
    )


def _score_to_letter(score: int) -> str:
    if score >= 97:
        return "A+"
    if score >= 93:
        return "A"
    if score >= 90:
        return "A-"
    if score >= 87:
        return "B+"
    if score >= 83:
        return "B"
    if score >= 80:
        return "B-"
    if score >= 77:
        return "C+"
    if score >= 73:
        return "C"
    if score >= 70:
        return "C-"
    if score >= 60:
        return "D"
    return "F"

