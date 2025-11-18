from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from .models.codegen_schema import (
    CodeGeneration,
    ExtraGeneration,
    GenerateTestsRequest,
    GenerateTestsResponse,
    GenerateDocsRequest,
    GenerateDocsResponse,
    QualityReportRequest,
    QualityReportResponse,
)
from .routes.codegen import generate_code
from .routes.generate_tests import generate_tests
from .routes.generate_docs import generate_docs  # type: ignore[import-not-found]
from .routes.quality_report import generate_quality_report  # type: ignore[import-not-found]

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@api_v1_router.post("/generate-docs", response_model=GenerateDocsResponse)
async def generate_docs_endpoint(req: GenerateDocsRequest):
    return generate_docs(req)


@api_v1_router.post("/quality-report", response_model=QualityReportResponse)
async def quality_report_endpoint(req: QualityReportRequest):
    return generate_quality_report(req)

# Mount the API v1 router
app.include_router(api_v1_router)




