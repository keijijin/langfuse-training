# モジュール 5-1: セルフホスト構築

## 学習目標

- Docker Compose でLangfuseの全コンポーネントをデプロイできる
- 各データストアの役割と設定を理解する
- Podman Compose環境でのハンズオンができる
- 本番運用に必要な設定（TLS、バックアップ、監視）を行える

---

## 1. アーキテクチャ全体像

```mermaid
graph TD
    Client["🖥️ SDK / ブラウザ"]
    Client -->|"HTTPS :3000"| Web["🌐 Langfuse Web<br/>Next.js + tRPC + REST API"]
    Client -->|"HTTPS :9090"| MinIO["📦 MinIO<br/>メディアダウンロード"]

    Web -->|"SQL"| PG["🐘 PostgreSQL<br/>設定・ユーザー・プロンプト"]
    Web -->|"HTTP :8123"| CH["📊 ClickHouse<br/>トレース・スコア（OLAP）"]
    Web -->|"Redis Protocol"| Redis["⚡ Redis<br/>キャッシュ + キュー"]
    Web -->|"S3 API"| MinIO

    Redis -->|"BullMQ Jobs"| Worker["⚙️ Langfuse Worker<br/>Ingestion / Eval / Export"]
    Worker --> PG
    Worker --> CH
    Worker --> MinIO

    style Web fill:#dbeafe,stroke:#2563eb
    style Worker fill:#e0e7ff,stroke:#4f46e5
```

### コンポーネント一覧

| コンポーネント | 役割 | ポート |
|--------------|------|--------|
| **langfuse-web** | UI + API | 3000 |
| **langfuse-worker** | 非同期処理 | 3030 (internal) |
| **PostgreSQL** | OLTP（設定系） | 5432 |
| **ClickHouse** | OLAP（分析系） | 8123, 9000 |
| **Redis** | キャッシュ + ジョブキュー | 6379 |
| **MinIO** | S3互換オブジェクトストレージ | 9000, 9001 |

---

## 2. Docker Compose デプロイ

### 前提条件

- Docker 24+ / Podman 4+ 
- RAM: 8GB以上（推奨16GB）
- ディスク: 10GB以上
- podman-compose 1.0.6+ （Podman使用時）

### 手順

```bash
# 1. リポジトリクローン
git clone https://github.com/langfuse/langfuse.git
cd langfuse

# 2. 環境変数設定
cp .env.prod.example .env
```

### 最小限の .env 設定

```bash
# 必須セキュリティ設定
NEXTAUTH_SECRET=$(openssl rand -base64 32)
SALT=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
NEXTAUTH_URL=http://localhost:3000

# データベース
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/postgres
POSTGRES_PASSWORD=your-secure-password

# ClickHouse
CLICKHOUSE_PASSWORD=your-clickhouse-password

# Redis
REDIS_AUTH=your-redis-password

# MinIO
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=your-minio-password

# 初期ユーザー（オプション）
LANGFUSE_INIT_USER_EMAIL=admin@example.com
LANGFUSE_INIT_USER_NAME=Admin
LANGFUSE_INIT_USER_PASSWORD=secure-password-123
```

### 起動

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d

# ログ確認
docker compose logs -f langfuse-web
docker compose logs -f langfuse-worker

# ヘルスチェック
curl http://localhost:3000/api/public/health
```

---

## 3. Podman Compose 固有の設定

### ClickHouse のパーミッション問題

```bash
# UID 101 のマッピングが必要な場合
podman unshare chown 101:101 $(podman volume inspect langfuse_clickhouse_data --format '{{.Mountpoint}}')
podman unshare chown 101:101 $(podman volume inspect langfuse_clickhouse_logs --format '{{.Mountpoint}}')
```

### レジストリ設定

```toml
# ~/.config/containers/registries.conf
unqualified-search-registries = ["docker.io", "docker.langfuse.com"]

[[registry]]
location = "docker.langfuse.com"
insecure = false
```

### Rootless Podman のネットワーク

```bash
# slirp4netns がデフォルト。pasta に切り替えると安定する場合あり
podman system connection default --identity ~/.ssh/id_ed25519
```

---

## 4. 本番向け設定

### TLS/HTTPS

リバースプロキシ（Nginx / Caddy / Traefik）を前段に配置：

```nginx
# nginx.conf
server {
    listen 443 ssl;
    server_name langfuse.example.com;

    ssl_certificate /etc/ssl/certs/langfuse.crt;
    ssl_certificate_key /etc/ssl/private/langfuse.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

### バックアップ

```bash
#!/bin/bash
# PostgreSQL バックアップ
docker compose exec postgres pg_dump -U postgres postgres | gzip > backup_pg_$(date +%Y%m%d).sql.gz

# ClickHouse バックアップ
docker compose exec clickhouse clickhouse-client --query "BACKUP DATABASE default TO Disk('backups', 'backup_$(date +%Y%m%d)')"

# MinIO バックアップ（mc CLI使用）
mc mirror local/langfuse /backups/minio/$(date +%Y%m%d)/
```

### リソース制限

```yaml
# docker-compose.override.yml
services:
  langfuse-web:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "2"
  langfuse-worker:
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: "4"
  clickhouse:
    deploy:
      resources:
        limits:
          memory: 4G
```

---

## 5. スケーリング

### 水平スケーリング

| コンポーネント | スケール方法 |
|--------------|-------------|
| langfuse-web | レプリカ増加 + ロードバランサー |
| langfuse-worker | レプリカ増加（キュー分散） |
| PostgreSQL | Read replica |
| ClickHouse | クラスター化 |
| Redis | Sentinel / Cluster |

### Kubernetes (Helm)

```bash
helm repo add langfuse https://langfuse.github.io/langfuse-k8s
helm install langfuse langfuse/langfuse \
  --set web.replicaCount=3 \
  --set worker.replicaCount=2 \
  --set postgresql.enabled=true \
  --set clickhouse.enabled=true \
  --set redis.enabled=true
```

---

## 6. アップグレード

```bash
# イメージの更新
docker compose pull

# ローリング再起動
docker compose up -d --no-deps langfuse-worker
docker compose up -d --no-deps langfuse-web

# マイグレーション（web起動時に自動実行）
# LANGFUSE_AUTO_POSTGRES_MIGRATION_DISABLED=false (デフォルト)
```

---

## 確認問題

1. Langfuseの5つのコンポーネントとその役割を説明してください
2. PostgreSQLとClickHouseの使い分けの理由は？
3. Podman環境でClickHouseが起動しない場合の一般的な原因は？
4. 本番環境で最低限必要なセキュリティ設定は？
5. Worker をスケールアウトする際の考慮点は？

---

## 次のステップ

[モジュール 5-2: アーキテクチャ深掘り](./5-2-architecture.md) に進みましょう。
