from fastapi import FastAPI, APIRouter
from backend.models.codegen_schema import CodeGeneration, ExtraGeneration, GenerateTestsRequest, GenerateTestsResponse
from backend.routes.codegen import generate_code
from backend.routes.generate_tests import generate_tests

app = FastAPI()

# Create API v1 router
api_v1_router = APIRouter(prefix="/api/v1", tags=["api-v1"])

@app.get("/")
def read_root():
    return {"status": "Backend is running 🚀"}

@app.post("/generate", response_model=CodeGeneration)
async def generate(req: CodeGeneration):
    return generate_code(req)

# Register generate-tests endpoint under /api/v1
@api_v1_router.post("/generate-tests", response_model=GenerateTestsResponse)
async def generate_tests_endpoint(req: GenerateTestsRequest):
    return generate_tests(req)

# Mount the API v1 router
app.include_router(api_v1_router)

# @app.post("/extras", response_model=ExtraGeneration)
# async def generate_extras_endpoint(req: CodeGeneration):
#     if not req.generated_code:
#         return {"error": "You must provide code in `generated_code`"}
#     return generate_extras(req.generated_code, req.language)



