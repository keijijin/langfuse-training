"""
Langfuse Training - Level 1: OpenAI 統合の最小例
@observe デコレータで OpenAI 呼び出しを自動トレーシング

事前準備:
  pip install langfuse openai
  export LANGFUSE_PUBLIC_KEY="pk-..."
  export LANGFUSE_SECRET_KEY="sk-..."
  export LANGFUSE_HOST="http://localhost:3000"
  export OPENAI_API_KEY="sk-..."

Ollama (無料ローカルLLM) を使う場合:
  export OPENAI_BASE_URL="http://localhost:11434/v1"
  export OPENAI_API_KEY="ollama"
"""

from langfuse import Langfuse, observe
from openai import OpenAI


@observe(name="openai-chat", as_type="generation")
def ask(question: str) -> str:
    """OpenAI APIを呼び出し — Langfuseで自動トレース"""
    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは親切なアシスタントです。簡潔に回答してください。"},
            {"role": "user", "content": question},
        ],
        temperature=0.7,
        max_tokens=200,
    )
    return response.choices[0].message.content


def main():
    langfuse = Langfuse()

    try:
        answer = ask("Langfuseとは何ですか？")
        print(f"回答: {answer}")
    except Exception as e:
        print(f"エラー: {e}")
        print("\nOpenAI APIが利用できません。代替案:")
        print("  - Ollama: export OPENAI_BASE_URL='http://localhost:11434/v1'")
        return
    finally:
        langfuse.flush()

    print("\n✅ トレースが自動的にLangfuseに送信されました")
    print("   UI で以下を確認してください:")
    print("   - モデル名 (gpt-4o-mini)")
    print("   - トークン数 (input / output)")
    print("   - 推定コスト")
    print("   - レイテンシ")


if __name__ == "__main__":
    main()
