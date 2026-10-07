#!/usr/bin/env sh
# Chạy website Puni Tea trên Mac/Linux:  ./chay-web.sh
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Chưa có Node.js trên máy này. Tải bản LTS tại https://nodejs.org rồi chạy lại."
  exit 1
fi

exec node scripts/chay-web.mjs "$@"
