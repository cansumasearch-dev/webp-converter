#!/bin/bash

# Get commit message from first argument, or use default
MESSAGE="${1:-Update}"

echo "🚀 Starting deployment..."
echo "📝 Commit message: $MESSAGE"

# Generate new version
node generate-version-assets.js

# Git commands
git add .
git commit -m "$MESSAGE"
git push

echo "✅ Deployed! Users will be notified within 30 seconds."