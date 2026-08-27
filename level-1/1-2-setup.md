# モジュール 1-2: 環境セットアップ

## 学習目標

- Langfuse Cloud または ローカル環境をセットアップできる
- プロジェクトとAPIキーを作成できる
- 最初のトレースをLangfuseに送信し、UIで確認できる

---

## 1. 環境の選択

トレーニングでは2つの方法でLangfuseを利用できます。
**初学者にはオプションAを推奨**します。

| オプション | 推奨レベル | メリット |
|-----------|-----------|---------|
| A: Langfuse Cloud | Level 1〜3 | セットアップ不要、即座に開始 |
| B: ローカル（Podman Compose） | Level 4〜5 | 完全コントロール、オフライン可 |

---

## 2. オプションA: Langfuse Cloud セットアップ

### 2.1 アカウント作成

1. https://cloud.langfuse.com にアクセス
2. 「Sign Up」をクリック
3. メールアドレスとパスワードを設定（またはGitHub/Google認証）
4. メール認証を完了

### 2.2 組織とプロジェクトの作成

1. 初回ログイン時に**組織（Organization）**が自動作成されます
2. 「New Project」をクリック
3. プロジェクト名を入力（例: `my-first-project`）
4. 「Create」をクリック

### 2.3 APIキーの取得

1. プロジェクト画面で「Settings」→「API Keys」を開く
2. 「Create API Key」をクリック
3. 以下の2つのキーをメモする：
   - **Public Key** (`pk-...`): トレース送信に使用
   - **Secret Key** (`sk-...`): 管理API操作に使用

> ⚠️ Secret Keyは一度しか表示されません。安全な場所に保管してください。

---

## 3. オプションB: ローカル環境セットアップ（Podman Compose）

### 3.1 前提条件

```bash
# Podman のバージョン確認（4.x以上が必要）
podman --version

# podman-compose のインストール（未導入の場合）
pip install podman-compose
# または
brew install podman-compose
```

### 3.2 Langfuseの起動

```bash
# リポジトリのクローン
git clone https://github.com/langfuse/langfuse.git
cd langfuse

# 環境変数の設定（最小構成）
cat > .env <<'EOF'
NEXTAUTH_SECRET=my-training-secret
SALT=my-training-salt
ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000
NEXTAUTH_URL=http://localhost:3000
EOF

# Podman Compose で起動
podman-compose -f docker-compose.yml up -d

# 起動確認（全サービスがhealthyになるまで1〜2分待つ）
podman-compose -f docker-compose.yml ps
```

### 3.3 初期ユーザーの作成

自動プロビジョニングを使う場合、`.env` に追加：

```bash
LANGFUSE_INIT_ORG_ID=training-org
LANGFUSE_INIT_ORG_NAME=Training Organization
LANGFUSE_INIT_PROJECT_ID=training-project
LANGFUSE_INIT_PROJECT_NAME=Training Project
LANGFUSE_INIT_PROJECT_PUBLIC_KEY=pk-training-12345
LANGFUSE_INIT_PROJECT_SECRET_KEY=sk-training-12345
LANGFUSE_INIT_USER_EMAIL=admin@example.com
LANGFUSE_INIT_USER_NAME=Admin
LANGFUSE_INIT_USER_PASSWORD=password123
```

起動後、http://localhost:3000 にアクセスしてログインします。

### 3.4 トラブルシューティング

| 問題 | 対処 |
|------|------|
| ClickHouseが起動しない | `podman unshare chown 101:101 $(podman volume inspect langfuse_clickhouse_data -f '{{.Mountpoint}}')` |
| ポート競合 | `.env` で `CLICKHOUSE_HTTP_PORT=18123` 等のポートを変更 |
| イメージのpull失敗 | `podman pull docker.langfuse.com/langfuse/langfuse:4` を手動実行 |
| healthcheckが通らない | `podman-compose logs <service名>` でエラー確認 |

---

## 4. Python SDK のインストール

```bash
# 仮想環境の作成（推奨）
python -m venv .venv
source .venv/bin/activate

# Langfuse SDKのインストール
pip install langfuse

# OpenAI SDK（ハンズオンで使用）
pip install openai
```

---

## 5. 環境変数の設定

```bash
# Langfuse Cloud の場合
export LANGFUSE_PUBLIC_KEY="pk-..."     # 取得したPublic Key
export LANGFUSE_SECRET_KEY="sk-..."     # 取得したSecret Key
export LANGFUSE_HOST="https://cloud.langfuse.com"

# ローカル環境の場合
export LANGFUSE_PUBLIC_KEY="pk-training-12345"
export LANGFUSE_SECRET_KEY="sk-training-12345"
export LANGFUSE_HOST="http://localhost:3000"

# OpenAI（ハンズオンで使用）
export OPENAI_API_KEY="sk-..."
```

---

## 6. Hello World — 最初のトレースを送信する

### 6.1 最もシンプルなトレース

```python
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
```

### 6.2 OpenAI連携の最小例

```python
from langfuse import Langfuse, observe
from openai import OpenAI

langfuse = Langfuse()
client = OpenAI()


@observe(name="openai-chat", as_type="generation")
def ask(question: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは親切なアシスタントです。"},
            {"role": "user", "content": question},
        ],
    )
    return response.choices[0].message.content


answer = ask("Langfuseとは何ですか？一文で教えてください。")
print(answer)
langfuse.flush()
```

### 6.3 UIでの確認

1. Langfuse UI（Cloud: https://cloud.langfuse.com / ローカル: http://localhost:3000）を開く
2. 左メニューの Observability グループから「Tracing」をクリック
3. 送信したトレースが一覧に表示されていることを確認
4. トレースをクリックして詳細を確認：
   - 入力 / 出力
   - レイテンシ
   - モデル名・トークン数・コスト（OpenAI連携の場合）

---

## 7. 接続テストスクリプト

以下のスクリプトで環境が正しく設定されているか確認できます。

```python
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
```

---

## 確認問題

1. Langfuse CloudでAPIキーを取得する手順を説明してください
2. Public KeyとSecret Keyの用途の違いは何ですか？
3. `langfuse.flush()` は何のために呼び出しますか？
4. ローカル環境で ClickHouse が起動しない場合、最初に確認すべきことは何ですか？

---

## ハンズオン課題

1. 上記の「Hello World」スクリプトを実行し、Langfuse UIでトレースを確認してください
2. `input` と `output` の内容を自由に変更して、複数のトレースを送信してみてください
3. UIのフィルタ機能を使って、特定のトレースを検索してみてください

---

## 次のステップ

[モジュール 1-3: コアコンセプト](./1-3-core-concepts.md) に進み、Langfuseのデータモデルを深く理解しましょう。
