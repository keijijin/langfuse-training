from langfuse import Langfuse, observe

langfuse = Langfuse()


@observe(name="hello-langfuse")
def hello(message: str) -> str:
    """最もシンプルなトレース"""
    return f"Echo: {message}"


result = hello("Hello, Langfuse!")
langfuse.flush()

print(f"結果: {result}")
print("Langfuse UIで確認してください！")