#!/usr/bin/env bash
set -o errexit

echo ">>> Installing dependencies..."
bundle install
npm install

echo ">>> Building React frontend via esbuild..."

npm run build

echo ">>> Assets Precompile..."

RAILS_ENV=production bundle exec rails assets:precompile
RAILS_ENV=production bundle exec rails assets:clean

echo ">>> Running database migrations..."
RAILS_ENV=production bundle exec rails db:migrate

echo ">>> Build process completed successfully!"