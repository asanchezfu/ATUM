from backend.models.codegen_schema import CodeGeneration, ExtraGeneration, QualityReport, GenerateTestsRequest, GenerateTestsResponse
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


def generate_tests(req: GenerateTestsRequest) -> GenerateTestsResponse:
    testPrompt = f"""
    You are a professional {req.language} test engineer.
    Generate comprehensive unit tests for the following code using {req.framework}.

    Code to test:
    {req.code}

    Requirements:
    - Return ONLY {req.framework} test code (no explanations, no markdown).
    - Generate at least 3-5 test cases covering different scenarios.
    - Include edge cases and error handling tests.
    - Follow {req.framework} best practices and conventions.
    - The tests must be runnable and complete.
    - Use appropriate assertions and test structure for {req.framework}.
    """

    tests = queryOllama("mistral", testPrompt)

    return GenerateTestsResponse(
        ok=True,
        tests=tests.strip(),
        language=req.language,
        framework=req.framework,
        notes=[f"Tests generated using {req.framework} for {req.language}"]
    )

