from backend.models.codegen_schema import CodeGeneration, ExtraGeneration, QualityReport
from backend.services.llm_service import queryOllama, queryOpenAI

def generate_code(req: CodeGeneration) -> CodeGeneration:
    codePrompt = f"""
    You are a professional {req.language} programmer. 
    Task: {req.query}

    Requirements:
    - Return ONLY {req.language} code (no explanations, no markdown).
    - The code must be complete, production-ready, modular, and maintainable.
    - Include concise inline comments (using {req.language} comment syntax).
    - Ensure it compiles and runs without errors.
    """

    code = queryOllama("mistral", codePrompt)
    req.generated_code = code.strip()

    return req

