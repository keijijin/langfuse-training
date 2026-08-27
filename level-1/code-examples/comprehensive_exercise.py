"""
Langfuse Training - Level 1: 総合演習
セッション、トレース、Observation、スコアを組み合わせた実践例

事前準備:
  pip install langfuse
  export LANGFUSE_PUBLIC_KEY="pk-..."
  export LANGFUSE_SECRET_KEY="sk-..."
  export LANGFUSE_HOST="http://localhost:3000"
"""

import time

from langfuse import Langfuse, observe


def simulate_search(query: str) -> list[str]:
    """検索のシミュレーション"""
    time.sleep(0.1)
    knowledge_base = {
        "観光": ["浅草寺", "東京タワー", "渋谷スクランブル交差点"],
        "グルメ": ["築地市場", "ラーメン横丁", "銀座の寿司"],
        "ショッピング": ["原宿竹下通り", "秋葉原", "表参道ヒルズ"],
    }
    for key, values in knowledge_base.items():
        if key in query:
            return values
    return ["情報が見つかりませんでした"]


def simulate_llm_response(query: str, context: list[str]) -> str:
    """LLM応答のシミュレーション"""
    time.sleep(0.2)
    return f"「{query}」についてお答えします。おすすめは: {', '.join(context)} です。"


@observe(name="knowledge-search")
def search_step(query: str) -> list[str]:
    return simulate_search(query)


@observe(name="response-generation", as_type="generation")
def generate_step(query: str, context: list[str]) -> str:
    return simulate_llm_response(query, context)


@observe(name="chat-turn")
def chat_turn(user_message: str) -> str:
    results = search_step(user_message)
    response = generate_step(user_message, results)
    return response


def run_conversation():
    langfuse = Langfuse()
    session_id = f"training-demo-{int(time.time())}"

    conversations = [
        {"message": "東京の観光スポットを教えて", "feedback": True},
        {"message": "おすすめのグルメは？", "feedback": True},
        {"message": "ショッピングはどこがいい？", "feedback": False},
    ]

    print(f"🎯 セッション開始: {session_id}\n")

    for turn_num, conv in enumerate(conversations, 1):
        user_message = conv["message"]
        print(f"--- ターン {turn_num} ---")
        print(f"👤 ユーザー: {user_message}")

        response_text = chat_turn(user_message)

        print(f"🤖 AI: {response_text}")
        print(f"   {'👍' if conv['feedback'] else '👎'} フィードバック")
        print()

    langfuse.flush()

    print("=" * 50)
    print("✅ 全トレースの送信が完了しました！")
    print(f"\nLangfuse UIで確認してください:")
    print(f"  📋 Traces: 3つのトレースが作成されました")
    print(f"  📊 各トレースに Span + Generation があります")
    print(f"\n確認ポイント:")
    print(f"  1. Traces 一覧で確認")
    print(f"  2. トレース詳細で Observation の階層構造")


if __name__ == "__main__":
    run_conversation()
