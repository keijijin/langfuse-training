"""
Langfuse Training - Level 1: Hello Langfuse
最初のトレースを送信するサンプルスクリプト

事前準備:
  pip install langfuse
  export LANGFUSE_PUBLIC_KEY="pk-..."
  export LANGFUSE_SECRET_KEY="sk-..."
  export LANGFUSE_HOST="http://localhost:3000"
"""

from langfuse import Langfuse, observe


@observe(name="hello-langfuse")
def hello(message: str) -> dict:
    """最もシンプルなトレース"""
    return {"response": f"Welcome to LLM observability! (入力: {message})"}


def main():
    langfuse = Langfuse()

    langfuse.auth_check()
    print("✅ Langfuseへの接続に成功しました")

    result = hello("Hello, Langfuse!")
    langfuse.flush()

    print(f"✅ トレースを送信しました")
    print(f"   結果: {result}")
    print("   Langfuse UI の Traces 画面で確認してください")


if __name__ == "__main__":
    main()
