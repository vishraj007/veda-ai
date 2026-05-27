#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies using root package-lock.json
npm install

# Build the shared packages and Express server
npx turbo run build --filter=@vedaai/server --filter=@vedaai/shared

# Download Chrome browser for Puppeteer to run headlessly on Render
npx puppeteer browsers install chrome
