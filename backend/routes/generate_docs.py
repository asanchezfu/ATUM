from datetime import datetime

from backend.models.codegen_schema import GenerateDocsRequest, GenerateDocsResponse
from backend.services.llm_service import queryOllama


def generate_docs(req: GenerateDocsRequest) -> GenerateDocsResponse:
    """
    Generate markdown documentation for the provided code snippet.
    """
    code = (req.code or "").strip()
    if not code:
        return GenerateDocsResponse(
            ok=False,
            filename="",
            content="",
            notes=["Error: Code cannot be empty"],
        )

    language = (req.language or "the provided code").strip()
    project_name = (req.project_name or "Proyecto Atum").strip()
    filename = _build_filename(project_name)

    prompt = _build_prompt(code, language, project_name)

    try:
        documentation = queryOllama("mistral", prompt).strip()
        if not documentation:
            raise ValueError("Empty documentation response")

        return GenerateDocsResponse(
            ok=True,
            filename=filename,
            content=documentation,
            notes=["Documentation generated successfully"],
        )
    except Exception as exc:
        fallback_doc = generate_fallback_documentation(code, language, project_name)
        return GenerateDocsResponse(
            ok=True,
            filename=filename,
            content=fallback_doc,
            notes=[f"Generated via fallback method (LLM error: {exc})"],
        )


def _build_prompt(code: str, language: str, project_name: str) -> str:
    return f"""
You are a senior software architect. Produce a professional Markdown document in English
for a project named "{project_name}" describing the following {language} code:

```{language}
{code}
```

Follow this exact structure and keep the headings verbatim:

## Project Description
Summarize what the code solves, its core components, inputs, and outputs (max 2 short paragraphs).

## Instructions
Provide numbered, actionable steps to run the code, including prerequisites and commands.

## Use Cases
List practical scenarios or examples where this code is helpful. Use bullet points or short code snippets.

## Dependencies
Enumerate required configurations, environment variables, external services, or libraries.

Rules:
- Write everything in English only.
- Return only the Markdown content. Do not wrap the entire document in code fences.
- Be specific and avoid boilerplate sentences.
"""


def _build_filename(project_name: str) -> str:
    base = (
        "".join(ch.lower() if ch.isalnum() else "_" for ch in project_name) or "atum_project"
    )
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    return f"{base}_documentation_{timestamp}.md"


def generate_fallback_documentation(code: str, language: str, project_name: str) -> str:
    snippet = "\n".join(code.strip().splitlines()[:20])
    return f"""## Project Description
The project "{project_name}" contains core logic written in {language}. It processes inputs deterministically and exposes reusable routines you can integrate into larger services.

## Instructions
1. Prepare a working {language} toolchain or runtime.
2. Copy the snippet into a file (e.g., `main.{language[:2]}`) or incorporate it inside your project.
3. Install or configure any required dependencies mentioned in the code comments.
4. Execute the entry point with the appropriate interpreter or build command.

## Use Cases
- Baseline scenario: run the main routine with expected inputs to verify behavior.
- Extended scenario: embed the functions into a pipeline and add error handling.
- Testing scenario: pair this module with custom unit tests to validate edge cases.

## Dependencies
- Proper {language} runtime or compiler.
- Any third-party packages imported by the snippet.
- Environment variables or configuration files referenced by the code.

---
### Reference code
```
{snippet}
```
"""

