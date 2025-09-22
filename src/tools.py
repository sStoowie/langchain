from langchain_openai import ChatOpenAI
from langchain.tools import tool
import subprocess, re, os, json


@tool
def run_spec(data: str) -> str:
    """
    Run Playwright spec.
    Input: JSON string {"path": "e2e/tests/generated.spec.ts"}
    """
    try:
        obj = json.loads(data)
        path = obj.get("path", "e2e/tests/generated.spec.ts")
        result = subprocess.run(
            ["bunx", "playwright", "test", path, "--reporter", "list"],
            capture_output=True, text=True, timeout=120
        )
        return result.stdout + "\n" + result.stderr
    except Exception as e:
        return f"❌ ERROR in run_spec: {e}"


@tool
def generate_testcases(data: str) -> str:
    """
    Generate structured testcases JSON array from provided source code.
    Input: raw source code string หรือ JSON string ที่มี source_code field
    """
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    return llm.invoke(f"สร้างรายการ testcases (JSON array) จาก source code:\n{data}").content


@tool
def generate_test_code(data: str) -> str:
    """
    Generate Playwright (JS/TS) test code from testcase JSON.
    Input: JSON string ของ testcase
    """
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    return llm.invoke(f"สร้างโค้ด Playwright (JavaScript) จาก testcase:\n{data}").content


@tool
def analyze_result(data: str) -> str:
    """
    Analyze raw Playwright test results and summarize failures/pass details.
    Input: plain string ของ stdout/stderr
    """
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    return llm.invoke(f"วิเคราะห์ผลการทดสอบ:\n{data}").content


@tool
def write_spec_file(data: str) -> str:
    """
    Write a Playwright spec file to disk.
    Input: JSON string {"spec_code": "...", "path": "..."}
    """
    import json, re, os
    obj = json.loads(data)
    spec_code = obj.get("spec_code", "")
    path = obj.get("path", "e2e/tests/generated.spec.ts")

    clean = re.sub(r"^```[a-zA-Z]*\n|\n```$", "", spec_code.strip(), flags=re.M)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(clean)
    return f"✅ wrote {path}"

@tool
def final_summary(data: str) -> str:
    """
    Summarize results from multiple test attempts.
    Input: JSON string [{"ok": true/false, "logs": "..."}]
    """
    import json
    attempts = json.loads(data)
    passed = sum(1 for att in attempts if att.get("ok"))
    failed = len(attempts) - passed
    return json.dumps({
        "total": len(attempts),
        "passed": passed,
        "failed": failed
    }, ensure_ascii=False, indent=2)