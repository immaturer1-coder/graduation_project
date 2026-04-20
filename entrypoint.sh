#!/bin/bash
set -e

# Rails特有の問題: サーバー起動用のPIDファイルが残っていたら削除する
# 提示されたDockerfileのWORKDIRが /app なので、それに合わせています
rm -f /app/tmp/pids/server.pid

# DockerfileのCMDで渡されたコマンド（rails server）を最後に実行する
exec "$@"