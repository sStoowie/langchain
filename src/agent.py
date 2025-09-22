import os, json, re, subprocess
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any

# โหลด environment
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("❌ OPENAI_API_KEY not found")

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=api_key)

# ----------------------------
# Agent State
# ----------------------------
class AgentState(TypedDict):
    base_url: str
    source_code: str
    source_summary: str
    testcases: str
    spec_code: str
    run_logs: str
    attempts: List[Dict[str, Any]]
    summary: str

# ----------------------------
# Helper functions
# ----------------------------
def stream_invoke(prompt: str) -> str:
    print("\n--- Streaming Start ---\n")
    chunks = []
    for chunk in llm.stream(prompt):
        if chunk.content:
            print(chunk.content, end="", flush=True)
            chunks.append(chunk.content)
    print("\n--- Streaming End ---\n")
    return "".join(chunks)

def load_prompt(name: str, **kwargs) -> str:
    """โหลด system prompt จากไฟล์ .md ในโฟลเดอร์ system_prompts"""
    path = os.path.join("system_prompts", f"{name}.md")
    if not os.path.exists(path):
        raise FileNotFoundError(f"❌ Prompt file not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        template = f.read()
    return template.format(**kwargs)

# ----------------------------
# Workflow Nodes
# ----------------------------
def summarize_source(state: AgentState) -> AgentState:
    prompt = load_prompt("summarize_source", source_code=state["source_code"])
    state["source_summary"] = stream_invoke(prompt)
    return state

def generate_testcases(state: AgentState) -> AgentState:
    prompt = load_prompt("generate_testcases", source_summary=state["source_summary"])
    state["testcases"] = stream_invoke(prompt)
    return state

def generate_test_code(state: AgentState) -> AgentState:
    prompt = load_prompt(
        "generate_test_code",
        base_url=state["base_url"],
        source_summary=state["source_summary"],
        testcases=state["testcases"]
    )
    state["spec_code"] = stream_invoke(prompt)
    return state

def write_spec_file(state: AgentState) -> AgentState:
    path = "e2e/tests/generated.spec.ts"
    match = re.search(r"```(?:ts|typescript|js|javascript)\n(.*?)```", state["spec_code"], re.S)
    clean = match.group(1).strip() if match else state["spec_code"]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(clean)
    print(f"✅ Spec file written to {path}")
    return state

def run_spec(state: AgentState) -> AgentState:
    path = "e2e/tests/generated.spec.ts"
    try:
        result = subprocess.run(
            ["bunx", "playwright", "test", path, "--reporter", "list"],
            capture_output=True, text=True, timeout=120
        )
        state["run_logs"] = result.stdout + "\n" + result.stderr
        print("\n--- Playwright Run Logs ---\n")
        print(state["run_logs"])
    except Exception as e:
        state["run_logs"] = f"❌ ERROR in run_spec: {e}"
    return state

def analyze_result(state: AgentState) -> AgentState:
    logs = state["run_logs"]
    if "SyntaxError" in logs or "ReferenceError" in logs or "TypeError" in logs:
        analysis_type = "syntax_error"
    elif "toBeVisible" in logs or "toHaveClass" in logs or "strict mode violation" in logs:
        analysis_type = "assertion_fail"
    else:
        analysis_type = "other"

    prompt = load_prompt("analyze_result", analysis_type=analysis_type, logs=logs)
    analysis = stream_invoke(prompt)

    ok = "✓" in logs and "failed" not in logs.lower()
    state["attempts"].append({
        "ok": ok,
        "logs": logs,
        "analysis": analysis,
        "error_type": analysis_type
    })
    return state

def decide_next(state: AgentState) -> str:
    logs = state["run_logs"]
    if "SyntaxError" in logs or "ReferenceError" in logs or "TypeError" in logs:
        return "regen"
    if "toBeVisible" in logs or "toHaveClass" in logs or "strict mode violation" in logs:
        return "summarize"
    total_tests = logs.count("›")
    failed_tests = logs.count("✘")
    if failed_tests > total_tests // 2:
        return "regen"
    if len(state["attempts"]) >= 3:
        return "summarize"
    last = state["attempts"][-1]
    return "summarize" if last["ok"] else "regen"

def regenerate_spec(state: AgentState) -> AgentState:
    feedback = state["attempts"][-1]["analysis"]
    prompt = load_prompt(
        "regenerate_spec",
        source_summary=state["source_summary"],
        feedback=feedback,
        spec_code=state["spec_code"]
    )
    state["spec_code"] = stream_invoke(prompt)
    return state

def final_summary(state: AgentState) -> AgentState:
    passed = sum(1 for att in state["attempts"] if att.get("ok"))
    failed = len(state["attempts"]) - passed
    prompt = load_prompt(
        "final_summary",
        total=len(state["attempts"]),
        passed=passed,
        failed=failed,
        attempts=json.dumps(state["attempts"], ensure_ascii=False, indent=2)
    )
    state["summary"] = stream_invoke(prompt)
    print("\n✅ Final Summary:\n", state["summary"])
    return state

# ----------------------------
# Build Workflow
# ----------------------------
workflow = StateGraph(AgentState)
workflow.add_node("summarize_source", summarize_source)
workflow.add_node("generate_testcases", generate_testcases)
workflow.add_node("generate_test_code", generate_test_code)
workflow.add_node("write_spec_file", write_spec_file)
workflow.add_node("run_spec", run_spec)
workflow.add_node("analyze_result", analyze_result)
workflow.add_node("regen", regenerate_spec)
workflow.add_node("summarize", final_summary)

workflow.set_entry_point("summarize_source")
workflow.add_edge("summarize_source", "generate_testcases")
workflow.add_edge("generate_testcases", "generate_test_code")
workflow.add_edge("generate_test_code", "write_spec_file")
workflow.add_edge("write_spec_file", "run_spec")
workflow.add_edge("run_spec", "analyze_result")
workflow.add_conditional_edges("analyze_result", decide_next, {
    "regen": "regen",
    "summarize": "summarize",
})
workflow.add_edge("regen", "write_spec_file")
workflow.add_edge("summarize", END)

agentloop = workflow.compile()

# ----------------------------
# Main
# ----------------------------
if __name__ == "__main__":
    init_state: AgentState = {
        "base_url": "http://localhost:5174/login",
        "source_code": "",
        "source_summary": "",
        "testcases": "",
        "spec_code": "",
        "run_logs": "",
        "attempts": [],
        "summary": ""
    }
    final_state = agentloop.invoke(init_state)
