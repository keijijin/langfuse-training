# モジュール 5-3: Public API活用

## 学習目標

- Langfuse REST APIの認証とエンドポイント体系を理解する
- APIを使ったカスタムダッシュボード/ツールを構築できる
- データパイプラインの自動化ができる

---

## 1. API概要

### 認証

```bash
# Basic認証: public_key:secret_key
curl -u "pk-...:sk-..." https://cloud.langfuse.com/api/public/traces
```

```python
import requests
from requests.auth import HTTPBasicAuth

auth = HTTPBasicAuth("pk-...", "sk-...")
response = requests.get(
    "https://cloud.langfuse.com/api/public/traces",
    auth=auth,
    params={"limit": 10},
)
```

### 主要エンドポイント

| カテゴリ | エンドポイント | メソッド |
|---------|-------------|---------|
| **Traces** | `/api/public/traces` | GET, POST |
| **Observations** | `/api/public/observations` | GET |
| **Scores** | `/api/public/scores` | GET, POST |
| **Prompts** | `/api/public/v2/prompts` | GET, POST |
| **Datasets** | `/api/public/v2/datasets` | GET, POST |
| **Dataset Items** | `/api/public/dataset-items` | GET, POST |
| **Dataset Runs** | `/api/public/dataset-run-items` | POST |
| **Sessions** | `/api/public/sessions` | GET |
| **Metrics** | `/api/public/metrics/daily` | GET |
| **Ingestion** | `/api/public/ingestion` | POST |
| **Health** | `/api/public/health` | GET |

---

## 2. データ取得パターン

### トレース一覧の取得

```python
import requests
from datetime import datetime, timedelta

BASE_URL = "https://cloud.langfuse.com"
AUTH = ("pk-...", "sk-...")

def get_traces(days_back: int = 7, limit: int = 100):
    from_timestamp = (datetime.now() - timedelta(days=days_back)).isoformat()

    response = requests.get(
        f"{BASE_URL}/api/public/traces",
        auth=AUTH,
        params={
            "fromTimestamp": from_timestamp,
            "limit": limit,
            "orderBy": "timestamp.desc",
        },
    )
    return response.json()["data"]
```

### ページネーション

```python
def get_all_traces(from_date: str):
    """全トレースをページネーションで取得"""
    all_traces = []
    page = 1

    while True:
        response = requests.get(
            f"{BASE_URL}/api/public/traces",
            auth=AUTH,
            params={
                "fromTimestamp": from_date,
                "limit": 100,
                "page": page,
            },
        )
        data = response.json()
        traces = data["data"]

        if not traces:
            break

        all_traces.extend(traces)
        page += 1

    return all_traces
```

### メトリクス取得

```python
def get_daily_metrics(days: int = 30):
    """日次メトリクスを取得"""
    response = requests.get(
        f"{BASE_URL}/api/public/metrics/daily",
        auth=AUTH,
        params={"traceName": "chat-response"},
    )
    return response.json()["data"]
```

---

## 3. カスタムツールの構築

### 品質レポート自動生成

```python
"""週次品質レポートを自動生成するスクリプト"""
from datetime import datetime, timedelta
import json

def generate_weekly_report():
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)

    # トレース取得
    traces = get_all_traces(start_date.isoformat())

    # 集計
    report = {
        "period": f"{start_date.date()} ~ {end_date.date()}",
        "total_traces": len(traces),
        "total_cost": sum(t.get("totalCost", 0) or 0 for t in traces),
        "avg_latency_ms": sum(t.get("latency", 0) or 0 for t in traces) / max(len(traces), 1),
        "error_count": sum(1 for t in traces if t.get("level") == "ERROR"),
        "models_used": list(set(
            obs.get("model") for t in traces
            for obs in t.get("observations", [])
            if obs.get("model")
        )),
    }

    # スコア集計
    scores = requests.get(
        f"{BASE_URL}/api/public/scores",
        auth=AUTH,
        params={"fromTimestamp": start_date.isoformat(), "limit": 1000},
    ).json()["data"]

    score_summary = {}
    for score in scores:
        name = score["name"]
        if name not in score_summary:
            score_summary[name] = []
        if score.get("value") is not None:
            score_summary[name].append(score["value"])

    report["scores"] = {
        name: {
            "count": len(values),
            "avg": sum(values) / len(values) if values else 0,
            "min": min(values) if values else 0,
            "max": max(values) if values else 0,
        }
        for name, values in score_summary.items()
    }

    return report
```

