#!/bin/sh
# 動画ファイルを public/videos/ にシンボリックリンクするスクリプト

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBAPP_DIR="$(dirname "$SCRIPT_DIR")"
TRAINING_DIR="$(dirname "$WEBAPP_DIR")"
VIDEO_DIR="$WEBAPP_DIR/public/videos"

mkdir -p "$VIDEO_DIR"

link_video() {
  local level="$1"
  local filename="$2"
  local src="$TRAINING_DIR/$level/$filename"
  local dst="$VIDEO_DIR/$filename"

  if [ -f "$src" ]; then
    if [ ! -e "$dst" ]; then
      ln -s "$src" "$dst"
      echo "✓ リンク作成: $filename"
    else
      echo "- 既存: $filename"
    fi
  else
    echo "⚠ 動画が見つかりません: $src"
  fi
}

link_video "level-1" "Langfuse_マスター_レベル1__基礎.mp4"
link_video "level-2" "Langfuse__本格的なLLMトレーシング.mp4"
link_video "level-3" "Langfuseマスター__継続的品質改善.mp4"
link_video "level-4" "Langfuse_Level_4__本番運用設計.mp4"
link_video "level-5" "LangfuseマスタリーLv5__設計図.mp4"

echo ""
echo "セットアップ完了"
