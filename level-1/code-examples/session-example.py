from langfuse import Langfuse, observe

langfuse = Langfuse()


@observe(name="chat-turn")
def chat_turn(message: str) -> str:
    """各ターンが1つのTraceになる"""
    return f"回答: {message} への応答"


# 同じ session_id を使って複数ターンをグループ化
# （注: セッションIDの設定は langfuse.update_current_trace() で行う）
chat_turn("こんにちは")
chat_turn("天気を教えて")
langfuse.flush()