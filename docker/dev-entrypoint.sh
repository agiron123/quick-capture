#!/bin/sh
set -e

npm run build --workspace=@quick-capture/shared
exec "$@"
