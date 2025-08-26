from fastapi import FastAPI
from backend.models.codegen_schema import CodeGeneration, ExtraGeneration
from backend.routes.codegen import generate_code

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "Backend is running 🚀"}

@app.post("/generate", response_model=CodeGeneration)
async def generate(req: CodeGeneration):
    return generate_code(req)

# @app.post("/extras", response_model=ExtraGeneration)
# async def generate_extras_endpoint(req: CodeGeneration):
#     if not req.generated_code:
#         return {"error": "You must provide code in `generated_code`"}
#     return generate_extras(req.generated_code, req.language)



