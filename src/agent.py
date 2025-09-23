from typing import TypedDict, List, Dict
from pathlib import Path
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from .prompt import MAIN_TASK, GENERATE_TESTCODE_PROMPT


class TestState(TypedDict, total=False):
    base_url: str
    source_code: str
    test_cases: List[Dict]
    test_code: str


# ---------- Nodes ----------
def analyze_source(state: TestState) -> TestState:
    llm = ChatOpenAI(model="gpt-4.1", temperature=0, streaming=True)
    prompt = f"{MAIN_TASK}\n\nSource:\n{state['source_code']}"

    chunks = []
    for chunk in llm.stream(prompt):   # ✅ stream จริง ๆ
        print(chunk.content, end="", flush=True)
        chunks.append(chunk.content)

    state["test_cases"] = [{"desc": "".join(chunks)}]
    return state



def generate_testcode(state: TestState) -> TestState:
    """สร้าง playwright test จาก test case และเขียนไฟล์ออกมา"""
    llm = ChatOpenAI(model="gpt-4.1", temperature=0)

    prompt = (
        GENERATE_TESTCODE_PROMPT
        .replace("{{base_url}}", str(state.get("base_url")))
        .replace("{{cases}}", str(state.get("test_cases")))
        .replace("{{source_code}}", state["source_code"])
    )

    response = llm.invoke(prompt)
    state["test_code"] = response.content.strip()

    # เขียนไฟล์
    test_file = Path("e2e/tests/generated.spec.ts")
    test_file.parent.mkdir(parents=True, exist_ok=True)
    test_file.write_text(state["test_code"], encoding="utf-8")

    return state


# ---------- Build workflow ----------
graph = (
    RunnablePassthrough()
    | RunnableLambda(analyze_source)
    | RunnableLambda(generate_testcode)
)
