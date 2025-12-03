#!/bin/bash

# Auto-increment Deploy Script
# Automatically increments patch version and deploys

# Get commit message from first argument, or use default
MESSAGE="${1:-Update}"

echo "🚀 Starting deployment..."
echo "📝 Commit message: $MESSAGE"
echo ""

# Generate new version (auto-increments patch by default)
node generate-version-assets.js

echo ""
echo "📤 Pushing to git..."

# Git commands
git add .
git commit -m "$MESSAGE"
git push

echo ""
echo "✅ Deployed! Users will be notified within 30 seconds."
echo "🎉 Check your live site!"