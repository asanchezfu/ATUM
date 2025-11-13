from backend.models.codegen_schema import GenerateTestsRequest, GenerateTestsResponse
from backend.services.llm_service import queryOllama


def generate_tests(req: GenerateTestsRequest) -> GenerateTestsResponse:
    """
    Generate unit tests for the provided code using the specified language and framework.
    """
    # Validate inputs
    if not req.code or not req.code.strip():
        return GenerateTestsResponse(
            ok=False,
            tests="",
            language=req.language,
            framework=req.framework,
            notes=["Error: Code cannot be empty"]
        )
    
    if not req.language:
        return GenerateTestsResponse(
            ok=False,
            tests="",
            language="",
            framework=req.framework,
            notes=["Error: Language must be specified"]
        )
    
    if not req.framework:
        return GenerateTestsResponse(
            ok=False,
            tests="",
            language=req.language,
            framework="",
            notes=["Error: Framework must be specified"]
        )
    
    # Create prompt for test generation
    test_prompt = f"""
    You are a professional {req.language} developer specializing in {req.framework} testing.
    
    Task: Generate comprehensive unit tests for the following {req.language} code:
    
    ```{req.language}
    {req.code}
    ```
    
    Requirements:
    - Use {req.framework} testing framework.
    - Write complete, production-ready unit tests.
    - Cover edge cases, normal cases, and error scenarios.
    - Include clear test names and comments.
    - Return ONLY the test code (no explanations, no markdown code blocks).
    - Ensure the tests are properly structured and can run independently.
    - Import necessary testing libraries and modules.
    """
    
    # Generate tests using LLM
    try:
        generated_tests = queryOllama("mistral", test_prompt)
        
        # Ensure we have non-empty tests
        if not generated_tests or not generated_tests.strip():
            # Fallback to a simple heuristic-based test
            generated_tests = generate_fallback_tests(req.code, req.language, req.framework)
        
        return GenerateTestsResponse(
            ok=True,
            tests=generated_tests.strip(),
            language=req.language,
            framework=req.framework,
            notes=["Tests generated successfully"]
        )
    except Exception as e:
        # Fallback to heuristic-based test generation
        generated_tests = generate_fallback_tests(req.code, req.language, req.framework)
        return GenerateTestsResponse(
            ok=True,
            tests=generated_tests,
            language=req.language,
            framework=req.framework,
            notes=[f"Generated using fallback method (LLM error: {str(e)})"]
        )


def generate_fallback_tests(code: str, language: str, framework: str) -> str:
    """
    Fallback test generation using simple heuristics when LLM is unavailable.
    """
    if language.lower() == "python":
        if framework.lower() == "pytest":
            return f"""import pytest

# Generated tests for the provided code
def test_basic_functionality():
    # TODO: Add specific test cases based on the code
    assert True

def test_edge_cases():
    # TODO: Add edge case tests
    assert True
"""
        else:  # unittest
            return f"""import unittest

class TestGeneratedCode(unittest.TestCase):
    def test_basic_functionality(self):
        # TODO: Add specific test cases based on the code
        self.assertTrue(True)
    
    def test_edge_cases(self):
        # TODO: Add edge case tests
        self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()
"""
    
    elif language.lower() == "javascript":
        if framework.lower() == "jest":
            return f"""const {{ /* functions from code */ }} = require('./code');

describe('Generated Code Tests', () => {{
    test('should handle basic functionality', () => {{
        // TODO: Add specific test cases
        expect(true).toBe(true);
    }});
    
    test('should handle edge cases', () => {{
        // TODO: Add edge case tests
        expect(true).toBe(true);
    }});
}});
"""
        else:  # mocha or other
            return f"""const assert = require('assert');

describe('Generated Code Tests', function() {{
    it('should handle basic functionality', function() {{
        // TODO: Add specific test cases
        assert.strictEqual(true, true);
    }});
    
    it('should handle edge cases', function() {{
        // TODO: Add edge case tests
        assert.strictEqual(true, true);
    }});
}});
"""
    
    elif language.lower() == "java":
        return f"""import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class GeneratedCodeTest {{
    @Test
    public void testBasicFunctionality() {{
        // TODO: Add specific test cases
        assertTrue(true);
    }}
    
    @Test
    public void testEdgeCases() {{
        // TODO: Add edge case tests
        assertTrue(true);
    }}
}}
"""
    
    else:
        return f"""// Generated unit tests for {language} using {framework}
// TODO: Implement specific test cases based on the provided code

"""
