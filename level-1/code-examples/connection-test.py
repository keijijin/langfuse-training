"""Langfuse接続テスト"""
from langfuse import Langfuse, observe

@observe(name="connection-test")
def send_test_trace():
    return "test OK"


def test_connection():
    try:
        langfuse = Langfuse()
        langfuse.auth_check()
        print("✅ Langfuseへの接続に成功しました！")

        result = send_test_trace()
        langfuse.flush()
        print(f"✅ テストトレースを送信しました (結果: {result})")

    except Exception as e:
        print(f"❌ 接続エラー: {e}")
        print("\n確認事項:")
        print("  - LANGFUSE_PUBLIC_KEY が設定されているか")
        print("  - LANGFUSE_SECRET_KEY が設定されているか")
        print("  - LANGFUSE_HOST が正しいか (例: http://localhost:3000)")
        print("  - ネットワーク接続があるか")

if __name__ == "__main__":
    test_connection()