from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from .agent import agentloop

# --------- Request Schema ---------
class SourceFile(BaseModel):
    name: str
    path: str
    content: str

class RunSuiteRequest(BaseModel):
    base_url: str
    source_code: List[SourceFile]

# --------- FastAPI App ---------
app = FastAPI()

@app.post("/run-suite")
async def run_suite(req: RunSuiteRequest):
    """
    Orchestrator endpoint:
    - รับ input {"base_url": "...", "source_code": [ ... ]}
    - รวมเป็นข้อความเดียว
    - ส่งเข้า agentloop
    """
    # ✅ รวม source code เป็น string
    source_code_str = ""
    for f in req.source_code:
        source_code_str += f"\n--- FILE: {f.name} ({f.path}) ---\n{f.content}\n"

    # ✅ initial state (รวม base_url ด้วย)
    init_state = {
        "base_url": req.base_url,
        "source_code": source_code_str,
        "source_summary": "",
        "testcases": "",
        "spec_code": "",
        "run_logs": "",
        "attempts": [],
        "summary": ""
    }

    result = agentloop.invoke(init_state)

    return {
        "base_url": req.base_url,
        "summary": result["summary"]
    }


# from fastapi import FastAPI
# from pydantic import BaseModel
# from typing import List, Optional
# from .agent import agentloop

# # --------- Request Schema ---------
# class SourceFile(BaseModel):
#     name: str
#     path: str
#     content: str

# class RunSuiteRequest(BaseModel):
#     base_url: str
#     source_code: List[SourceFile]

# # --------- FastAPI App ---------
# app = FastAPI()

# @app.post("/run-suite")
# async def run_suite(req: RunSuiteRequest):
#     """
#     Orchestrator endpoint:
#     - รับ input {"base_url": "...", "source_code": [ ... ]}
#     - รวมเป็นข้อความเดียว
#     - ส่งเข้า agentloop
#     """
#     # ✅ สร้าง string ที่รวม base_url + source code
#     source_code_str = f"Base URL: {req.base_url}\n\n"
#     for f in req.source_code:
#         source_code_str += f"\n--- FILE: {f.name} ({f.path}) ---\n{f.content}\n"

#     # ✅ initial state
#     init_state = {
#         "source_code": source_code_str,
#         "testcases": "",
#         "spec_code": "",
#         "run_logs": "",
#         "attempts": [],
#         "summary": ""
#     }

#     result = agentloop.invoke(init_state)

#     return {
#         "base_url": req.base_url,
#         "summary": result["summary"]
#     }