### Slack Bot 統合

```python
"""Slackコマンドでトレース情報を検索"""
from slack_bolt import App

app = App(token="xoxb-...")

@app.command("/langfuse-search")
def search_traces(ack, command, respond):
    ack()
    query = command["text"]

    traces = requests.get(
        f"{BASE_URL}/api/public/traces",
        auth=AUTH,
        params={"name": query, "limit": 5, "orderBy": "timestamp.desc"},
    ).json()["data"]

    blocks = []
    for trace in traces:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": (
                    f"*{trace['name']}*\n"
                    f"ID: `{trace['id']}`\n"
                    f"Cost: ${trace.get('totalCost', 0):.4f} | "
                    f"Latency: {trace.get('latency', 0)}ms"
                ),
            },
        })

    respond(blocks=blocks or [{"type": "section", "text": {"type": "mrkdwn", "text": "No traces found."}}])
```

---

## 4. データパイプライン自動化

### 定期データ同期（ETL）

```python
"""LangfuseデータをData Warehouseに同期"""
from datetime import datetime, timedelta
import pandas as pd

def sync_to_warehouse():
    yesterday = (datetime.now() - timedelta(days=1)).date().isoformat()

    # トレースを取得
    traces = get_all_traces(yesterday)

    # DataFrameに変換
    df = pd.DataFrame([{
        "trace_id": t["id"],
        "name": t["name"],
        "timestamp": t["timestamp"],
        "latency_ms": t.get("latency"),
        "cost_usd": t.get("totalCost"),
        "user_id": t.get("userId"),
        "session_id": t.get("sessionId"),
        "environment": t.get("environment"),
        "tags": json.dumps(t.get("tags", [])),
    } for t in traces])

    # Warehouseに書き込み（例: BigQuery）
    df.to_gbq("analytics.langfuse_traces", project_id="my-project", if_exists="append")

    print(f"✅ {len(df)} traces synced for {yesterday}")
```

### プロンプトの自動バックアップ

```python
def backup_prompts():
    """全プロンプトをGitリポジトリにバックアップ"""
    response = requests.get(f"{BASE_URL}/api/public/v2/prompts", auth=AUTH)
    prompts = response.json()["data"]

    for prompt in prompts:
        filename = f"prompts/{prompt['name']}_v{prompt['version']}.json"
        with open(filename, "w") as f:
            json.dump(prompt, f, indent=2, ensure_ascii=False)

    # Git commit
    os.system("git add prompts/ && git commit -m 'backup: prompts snapshot'")
```

---

## 5. OpenAPI仕様の活用

### API仕様の取得

Langfuseの API は Fern + OpenAPI で定義されています。

```bash
# OpenAPI仕様をダウンロード
curl https://cloud.langfuse.com/api/public/openapi.json > langfuse-openapi.json

# クライアント自動生成（例）
npx openapi-typescript langfuse-openapi.json -o ./src/langfuse-api.d.ts
```

---

## 確認問題

1. Langfuse APIの認証方法は？
2. 大量のトレースを取得する際、ページネーションをどう実装しますか？
3. 週次レポートを自動化する際、何のメトリクスを含めるべきですか？
4. OpenAPI仕様を使ったクライアント生成のメリットは？

---

## 次のステップ

[モジュール 5-4: カスタム評価パイプライン](./5-4-custom-evaluation.md) に進みましょう。
