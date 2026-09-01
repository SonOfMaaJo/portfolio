#!/usr/bin/env bash
# Rebuild du portfolio. nginx sert directement ./dist, donc un simple rebuild suffit.
set -e
cd "$(dirname "$0")"
npm install --no-audit --no-fund
npm run build
echo "OK : dist/ mis a jour (servi par nginx sur vnaoussi-djoumessi.com)."
