#!/bin/sh
set -e

MODEL="${WHISPER_MODEL:-base.en}"
MODELS_DIR="${WHISPER_MODELS_DIR:-/models}"
MODEL_FILE="${MODELS_DIR}/ggml-${MODEL}.bin"

mkdir -p "$MODELS_DIR"

if [ ! -f "$MODEL_FILE" ]; then
  echo "Downloading whisper.cpp model: ${MODEL}"
  curl -fsSL "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${MODEL}.bin" \
    -o "$MODEL_FILE"
fi

exec whisper-server \
  --host 0.0.0.0 \
  --port "${WHISPER_PORT:-8080}" \
  --convert \
  -m "$MODEL_FILE" \
  "$@"
