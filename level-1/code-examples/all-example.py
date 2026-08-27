"""Level 1 総合演習: 会話ボットのトレース"""
from langfuse import Langfuse, observe
import time

langfuse = Langfuse()


@observe(name="knowledge-search")
def search_knowledge(query: str) -> list[str]:
    """検索フェーズ（Spanとして記録）"""
    time.sleep(0.1)
    knowledge = {
        "観光": ["浅草寺", "東京タワー", "渋谷スクランブル"],
        "アクセス": ["東京メトロ銀座線 浅草駅から徒歩5分"],
    }
    for key, values in knowledge.items():
        if key in query:
            return values
    return ["情報なし"]


@observe(name="response-generation", as_type="generation")
def generate_response(question: str, context: list[str]) -> str:
    """生成フェーズ（Generationとして記録）"""
    return f"おすすめは: {', '.join(context)} です。"


@observe(name="chat-turn")
def chat_turn(message: str) -> str:
    """1ターンの会話（ネストされたSpan/Generationを含むTrace）"""
    results = search_knowledge(message)
    response = generate_response(message, results)
    return response


# === 実行 ===
print("ターン1:")
r1 = chat_turn("東京の観光スポットを教えて")
print(f"  🤖 {r1}")

print("ターン2:")
r2 = chat_turn("浅草寺へのアクセス方法は？")
print(f"  🤖 {r2}")

langfuse.flush()

print("\n✅ トレースを送信しました")
print("Langfuse UIで以下を確認してください:")
print("  1. Tracing画面 → 2つのトレースの詳細")
print("  2. Trace詳細 → Observation の階層構造（search → generation）")