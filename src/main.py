from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from .agent import graph
from dotenv import load_dotenv

load_dotenv()

class SourceFile(BaseModel):
    name: str
    path: str
    content: str

class RunSuiteRequest(BaseModel):
    base_url: str
    source_code: List[SourceFile]

app = FastAPI()

@app.post("/run")
async def run_suite(req: RunSuiteRequest):
    code_str = "\n".join(file.content for file in req.source_code)

    inputs = {
        "base_url": req.base_url,
        "source_code": code_str
    }

    state = graph.invoke(inputs)

    return {
        "status": "success",
        # "test_file": "e2e/tests/generated.spec.ts",
        # "test_code": state.get("test_code"),
        # "test_result": state.get("test_result"),
        "summary": state.get("summary"),  # ✅ สรุปจาก LLM
    }

