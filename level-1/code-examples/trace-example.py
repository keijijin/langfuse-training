from langfuse import Langfuse, observe

langfuse = Langfuse()


@observe(name="customer-support-qa")
def handle_support_query(question: str) -> str:
    # この関数の実行が自動的にTraceとして記録される
    return f"回答: {question} に対するポリシー情報"


handle_support_query("返品ポリシーを教えてください")
langfuse.flush()