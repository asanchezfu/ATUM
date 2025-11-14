from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.models.codegen_schema import CodeGeneration, ExtraGeneration, GenerateTestsRequest, GenerateTestsResponse
from backend.routes.codegen import generate_code, generate_tests

app = FastAPI()

# Configure CORS to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Backend is running 🚀"}

@app.post("/generate", response_model=CodeGeneration)
async def generate(req: CodeGeneration):
    return generate_code(req)

@app.post("/generate-tests", response_model=GenerateTestsResponse)
async def generate_tests_endpoint(req: GenerateTestsRequest):
    return generate_tests(req)

# @app.post("/extras", response_model=ExtraGeneration)
# async def generate_extras_endpoint(req: CodeGeneration):
#     if not req.generated_code:
#         return {"error": "You must provide code in `generated_code`"}
#     return generate_extras(req.generated_code, req.language)



